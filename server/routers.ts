import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getUserPreferences, upsertUserPreferences, createNewsletter, getUserNewsletters, createAgentExecution, getAgentExecutionSteps, getAgentTemplates, createAgentTemplate, updateAgentTemplate, deleteAgentTemplate, getNewsletterById, updateAgentExecution, getDb } from "./db";
import { agentExecutions } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { sendNewsletterEmail } from "./_core/email";
import NewsletterAgent, { NewsletterGenerationParams } from "./agents/newsletterAgent";
import { generateEnhancedNewsletter, formatEnhancedContentAsHTML } from "./agents/enhancedContentGenerator";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  newsletter: router({
    // Get or create user preferences
    getPreferences: protectedProcedure.query(async ({ ctx }) => {
      return await getUserPreferences(ctx.user.id);
    }),

    // Update user preferences
    updatePreferences: protectedProcedure
      .input(
        z.object({
          topics: z.array(z.string()).optional(),
          tone: z.enum(["professional", "casual", "technical"]).optional(),
          contentLength: z.enum(["short", "medium", "long"]).optional(),
          newsSourcePreference: z.string().optional(),
          personalizationLevel: z.number().min(1).max(10).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const prefs: any = {};
        if (input.topics) prefs.topics = JSON.stringify(input.topics);
        if (input.tone) prefs.tone = input.tone;
        if (input.contentLength) prefs.contentLength = input.contentLength;
        if (input.newsSourcePreference) prefs.newsSourcePreference = input.newsSourcePreference;
        if (input.personalizationLevel) prefs.personalizationLevel = input.personalizationLevel;
        return await upsertUserPreferences(ctx.user.id, prefs);
      }),

    // Get user's generated newsletters
    getNewsletters: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ ctx, input }) => {
        return await getUserNewsletters(ctx.user.id, input.limit);
      }),

    // Start newsletter generation with agent
    generateNewsletter: protectedProcedure
      .input(
        z.object({
          topics: z.array(z.string()),
          tone: z.enum(["professional", "casual", "technical"]),
          contentLength: z.enum(["short", "medium", "long"]),
          newsSourcePreference: z.string(),
          personalizationLevel: z.number().min(1).max(10),
          language: z.enum(["english", "hindi", "bilingual"]).optional().default("bilingual"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          // Create agent
          const params: NewsletterGenerationParams = {
            userId: ctx.user.id,
            ...input,
          };

          const agent = new NewsletterAgent(ctx.user.id, params);
          const executionId = agent.getExecutionId();

          // Create execution record
          await createAgentExecution({
            id: executionId,
            userId: ctx.user.id,
            status: "pending",
            goal: agent.getState().goal,
            constraints: JSON.stringify(agent.getState().constraints),
            taskFlow: JSON.stringify([]),
          });

          // Execute agent asynchronously
          agent.execute().then(async (state) => {
            try {
              console.log(`Starting enhanced content generation for execution ${executionId}`);
              // Generate enhanced content with real data
              const generatedContent = await generateEnhancedNewsletter(input);
              console.log(`Content generated successfully for execution ${executionId}`);

              // Save newsletter
              const newsletterResult = await createNewsletter({
                userId: ctx.user.id,
                title: generatedContent.title,
                content: formatEnhancedContentAsHTML(generatedContent),
                summary: generatedContent.summary,
                topics: JSON.stringify(input.topics),
                agentExecutionId: executionId,
              });
              console.log(`Newsletter saved successfully: ${newsletterResult.id} for execution ${executionId}`);

              // Update execution status to completed
              await updateAgentExecution(executionId, { status: 'completed', completedAt: new Date() });

              console.log(`Newsletter generation completed successfully for execution ${executionId}`);
            } catch (error) {
              console.error(`Newsletter generation failed for execution ${executionId}:`, error);
              // Update execution status to failed
              await updateAgentExecution(executionId, { status: 'failed', errorMessage: error instanceof Error ? error.message : 'Unknown error' });
            }
          }).catch(error => {
            console.error(`Agent execution failed for ${executionId}:`, error);
            // Update execution status to failed
            updateAgentExecution(executionId, { status: 'failed', errorMessage: error instanceof Error ? error.message : 'Unknown error' }).catch(dbError => {
              console.error('Failed to update execution status:', dbError);
            });
          });

          return {
            executionId,
            status: "started",
            message: "Newsletter generation started",
          };
        } catch (error) {
          throw new Error(`Failed to start newsletter generation: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }),

    // Get agent execution status
    getExecutionStatus: protectedProcedure
      .input(z.object({ executionId: z.string() }))
      .query(async ({ input }) => {
        const steps = await getAgentExecutionSteps(input.executionId);
        const db = await getDb();
        let execution = null;
        if (db) {
          const result = await db.select().from(agentExecutions).where(eq(agentExecutions.id, input.executionId)).limit(1);
          execution = result.length > 0 ? result[0] : null;
        }
        return {
          executionId: input.executionId,
          stepCount: steps.length,
          steps,
          status: execution?.status || 'pending',
          completedAt: execution?.completedAt,
        };
      }),

    // Agent templates management
    listTemplates: protectedProcedure.query(async ({ ctx }) => {
      return await getAgentTemplates(ctx.user.id);
    }),
    createTemplate: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          prompt: z.string(),
          defaultParameters: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await createAgentTemplate({
          ...input,
          createdBy: ctx.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return { success: true };
      }),
    updateTemplate: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          updates: z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            prompt: z.string().optional(),
            defaultParameters: z.string().optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        await updateAgentTemplate(input.id, input.updates);
        return { success: true };
      }),
    deleteTemplate: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteAgentTemplate(input.id);
        return { success: true };
      }),

    // Send a generated newsletter via email
    sendNewsletter: protectedProcedure
      .input(
        z.object({
          newsletterId: z.number(),
          to: z.string().email(),
        })
      )
      .mutation(async ({ input }) => {
        const newsletter = await getNewsletterById(input.newsletterId);
        if (!newsletter) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Newsletter not found",
          });
        }
        await sendNewsletterEmail(input.to, newsletter.title, newsletter.content ?? "");
        return { success: true };
      }),

    // Generate PDF for newsletter
    generatePDF: protectedProcedure
      .input(z.object({ newsletterId: z.number() }))
      .mutation(async ({ input }) => {
        const newsletter = await getNewsletterById(input.newsletterId);
        if (!newsletter) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Newsletter not found",
          });
        }
        // Return HTML content that can be used to generate PDF on frontend
        return {
          html: newsletter.content,
          title: newsletter.title,
          filename: `${newsletter.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`
        };
      }),

    // Get newsletter for preview
    getNewsletterPreview: protectedProcedure
      .input(z.object({ newsletterId: z.number() }))
      .query(async ({ input }) => {
        const newsletter = await getNewsletterById(input.newsletterId);
        if (!newsletter) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Newsletter not found",
          });
        }
        return {
          id: newsletter.id,
          title: newsletter.title,
          content: newsletter.content,
          summary: newsletter.summary,
          createdAt: newsletter.createdAt,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;

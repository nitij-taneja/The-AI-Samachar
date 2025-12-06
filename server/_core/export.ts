import type { Express, Request, Response } from "express";
import puppeteer from "puppeteer";

// @ts-ignore - html-docx-js has no TypeScript definitions
import htmlDocx from "html-docx-js";
import { getDb } from "../db";
import { eq } from "drizzle-orm";
import { newsletters } from "../../drizzle/schema";

/**
 * Register export routes for newsletter PDF/DOCX generation.
 * GET /api/newsletter/:id/export?format=pdf|docx
 */
export function registerExportRoutes(app: Express): void {
  app.get("/api/newsletter/:id/export", async (req: Request, res: Response) => {
    const format = req.query.format === "docx" ? "docx" : "pdf";
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).send("Invalid newsletter id");
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(500).send("Database not initialized");
      return;
    }

    const items = await db.select().from(newsletters).where(eq(newsletters.id, id)).limit(1);
    if (items.length === 0) {
      res.status(404).send("Newsletter not found");
      return;
    }

    const newsletter = items[0];
    const html = `
      <html>
        <head><meta charset="utf-8"/><title>${newsletter.title}</title></head>
        <body>
          <h1>${newsletter.title}</h1>
          ${newsletter.content}
        </body>
      </html>`;

    try {
      if (format === "pdf") {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });
        const buffer = await page.pdf({ format: "A4" });
        await browser.close();
        res.setHeader("Content-Type", "application/pdf");
        res.send(buffer);
      } else {
        const docxBlob = htmlDocx.asBlob(html);
        const arrayBuffer = await docxBlob.arrayBuffer();
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
        res.send(Buffer.from(arrayBuffer));
      }
    } catch (error) {
      console.error("[Export] Generation failed", error);
      res.status(500).send("Export generation failed");
    }
  });
}

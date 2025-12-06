import { v4 as uuidv4 } from 'uuid';
import { createAgentStep } from '../db';

/**
 * Agent execution state for tracking workflow progress
 */
export interface AgentState {
  executionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  goal: string;
  constraints: string[];
  steps: AgentStepState[];
  result?: string;
  error?: string;
}

export interface AgentStepState {
  stepNumber: number;
  agentName: string;
  taskDescription: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input?: any;
  output?: any;
  error?: string;
}

/**
 * Newsletter generation parameters
 */
export interface NewsletterGenerationParams {
  userId: number;
  topics: string[];
  tone: 'professional' | 'casual' | 'technical';
  contentLength: 'short' | 'medium' | 'long';
  newsSourcePreference: string;
  personalizationLevel: number;
}

/**
 * Agentic AI Newsletter Agent
 * Demonstrates goal setting, constraint modeling, and task execution
 */
export class NewsletterAgent {
  private executionId: string;
  private state: AgentState;
  private stateUpdateCallback?: (state: AgentState) => void;

  constructor(userId: number, params: NewsletterGenerationParams) {
    this.executionId = uuidv4();
    this.state = {
      executionId: this.executionId,
      status: 'pending',
      goal: `Generate a ${params.contentLength} ${params.tone} newsletter about ${params.topics.join(', ')}`,
      constraints: [
        `Tone: ${params.tone}`,
        `Content Length: ${params.contentLength}`,
        `Personalization Level: ${params.personalizationLevel}/10`,
        `News Source Preference: ${params.newsSourcePreference}`,
      ],
      steps: [],
    };
  }

  /**
   * Set callback for real-time state updates (for WebSocket streaming)
   */
  onStateUpdate(callback: (state: AgentState) => void) {
    this.stateUpdateCallback = callback;
  }

  /**
   * Emit state update to listeners
   */
  private emitStateUpdate() {
    if (this.stateUpdateCallback) {
      this.stateUpdateCallback(this.state);
    }
  }

  /**
   * Execute the newsletter generation workflow
   */
  async execute(): Promise<AgentState> {
    try {
      this.state.status = 'running';
      this.emitStateUpdate();

      // Step 1: Research and gather news
      await this.executeStep(1, 'ResearchAgent', 'Gather relevant news and articles', {
        topics: this.state.goal,
      });

      // Step 2: Collect financial data (stocks, crypto, forex, indices)
      await this.executeStep(2, 'FinancialDataAgent', 'Collect financial market data and indices', {
        dataTypes: ['stocks', 'crypto', 'forex', 'marketIndices'],
      });

      // Step 3: Analyze and summarize content
      await this.executeStep(3, 'AnalysisAgent', 'Analyze and summarize gathered content', {
        contentType: 'news_articles_and_financial_data',
      });

      // Step 4: Generate personalized content
      await this.executeStep(4, 'ContentGenerationAgent', 'Generate personalized newsletter content', {
        constraints: this.state.constraints,
      });

      // Step 5: Format and polish
      await this.executeStep(5, 'FormattingAgent', 'Format and polish the newsletter', {
        format: 'html',
      });

      // Step 6: Quality check
      await this.executeStep(6, 'QualityAgent', 'Perform quality checks and validation', {
        checkItems: ['grammar', 'tone', 'relevance', 'formatting'],
      });

      this.state.status = 'completed';
      this.state.result = 'Newsletter generated successfully';
      this.emitStateUpdate();

      return this.state;
    } catch (error) {
      this.state.status = 'failed';
      this.state.error = error instanceof Error ? error.message : 'Unknown error';
      this.emitStateUpdate();
      throw error;
    }
  }

  /**
   * Execute a single agent step
   */
  private async executeStep(
    stepNumber: number,
    agentName: string,
    taskDescription: string,
    input: any
  ): Promise<void> {
    const step: AgentStepState = {
      stepNumber,
      agentName,
      taskDescription,
      status: 'running',
      input,
    };

    this.state.steps.push(step);
    this.emitStateUpdate();

    try {
      // Simulate agent processing with realistic delays
      const processingTime = Math.random() * 2000 + 1000; // 1-3 seconds
      await new Promise(resolve => setTimeout(resolve, processingTime));

      // Simulate step output
      step.output = {
        processed: true,
        timestamp: new Date().toISOString(),
        agent: agentName,
      };
      step.status = 'completed';
      this.emitStateUpdate();

      // Save completed step to database
      await createAgentStep({
        executionId: this.executionId,
        stepNumber,
        agentName,
        taskDescription,
        status: 'completed',
        input: JSON.stringify(input),
        output: JSON.stringify(step.output),
        startedAt: new Date(),
        completedAt: new Date(),
      });
    } catch (error) {
      step.status = 'failed';
      step.error = error instanceof Error ? error.message : 'Unknown error';
      this.emitStateUpdate();

      // Save failed step to database
      await createAgentStep({
        executionId: this.executionId,
        stepNumber,
        agentName,
        taskDescription,
        status: 'failed',
        input: JSON.stringify(input),
        errorMessage: step.error,
        startedAt: new Date(),
        completedAt: new Date(),
      });
      throw error;
    }
  }

  /**
   * Get current execution state
   */
  getState(): AgentState {
    return this.state;
  }

  /**
   * Get execution ID
   */
  getExecutionId(): string {
    return this.executionId;
  }
}

export default NewsletterAgent;

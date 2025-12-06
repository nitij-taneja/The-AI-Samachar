/**
 * Enhanced Content Generator
 * Integrates news search, financial data, and GROQ Llama model for intelligent newsletter generation
 */

import { searchNews } from './newsSearchService';
import { generateContentWithGROQ, analyzeContentQuality } from './groqService';
import { collectFinancialData, formatFinancialDataForNewsletter } from '../dataProviders';

export interface EnhancedContentRequest {
  topics: string[];
  tone: 'professional' | 'casual' | 'technical';
  contentLength: 'short' | 'medium' | 'long';
  newsSourcePreference: string;
  personalizationLevel: number;
  language?: 'english' | 'hindi' | 'bilingual';
}

export interface EnhancedContent {
  title: string;
  summary: string;
  content: string;
  keyPoints: string[];
  articles: Array<{
    title: string;
    source: string;
    url: string;
  }>;
  qualityScore: number;
  generatedAt: Date;
}

/**
 * Generate enhanced newsletter with real data
 */
export async function generateEnhancedNewsletter(
  request: EnhancedContentRequest
): Promise<EnhancedContent> {
  try {
    // Step 1: Search for relevant news
    const articles = await searchNews({
      topics: request.topics,
      limit: 5,
      newsSourcePreference: request.newsSourcePreference,
    });

    // Step 2: Collect financial data if topics are financial in nature
    let financialDataContent = '';
    const financialTopics = ['stock', 'market', 'finance', 'crypto', 'bitcoin', 'economy', 'forex', 'trading'];
    const hasFinancialTopic = request.topics.some(topic =>
      financialTopics.some(financial => topic.toLowerCase().includes(financial))
    );

    if (hasFinancialTopic) {
      try {
        const financialData = await collectFinancialData({
          stocks: ['AAPL', 'GOOGL', 'MSFT', 'TSLA'], // Default popular stocks
          crypto: ['btcusd', 'ethusd'], // Default crypto pairs
          forex: ['eurusd', 'gbpusd'], // Default forex pairs
          marketIndices: true,
          news: {
            tags: request.topics,
            limit: 3
          }
        });

        financialDataContent = await formatFinancialDataForNewsletter(financialData);
      } catch (financialError) {
        console.warn('Financial data collection failed:', financialError);
      }
    }

    // Step 3: Generate content using GROQ Llama
    const topic = request.topics.join(', ');
    const generatedContent = await generateContentWithGROQ({
      topic,
      tone: request.tone,
      contentLength: request.contentLength,
      articles: articles.map(a => ({
        title: a.title,
        summary: a.summary,
        source: a.source,
      })),
      personalizationLevel: request.personalizationLevel,
      financialData: financialDataContent,
      language: request.language || 'bilingual',
    });

    // Step 4: Analyze quality
    const qualityAnalysis = await analyzeContentQuality(generatedContent.content);

    return {
      title: generatedContent.title,
      summary: generatedContent.summary,
      content: generatedContent.content,
      keyPoints: generatedContent.keyPoints,
      articles: articles.map(a => ({
        title: a.title,
        source: a.source,
        url: a.url,
      })),
      qualityScore: qualityAnalysis.score,
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error('Enhanced newsletter generation error:', error);

    // Return fallback content
    return {
      title: `Newsletter: ${request.topics.join(', ')}`,
      summary: 'Latest updates and insights',
      content: `<p>Newsletter about ${request.topics.join(', ')}</p>`,
      keyPoints: ['Key insight 1', 'Key insight 2', 'Key insight 3'],
      articles: [],
      qualityScore: 0.5,
      generatedAt: new Date(),
    };
  }
}

/**
 * Format enhanced content as HTML
 */
export function formatEnhancedContentAsHTML(content: EnhancedContent): string {
  const articlesHTML = content.articles
    .map(
      article => `
    <div style="margin: 10px 0; padding: 8px; border-left: 2px solid #000; background: #f9f9f9;">
      <a href="${article.url}" target="_blank" style="color: #000; font-weight: bold; text-decoration: none; font-family: serif;">
        ${article.title}
      </a>
      <p style="margin: 3px 0 0 0; color: #666; font-size: 11px; font-family: sans-serif;">Source: ${article.source}</p>
    </div>
  `
    )
    .join('');

  const keyPointsHTML = content.keyPoints
    .map(
      point => `
    <li style="margin: 5px 0; color: #000; font-family: serif; font-size: 14px; line-height: 1.4;">
      ${point}
    </li>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${content.title}</title>
  <style>
    body {
      font-family: 'Times New Roman', Times, serif;
      line-height: 1.4;
      color: #000;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
      background: #fff;
    }
    .newspaper-header {
      text-align: center;
      border-bottom: 3px double #000;
      margin-bottom: 20px;
      padding-bottom: 15px;
    }
    .masthead {
      font-size: 48px;
      font-weight: bold;
      letter-spacing: 2px;
      margin: 0;
      font-family: 'Times New Roman', Times, serif;
    }
    .tagline {
      font-size: 14px;
      margin: 5px 0 0 0;
      letter-spacing: 1px;
      font-style: italic;
    }
    .date-edition {
      font-size: 12px;
      margin-top: 10px;
      text-align: center;
      border-top: 1px solid #000;
      padding-top: 5px;
    }
    .columns {
      display: flex;
      gap: 20px;
      margin: 20px 0;
    }
    .column {
      flex: 1;
      border-right: 1px solid #ccc;
      padding-right: 15px;
    }
    .column:last-child {
      border-right: none;
    }
    .headline {
      font-size: 24px;
      font-weight: bold;
      margin: 15px 0 10px 0;
      line-height: 1.2;
      border-bottom: 1px solid #000;
      padding-bottom: 5px;
    }
    .subheadline {
      font-size: 18px;
      font-weight: bold;
      margin: 10px 0;
      font-style: italic;
    }
    .byline {
      font-size: 12px;
      margin-bottom: 10px;
      text-align: right;
      font-weight: bold;
    }
    .story {
      margin-bottom: 20px;
      text-align: justify;
    }
    .story p {
      margin: 8px 0;
      text-indent: 20px;
    }
    .bilingual-section {
      display: flex;
      gap: 20px;
      margin: 20px 0;
      border-top: 1px solid #000;
      border-bottom: 1px solid #000;
      padding: 15px 0;
    }
    .language-column {
      flex: 1;
    }
    .language-column h3 {
      font-size: 16px;
      margin: 0 0 10px 0;
      text-align: center;
      border-bottom: 1px solid #666;
      padding-bottom: 3px;
    }
    .key-points {
      background: #f5f5f5;
      padding: 15px;
      margin: 20px 0;
      border: 1px solid #ccc;
    }
    .key-points h2 {
      font-size: 18px;
      margin: 0 0 10px 0;
      text-align: center;
      border-bottom: 1px solid #000;
      padding-bottom: 5px;
    }
    .key-points ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .articles {
      margin: 20px 0;
      background: #fafafa;
      padding: 15px;
      border: 1px solid #ddd;
    }
    .articles h2 {
      font-size: 18px;
      margin: 0 0 15px 0;
      text-align: center;
    }
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 2px solid #000;
      font-size: 11px;
      text-align: center;
      color: #666;
    }
    .quality-badge {
      display: inline-block;
      background: #000;
      color: white;
      padding: 3px 8px;
      font-size: 10px;
      margin-left: 10px;
      border-radius: 0;
    }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="newspaper-header">
    <h1 class="masthead">${content.title}</h1>
    <p class="tagline">Your Daily News Source • Bilingual Edition</p>
    <div class="date-edition">
      ${content.generatedAt.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      <span class="quality-badge">Quality Score: ${Math.round(content.qualityScore * 100)}%</span>
    </div>
  </div>

  <div class="summary" style="text-align: center; font-style: italic; margin: 15px 0; padding: 10px; background: #f9f9f9;">
    ${content.summary}
  </div>

  <div class="columns">
    <div class="column">
      <div>${content.content}</div>
    </div>
  </div>

  ${content.keyPoints.length > 0 ? `
    <div class="key-points">
      <h2>TODAY'S HEADLINES</h2>
      <ul>
        ${keyPointsHTML}
      </ul>
    </div>
  ` : ''}

  ${content.articles.length > 0 ? `
    <div class="articles">
      <h2>MORE STORIES</h2>
      ${articlesHTML}
    </div>
  ` : ''}

  <div class="footer">
    <p>Published by AI Newsletter Agent • ${new Date().toLocaleString()}</p>
    <p>Bringing you news in English and Hindi • For the modern reader</p>
  </div>
</body>
</html>
  `;
}

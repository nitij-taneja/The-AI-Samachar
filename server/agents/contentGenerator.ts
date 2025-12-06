/**
 * Content Generation Service
 * Integrates with Gemini API for AI-powered newsletter content generation
 */

export interface ContentGenerationRequest {
  topics: string[];
  tone: 'professional' | 'casual' | 'technical';
  contentLength: 'short' | 'medium' | 'long';
  personalizationLevel: number;
  newsArticles?: Array<{
    title: string;
    summary: string;
    source: string;
    url: string;
  }>;
}

export interface GeneratedContent {
  title: string;
  content: string;
  summary: string;
  keyPoints: string[];
  generatedAt: Date;
}

/**
 * Generate newsletter content using LLM
 */
export async function generateNewsletterContent(
  request: ContentGenerationRequest
): Promise<GeneratedContent> {
  try {
    // This will be integrated with actual LLM in Phase 4
    // For now, return a structured placeholder

    const contentLengthMap = {
      short: 500,
      medium: 1000,
      long: 2000,
    };

    const toneDescriptions = {
      professional: 'Use a formal, business-appropriate tone',
      casual: 'Use a friendly, conversational tone',
      technical: 'Use technical terminology and in-depth explanations',
    };

    const title = `${request.topics.join(' & ')} Newsletter - ${new Date().toLocaleDateString()}`;

    const content = `
# ${title}

## Overview
This newsletter covers the latest developments in ${request.topics.join(', ')}.

${request.newsArticles ? `## Featured Articles\n${request.newsArticles.map(article => `- **${article.title}** - ${article.source}`).join('\n')}` : ''}

## Key Insights
Based on recent developments and industry trends, here are the key takeaways:

1. **Innovation and Progress**: The field is rapidly evolving with new breakthroughs
2. **Market Impact**: These changes are reshaping the industry landscape
3. **Future Outlook**: Expect continued growth and transformation

## Tone: ${toneDescriptions[request.tone]}
Personalization Level: ${request.personalizationLevel}/10

---
Generated on ${new Date().toISOString()}
`;

    return {
      title,
      content,
      summary: `A comprehensive ${request.contentLength} newsletter about ${request.topics.join(', ')} with a ${request.tone} tone.`,
      keyPoints: [
        'Industry trends and developments',
        'Latest news and updates',
        'Expert insights and analysis',
        'Future outlook and predictions',
      ],
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error(`Failed to generate newsletter content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Format content for HTML display
 */
export function formatContentAsHTML(content: GeneratedContent): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${content.title}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
    h2 { color: #34495e; margin-top: 20px; }
    .summary { background: #ecf0f1; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0; }
    .key-points { background: #f8f9fa; padding: 15px; border-radius: 5px; }
    .key-points ul { list-style-type: none; padding: 0; }
    .key-points li { padding: 8px 0; padding-left: 20px; position: relative; }
    .key-points li:before { content: "✓"; position: absolute; left: 0; color: #27ae60; font-weight: bold; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #7f8c8d; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${content.title}</h1>
    <div class="summary">
      <strong>Summary:</strong> ${content.summary}
    </div>
    ${content.content.split('\n').map(line => {
      if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`;
      if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`;
      if (line.startsWith('- ')) return `<li>${line.substring(2)}</li>`;
      if (line.trim()) return `<p>${line}</p>`;
      return '';
    }).join('')}
    <div class="key-points">
      <h3>Key Points</h3>
      <ul>
        ${content.keyPoints.map(point => `<li>${point}</li>`).join('')}
      </ul>
    </div>
    <div class="footer">
      <p>Generated on ${content.generatedAt.toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
  `;
}

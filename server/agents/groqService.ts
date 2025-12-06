/**
 * GROQ Llama API Integration Service
 * Handles AI-powered content generation and analysis using GROQ Llama model
 */

export interface ContentGenerationRequest {
  topic: string;
  tone: 'professional' | 'casual' | 'technical';
  contentLength: 'short' | 'medium' | 'long';
  articles?: Array<{
    title: string;
    summary: string;
    source: string;
  }>;
  personalizationLevel: number;
  financialData?: string;
  language?: 'english' | 'hindi' | 'bilingual';
}

export interface GeneratedContent {
  title: string;
  summary: string;
  content: string;
  keyPoints: string[];
}

/**
 * Generate newsletter content using GROQ Llama model
 */
export async function generateContentWithGROQ(
  request: ContentGenerationRequest
): Promise<GeneratedContent> {
  const { invokeLLM } = await import('../_core/llm');

  const articlesText = request.articles
    ? request.articles.map(a => `- ${a.title}: ${a.summary} (Source: ${a.source})`).join('\n')
    : 'No articles available';

  const financialDataText = request.financialData ? `\n\nFinancial Data:\n${request.financialData}` : '';

  // Language-specific instructions
  const languageInstructions = request.language === 'english'
    ? 'Generate content in ENGLISH only. Structure it like a traditional English-language newspaper.'
    : request.language === 'hindi'
    ? 'Generate content in HINDI only. Structure it like a traditional Hindi-language newspaper with proper Hindi text.'
    : 'Generate content in BOTH English and Hindi languages. Structure it like a bilingual newspaper with English and Hindi content side by side or in sections.';

  const prompt = `Generate a traditional newspaper-style newsletter about: ${request.topic}

IMPORTANT: ${languageInstructions}

Structure it like a real newspaper with:
- Newspaper masthead/title
- Date and edition
- Multiple sections/columns
- Headlines and subheadlines
- Byline (reporter names)
${request.language === 'bilingual' ? '- Both English and Hindi content side by side or in sections' : ''}

Tone: ${request.tone}
Length: ${request.contentLength}
Personalization Level: ${request.personalizationLevel}/10

Available articles:
${articlesText}${financialDataText}

Please generate a complete newspaper-style newsletter with:
1. A newspaper masthead title (creative and professional)
2. Date and publication info
3. Multiple news sections${request.language === 'bilingual' ? ' with both English and Hindi content' : ''}
4. Headlines, subheadlines, and body text
5. Reporter bylines
6. Key points as newspaper bullet points
7. Traditional newspaper layout in HTML

Format your response as JSON with keys: title, summary, content, keyPoints`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are an expert newsletter writer. Generate high-quality, engaging content based on the provided articles and requirements. Return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      responseFormat: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    let contentString: string;
    if (typeof content === 'string') {
      contentString = content;
    } else if (Array.isArray(content)) {
      const textPart = content.find(part => part.type === 'text');
      if (!textPart || typeof textPart.text !== 'string') {
        throw new Error('Unexpected content format: no text part found');
      }
      contentString = textPart.text;
    } else {
      throw new Error('Unexpected content format');
    }

    const parsed = JSON.parse(contentString);
    return {
      title: parsed.title || `Newsletter: ${request.topic}`,
      summary: parsed.summary || 'Latest insights and updates',
      content: parsed.content || `<p>Content about ${request.topic}</p>`,
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
    };
  } catch (error) {
    console.error('GROQ content generation error:', error);
    // Fallback content
    return {
      title: `Newsletter: ${request.topic}`,
      summary: 'Latest updates and insights',
      content: `<p>Newsletter content about ${request.topic} with ${request.tone} tone.</p>`,
      keyPoints: ['Key insight 1', 'Key insight 2', 'Key insight 3'],
    };
  }
}

/**
 * Analyze content quality using GROQ Llama model
 */
export async function analyzeContentQuality(
  content: string
): Promise<{
  score: number;
  issues: string[];
  suggestions: string[];
}> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { score: 0.8, issues: [], suggestions: [] };
  }
  // TODO: implement GROQ Llama quality analysis
  return { score: 0.8, issues: [], suggestions: [] };
}

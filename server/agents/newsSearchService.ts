/**
 * News Search Service
 * Integrates Tavily API and DuckDuckGo for intelligent news gathering
 */

export interface NewsArticle {
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: Date;
  relevanceScore: number;
}

export interface SearchRequest {
  topics: string[];
  limit?: number;
  newsSourcePreference?: string;
}

/**
 * Search news using Tavily API
 */
export async function searchNewsWithTavily(
  query: string,
  limit: number = 5
): Promise<NewsArticle[]> {
  try {
    const tavilyApiKey = process.env.TAVILY_API_KEY;
    if (!tavilyApiKey) {
      console.warn('Tavily API key not configured, using fallback');
      return [];
    }

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: tavilyApiKey,
        query,
        max_results: limit,
        include_answer: true,
        include_raw_content: false,
      }),
    });

    if (!response.ok) {
      console.error('Tavily API error:', response.statusText);
      return [];
    }

    const data = await response.json();

    return (data.results || []).map((result: any) => ({
      title: result.title,
      summary: result.snippet || result.content || '',
      source: new URL(result.url).hostname,
      url: result.url,
      publishedAt: new Date(),
      relevanceScore: 0.8,
    }));
  } catch (error) {
    console.error('Tavily search error:', error);
    return [];
  }
}

/**
 * Search news using DuckDuckGo (no API key required)
 */
export async function searchNewsWithDuckDuckGo(
  query: string,
  limit: number = 5
): Promise<NewsArticle[]> {
  try {
    // DuckDuckGo instant answer API endpoint
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const articles: NewsArticle[] = [];

    // Extract from related topics
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      data.RelatedTopics.slice(0, limit).forEach((topic: any) => {
        if (topic.Text && topic.FirstURL) {
          articles.push({
            title: topic.Text.substring(0, 100),
            summary: topic.Text,
            source: new URL(topic.FirstURL).hostname,
            url: topic.FirstURL,
            publishedAt: new Date(),
            relevanceScore: 0.6,
          });
        }
      });
    }

    return articles;
  } catch (error) {
    console.error('DuckDuckGo search error:', error);
    return [];
  }
}

/**
 * Comprehensive news search combining multiple sources
 */
export async function searchNews(request: SearchRequest): Promise<NewsArticle[]> {
  const { topics, limit = 10, newsSourcePreference = 'mixed' } = request;

  if (topics.length === 0) {
    return [];
  }

  const query = topics.join(' OR ');
  const articles: NewsArticle[] = [];

  try {
    // Try Tavily first if preference is not specifically DuckDuckGo
    if (newsSourcePreference !== 'duckduckgo') {
      const tavilyResults = await searchNewsWithTavily(query, Math.ceil(limit / 2));
      articles.push(...tavilyResults);
    }

    // Add DuckDuckGo results for diversity
    if (newsSourcePreference !== 'tavily' && articles.length < limit) {
      const duckResults = await searchNewsWithDuckDuckGo(query, limit - articles.length);
      articles.push(...duckResults);
    }

    // Remove duplicates and sort by relevance
    const uniqueArticles = Array.from(
      new Map(articles.map(a => [a.url, a])).values()
    ).sort((a, b) => b.relevanceScore - a.relevanceScore);

    return uniqueArticles.slice(0, limit);
  } catch (error) {
    console.error('News search error:', error);
    return articles.slice(0, limit);
  }
}

/**
 * Format articles for newsletter inclusion
 */
export function formatArticlesForNewsletter(articles: NewsArticle[]): string {
  if (articles.length === 0) {
    return '<p>No articles found for the selected topics.</p>';
  }

  const html = articles
    .map(
      (article, idx) => `
    <div class="article" style="margin-bottom: 20px; padding: 15px; border-left: 4px solid #3498db;">
      <h3 style="margin: 0 0 10px 0; color: #2c3e50;">
        <a href="${article.url}" target="_blank" style="color: #3498db; text-decoration: none;">
          ${article.title}
        </a>
      </h3>
      <p style="margin: 0 0 10px 0; color: #555; font-size: 14px;">
        ${article.summary}
      </p>
      <small style="color: #7f8c8d;">
        Source: ${article.source} | Relevance: ${Math.round(article.relevanceScore * 100)}%
      </small>
    </div>
  `
    )
    .join('');

  return `<div class="articles">${html}</div>`;
}

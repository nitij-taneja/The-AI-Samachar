/**
 * Unified Data Providers Interface
 * Combines multiple data sources for comprehensive newsletter content
 */

// Re-export specific functions with aliases to avoid conflicts
export {
  getStockQuotes as getMarketstackStockQuotes,
  getMarketIndices as getMarketstackIndices,
  searchStocks as searchMarketstackStocks,
  formatStockDataForNewsletter as formatMarketstackStocks,
  formatMarketIndicesForNewsletter as formatMarketstackIndices
} from './marketstack';

export {
  getStockQuotes as getTiingoStockQuotes,
  getCryptoData,
  getForexData,
  getFinancialNews,
  formatStockDataForNewsletter as formatTiingoStocks,
  formatCryptoDataForNewsletter,
  formatForexDataForNewsletter
} from './tiingo';

export interface FinancialDataRequest {
  stocks?: string[];
  crypto?: string[];
  forex?: string[];
  marketIndices?: boolean;
  news?: {
    tickers?: string[];
    tags?: string[];
    limit?: number;
  };
}

export interface FinancialDataResponse {
  stocks: any[];
  crypto: any[];
  forex: any[];
  marketIndices: any[];
  news: any[];
}

/**
 * Collect financial data from all available providers
 */
export async function collectFinancialData(request: FinancialDataRequest): Promise<FinancialDataResponse> {
  const response: FinancialDataResponse = {
    stocks: [],
    crypto: [],
    forex: [],
    marketIndices: [],
    news: [],
  };

  try {
    // Import providers dynamically to avoid issues if APIs are not configured
    const { getStockQuotes: getMarketstackStocks, getMarketIndices } = await import('./marketstack');
    const {
      getStockQuotes: getTiingoStocks,
      getCryptoData,
      getForexData,
      getFinancialNews
    } = await import('./tiingo');

    // Collect stock data
    if (request.stocks && request.stocks.length > 0) {
      try {
        const marketstackStocks = await getMarketstackStocks(request.stocks);
        response.stocks.push(...marketstackStocks);
      } catch (error) {
        console.warn('Marketstack stock data failed:', error);
        try {
          const tiingoStocks = await getTiingoStocks(request.stocks);
          response.stocks.push(...tiingoStocks);
        } catch (tiingoError) {
          console.warn('Tiingo stock data also failed:', tiingoError);
        }
      }
    }

    // Collect crypto data
    if (request.crypto && request.crypto.length > 0) {
      try {
        const cryptoData = await getCryptoData(request.crypto);
        response.crypto.push(...cryptoData);
      } catch (error) {
        console.warn('Tiingo crypto data failed:', error);
      }
    }

    // Collect forex data
    if (request.forex && request.forex.length > 0) {
      try {
        const forexData = await getForexData(request.forex);
        response.forex.push(...forexData);
      } catch (error) {
        console.warn('Tiingo forex data failed:', error);
      }
    }

    // Collect market indices
    if (request.marketIndices) {
      try {
        const indices = await getMarketIndices();
        response.marketIndices.push(...indices);
      } catch (error) {
        console.warn('Market indices data failed:', error);
      }
    }

    // Collect financial news - skip if API not available
    if (request.news) {
      try {
        const news = await getFinancialNews(
          request.news.tickers,
          request.news.tags,
          request.news.limit || 10
        );
        response.news.push(...news);
      } catch (error) {
        console.warn('Financial news API not available, skipping:', error instanceof Error ? error.message : String(error));
      }
    }

  } catch (error) {
    console.error('Error collecting financial data:', error);
  }

  return response;
}

/**
 * Format financial data for newsletter inclusion
 */
export async function formatFinancialDataForNewsletter(data: FinancialDataResponse): Promise<string> {
  const sections: string[] = [];

  try {
    // Import formatting functions dynamically
    const { formatStockDataForNewsletter, formatMarketIndicesForNewsletter } = await import('./marketstack');
    const { formatCryptoDataForNewsletter, formatForexDataForNewsletter } = await import('./tiingo');

    // Format market data
    if (data.stocks.length > 0) {
      sections.push(formatStockDataForNewsletter(data.stocks));
    }
    if (data.marketIndices.length > 0) {
      sections.push(formatMarketIndicesForNewsletter(data.marketIndices));
    }
    if (data.crypto.length > 0) {
      sections.push(formatCryptoDataForNewsletter(data.crypto));
    }
    if (data.forex.length > 0) {
      sections.push(formatForexDataForNewsletter(data.forex));
    }
  } catch (error) {
    console.error('Error formatting financial data:', error);
  }

  return sections.join('\n\n');
}

/**
 * Tiingo Financial Data Provider
 * Provides comprehensive financial market data including stocks, crypto, and forex
 */

import { ENV } from "../_core/env";

export interface TiingoStockData {
  ticker: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  lastUpdated: Date;
  high52Week?: number;
  low52Week?: number;
  dividendYield?: number;
}

export interface TiingoCryptoData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  lastUpdated: Date;
}

export interface TiingoForexData {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
}

export interface TiingoNewsItem {
  title: string;
  description: string;
  url: string;
  publishedDate: Date;
  source: string;
  tags: string[];
}

/**
 * Get stock quotes from Tiingo
 */
export async function getStockQuotes(tickers: string[]): Promise<TiingoStockData[]> {
  if (!ENV.tiingoApiKey || ENV.tiingoApiKey === 'your_tiingo_api_key') {
    console.warn('Tiingo API key not configured, skipping stock quotes');
    return [];
  }

  const tickersParam = tickers.join(',');
  const url = `https://api.tiingo.com/tiingo/daily/${tickersParam}/prices?token=${ENV.tiingoApiKey}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Tiingo API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();

    if (!data) {
      console.warn('Tiingo returned empty response');
      return [];
    }

    // Tiingo returns an array for multiple tickers or single object for one ticker
    const dataArray = Array.isArray(data) ? data : [data];

    return dataArray.map((item: any) => ({
      ticker: item.ticker,
      price: item.close || item.price || 0,
      change: item.change || 0,
      changePercent: item.changePercent || 0,
      volume: item.volume || 0,
      lastUpdated: new Date(item.date || Date.now()),
    }));
  } catch (error) {
    console.error('Tiingo stock quotes error:', error);
    return [];
  }
}

/**
 * Get crypto data from Tiingo
 */
export async function getCryptoData(tickers: string[]): Promise<TiingoCryptoData[]> {
  if (!ENV.tiingoApiKey) {
    throw new Error("TIINGO_API_KEY is not configured");
  }

  const results: TiingoCryptoData[] = [];

  for (const ticker of tickers) {
    try {
      const url = `https://api.tiingo.com/tiingo/crypto/prices?tickers=${ticker}&token=${ENV.tiingoApiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`Tiingo crypto API error for ${ticker}: ${response.status}`);
        continue;
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const latest = data[0];
        results.push({
          ticker: latest.ticker,
          name: latest.ticker,
          price: latest.close || latest.price || 0,
          change: latest.change || 0,
          changePercent: latest.changePercent || 0,
          volume: latest.volume || 0,
          lastUpdated: new Date(latest.date || Date.now()),
        });
      }
    } catch (error) {
      console.error(`Tiingo crypto data error for ${ticker}:`, error);
    }
  }

  return results;
}

/**
 * Get forex data from Tiingo
 */
export async function getForexData(pairs: string[]): Promise<TiingoForexData[]> {
  if (!ENV.tiingoApiKey) {
    throw new Error("TIINGO_API_KEY is not configured");
  }

  const results: TiingoForexData[] = [];

  for (const pair of pairs) {
    try {
      const url = `https://api.tiingo.com/tiingo/fx/${pair}/prices?token=${ENV.tiingoApiKey}`;
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(`Tiingo forex API error for ${pair}: ${response.status}`);
        continue;
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const latest = data[0];
        results.push({
          ticker: pair,
          price: latest.close || latest.price || 0,
          change: latest.change || 0,
          changePercent: latest.changePercent || 0,
          lastUpdated: new Date(latest.date || Date.now()),
        });
      }
    } catch (error) {
      console.error(`Tiingo forex data error for ${pair}:`, error);
    }
  }

  return results;
}

/**
 * Get financial news from Tiingo
 */
export async function getFinancialNews(
  tickers?: string[],
  tags?: string[],
  limit: number = 10
): Promise<TiingoNewsItem[]> {
  if (!ENV.tiingoApiKey) {
    throw new Error("TIINGO_API_KEY is not configured");
  }

  let url = `https://api.tiingo.com/tiingo/news?token=${ENV.tiingoApiKey}&limit=${limit}`;

  if (tickers && tickers.length > 0) {
    url += `&tickers=${tickers.join(',')}`;
  }

  if (tags && tags.length > 0) {
    url += `&tags=${tags.join(',')}`;
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Tiingo news API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return data.map((item: any) => ({
      title: item.title,
      description: item.description || item.excerpt || '',
      url: item.url,
      publishedDate: new Date(item.publishedDate),
      source: item.source,
      tags: item.tags || [],
    }));
  } catch (error) {
    console.error('Tiingo news error:', error);
    throw error;
  }
}

/**
 * Search for tickers
 */
export async function searchTickers(query: string, type: 'stock' | 'crypto' | 'forex' = 'stock'): Promise<any[]> {
  if (!ENV.tiingoApiKey) {
    throw new Error("TIINGO_API_KEY is not configured");
  }

  // Tiingo doesn't have a direct search endpoint, but we can try different approaches
  // For now, return empty array as Tiingo search is limited
  console.warn('Tiingo ticker search not fully implemented');
  return [];
}

/**
 * Format stock data for newsletter inclusion
 */
export function formatStockDataForNewsletter(stocks: TiingoStockData[]): string {
  if (stocks.length === 0) {
    return '<p>No stock data available.</p>';
  }

  const html = stocks
    .map(
      (stock) => `
    <div class="stock-item" style="margin-bottom: 15px; padding: 10px; border: 1px solid #e1e8ed; border-radius: 5px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong style="font-size: 16px; color: #2c3e50;">${stock.ticker}</strong>
          <div style="font-size: 14px; color: #7f8c8d;">$${stock.price.toFixed(2)}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 14px; color: ${stock.change >= 0 ? '#27ae60' : '#e74c3c'};">
            ${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)
          </div>
          <div style="font-size: 12px; color: #7f8c8d;">Vol: ${stock.volume.toLocaleString()}</div>
        </div>
      </div>
    </div>
  `
    )
    .join('');

  return `<div class="stock-data">${html}</div>`;
}

/**
 * Format crypto data for newsletter inclusion
 */
export function formatCryptoDataForNewsletter(crypto: TiingoCryptoData[]): string {
  if (crypto.length === 0) {
    return '<p>No cryptocurrency data available.</p>';
  }

  const html = crypto
    .map(
      (coin) => `
    <div class="crypto-item" style="margin-bottom: 15px; padding: 10px; border: 1px solid #f39c12; border-radius: 5px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong style="font-size: 16px; color: #2c3e50;">${coin.name} (${coin.ticker})</strong>
          <div style="font-size: 14px; color: #7f8c8d;">$${coin.price.toFixed(2)}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 14px; color: ${coin.change >= 0 ? '#27ae60' : '#e74c3c'};">
            ${coin.change >= 0 ? '+' : ''}${coin.change.toFixed(2)} (${coin.changePercent >= 0 ? '+' : ''}${coin.changePercent.toFixed(2)}%)
          </div>
          <div style="font-size: 12px; color: #7f8c8d;">Vol: ${coin.volume.toLocaleString()}</div>
        </div>
      </div>
    </div>
  `
    )
    .join('');

  return `<div class="crypto-data"><h4 style="margin-bottom: 10px; color: #f39c12;">Cryptocurrency</h4>${html}</div>`;
}

/**
 * Format forex data for newsletter inclusion
 */
export function formatForexDataForNewsletter(forex: TiingoForexData[]): string {
  if (forex.length === 0) {
    return '<p>No forex data available.</p>';
  }

  const html = forex
    .map(
      (pair) => `
    <div class="forex-item" style="margin-bottom: 10px; padding: 8px; background-color: #ecf0f1; border-radius: 3px;">
      <strong style="color: #2c3e50;">${pair.ticker}</strong>
      <span style="float: right; color: ${pair.change >= 0 ? '#27ae60' : '#e74c3c'};">
        ${pair.price.toFixed(4)} (${pair.change >= 0 ? '+' : ''}${pair.changePercent.toFixed(2)}%)
      </span>
    </div>
  `
    )
    .join('');

  return `<div class="forex-data"><h4 style="margin-bottom: 10px; color: #2c3e50;">Forex</h4>${html}</div>`;
}

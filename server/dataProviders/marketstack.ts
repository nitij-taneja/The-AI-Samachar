/**
 * Marketstack Financial Data Provider
 * Provides global stock market data, indices, and financial information
 */

import { ENV } from "../_core/env";

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  lastUpdated: Date;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
}

export interface MarketstackResponse {
  data: any[];
  pagination: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
}

/**
 * Get stock quotes for specific symbols
 */
export async function getStockQuotes(symbols: string[]): Promise<StockData[]> {
  if (!ENV.marketstackApiKey || ENV.marketstackApiKey === 'your_marketstack_api_key') {
    console.warn('Marketstack API key not configured, skipping stock quotes');
    return [];
  }

  const symbolsParam = symbols.join(',');
  const url = `http://api.marketstack.com/v1/eod?access_key=${ENV.marketstackApiKey}&symbols=${symbolsParam}&limit=1`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Marketstack API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data: MarketstackResponse = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      console.warn('Marketstack returned invalid data format');
      return [];
    }

    return data.data.map((item: any) => ({
      symbol: item.symbol,
      name: item.symbol, // Marketstack doesn't provide company names in EOD
      price: item.close,
      change: item.change || 0,
      changePercent: item.change_percent || 0,
      volume: item.volume || 0,
      lastUpdated: new Date(item.date),
    }));
  } catch (error) {
    console.error('Marketstack stock quotes error:', error);
    return [];
  }
}

/**
 * Get market indices data
 */
export async function getMarketIndices(symbols: string[] = ['SPY', 'QQQ', 'IWM', 'VTI']): Promise<MarketIndex[]> {
  return getStockQuotes(symbols);
}

/**
 * Search for stock symbols
 */
export async function searchStocks(query: string, limit: number = 10): Promise<any[]> {
  if (!ENV.marketstackApiKey) {
    throw new Error("MARKETSTACK_API_KEY is not configured");
  }

  // Marketstack doesn't have a direct search endpoint, so we'll use tickers endpoint
  const url = `http://api.marketstack.com/v1/tickers?access_key=${ENV.marketstackApiKey}&search=${encodeURIComponent(query)}&limit=${limit}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Marketstack API error: ${response.status} ${response.statusText}`);
    }

    const data: MarketstackResponse = await response.json();

    return data.data.map((ticker: any) => ({
      symbol: ticker.symbol,
      name: ticker.name,
      stock_exchange: ticker.stock_exchange,
    }));
  } catch (error) {
    console.error('Marketstack search error:', error);
    throw error;
  }
}

/**
 * Get historical stock data
 */
export async function getHistoricalData(
  symbol: string,
  dateFrom: string,
  dateTo: string,
  limit: number = 100
): Promise<any[]> {
  if (!ENV.marketstackApiKey) {
    throw new Error("MARKETSTACK_API_KEY is not configured");
  }

  const url = `http://api.marketstack.com/v1/eod?access_key=${ENV.marketstackApiKey}&symbols=${symbol}&date_from=${dateFrom}&date_to=${dateTo}&limit=${limit}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Marketstack API error: ${response.status} ${response.statusText}`);
    }

    const data: MarketstackResponse = await response.json();

    return data.data.map((item: any) => ({
      date: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
      change: item.change,
      change_percent: item.change_percent,
    }));
  } catch (error) {
    console.error('Marketstack historical data error:', error);
    throw error;
  }
}

/**
 * Format stock data for newsletter inclusion
 */
export function formatStockDataForNewsletter(stocks: StockData[]): string {
  if (stocks.length === 0) {
    return '<p>No stock data available.</p>';
  }

  const html = stocks
    .map(
      (stock) => `
    <div class="stock-item" style="margin-bottom: 15px; padding: 10px; border: 1px solid #e1e8ed; border-radius: 5px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong style="font-size: 16px; color: #2c3e50;">${stock.symbol}</strong>
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
 * Format market indices for newsletter inclusion
 */
export function formatMarketIndicesForNewsletter(indices: MarketIndex[]): string {
  if (indices.length === 0) {
    return '<p>No market index data available.</p>';
  }

  const html = indices
    .map(
      (index) => `
    <div class="index-item" style="margin-bottom: 10px; padding: 8px; background-color: #f8f9fa; border-radius: 3px;">
      <strong style="color: #2c3e50;">${index.name} (${index.symbol})</strong>
      <span style="float: right; color: ${index.change >= 0 ? '#27ae60' : '#e74c3c'};">
        ${index.price.toFixed(2)} (${index.change >= 0 ? '+' : ''}${index.changePercent.toFixed(2)}%)
      </span>
    </div>
  `
    )
    .join('');

  return `<div class="market-indices"><h4 style="margin-bottom: 10px; color: #2c3e50;">Market Indices</h4>${html}</div>`;
}

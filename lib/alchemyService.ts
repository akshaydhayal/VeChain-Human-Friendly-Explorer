import { cached } from './cache'

const ALCHEMY_API_KEY = '0O3YdaiXxH6aN2gbc_efUpZrHBG8nIRi'
const ALCHEMY_BASE_URL = 'https://api.g.alchemy.com/prices/v1'

export type PriceDataPoint = {
  value: string
  timestamp: string
}

export type AlchemyPriceResponse = {
  symbol: string
  currency: string
  data: PriceDataPoint[]
}

export type Timeframe = '1h' | '24h' | '7d' | '1m'

export type ChartData = {
  symbol: string
  currency: string
  data: Array<{
    value: number
    timestamp: string
    formattedDate: string
    formattedTime: string
  }>
  currentPrice: number
  priceChange: number
  priceChangePercent: number
}

function getTimeframeConfig(timeframe: Timeframe) {
  const now = new Date()
  const configs = {
    '1h': {
      startTime: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
      endTime: now,
      interval: '5m' as const, // Changed from 1m to 5m for better data density
      cacheDuration: 5 * 60 * 1000, // 5 minutes cache
    },
    '24h': {
      startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 24 hours ago
      endTime: now,
      interval: '1h' as const,
      cacheDuration: 15 * 60 * 1000, // 15 minutes cache
    },
    '7d': {
      startTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endTime: now,
      interval: '1h' as const, // Changed to 1h for better granularity
      cacheDuration: 60 * 60 * 1000, // 1 hour cache
    },
    '1m': {
      startTime: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endTime: now,
      interval: '1d' as const,
      cacheDuration: 4 * 60 * 60 * 1000, // 4 hours cache
    }
  }
  
  return configs[timeframe]
}

async function fetchAlchemyData(symbol: string, timeframe: Timeframe): Promise<AlchemyPriceResponse | null> {
  const config = getTimeframeConfig(timeframe)
  
  try {
    const response = await fetch(`${ALCHEMY_BASE_URL}/${ALCHEMY_API_KEY}/tokens/historical`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        symbol,
        startTime: config.startTime.toISOString(),
        endTime: config.endTime.toISOString(),
        interval: config.interval
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error fetching ${symbol} data for ${timeframe}:`, error)
    return null
  }
}

export async function getTokenChartData(symbol: string, timeframe: Timeframe): Promise<ChartData | null> {
  const config = getTimeframeConfig(timeframe)
  const cacheKey = `alchemy-${symbol.toLowerCase()}-${timeframe}`
  
  return cached(cacheKey, async () => {
    const response = await fetchAlchemyData(symbol, timeframe)
    
    if (!response || !response.data || response.data.length === 0) {
      return null
    }

    // Process the data
    const processedData = response.data.map(point => ({
      value: parseFloat(point.value),
      timestamp: point.timestamp,
      formattedDate: new Date(point.timestamp).toLocaleDateString(),
      formattedTime: new Date(point.timestamp).toLocaleTimeString()
    }))

    // Calculate price change
    const firstPrice = processedData[0]?.value || 0
    const lastPrice = processedData[processedData.length - 1]?.value || 0
    const priceChange = lastPrice - firstPrice
    const priceChangePercent = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0

    return {
      symbol: response.symbol,
      currency: response.currency,
      data: processedData,
      currentPrice: lastPrice,
      priceChange,
      priceChangePercent
    }
  }, config.cacheDuration) as Promise<ChartData | null>
}

export function formatPrice(price: number): string {
  if (price < 0.01) {
    return `$${price.toFixed(6)}`
  } else if (price < 1) {
    return `$${price.toFixed(4)}`
  } else {
    return `$${price.toFixed(2)}`
  }
}

export function formatPercentage(percentage: number): string {
  const sign = percentage >= 0 ? '+' : ''
  return `${sign}${percentage.toFixed(2)}%`
}

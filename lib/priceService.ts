import { cached } from './cache'

export type TokenPrice = {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  last_updated: string
}

export type PriceData = {
  vet: TokenPrice
  vtho: TokenPrice
}

// CoinGecko API endpoints (free, no API key required)
const COINGECKO_API = 'https://api.coingecko.com/api/v3'
const VET_COINGECKO_ID = 'vechain'
const VTHO_COINGECKO_ID = 'vethor'

export async function fetchTokenPrices(): Promise<PriceData | null> {
  return cached('token-prices', async () => {
    try {
      const response = await fetch(
        `${COINGECKO_API}/simple/price?ids=${VET_COINGECKO_ID},${VTHO_COINGECKO_ID}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true&include_last_updated_at=true`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Transform the data to our format
      const vetData = data[VET_COINGECKO_ID]
      const vthoData = data[VTHO_COINGECKO_ID]
      
      if (!vetData || !vthoData) {
        throw new Error('Token data not found in response')
      }
      
      const priceData: PriceData = {
        vet: {
          id: 'vechain',
          symbol: 'VET',
          name: 'VeChain',
          current_price: vetData.usd,
          price_change_percentage_24h: vetData.usd_24h_change,
          market_cap: vetData.usd_market_cap,
          total_volume: vetData.usd_24h_vol,
          last_updated: new Date(vetData.last_updated_at * 1000).toISOString()
        },
        vtho: {
          id: 'vethor',
          symbol: 'VTHO',
          name: 'VeThor',
          current_price: vthoData.usd,
          price_change_percentage_24h: vthoData.usd_24h_change,
          market_cap: vthoData.usd_market_cap,
          total_volume: vthoData.usd_24h_vol,
          last_updated: new Date(vthoData.last_updated_at * 1000).toISOString()
        }
      }
      
      return priceData
    } catch (error) {
      console.error('Error fetching token prices:', error)
      return null
    }
  }, 5 * 60 * 1000) as Promise<PriceData | null> // Cache for 5 minutes
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

export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`
  } else if (marketCap >= 1e3) {
    return `$${(marketCap / 1e3).toFixed(2)}K`
  } else {
    return `$${marketCap.toFixed(2)}`
  }
}


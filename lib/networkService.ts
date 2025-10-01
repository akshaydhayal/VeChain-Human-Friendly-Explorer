import { cached } from './cache'

export type VeChainNetworkData = {
  block_count: number
  txns_total_count: number
  clauses_total_count: number
  vtho_total_burned: string
  days: number
  timestamp: number
}

export type VeChainNetworkResponse = {
  status: {
    success: boolean
    message: string
  }
  data: {
    block_count: number
    txns_total_count: number
    clauses_total_count: number
    vtho_total_burned: string
  }
  meta: {
    days: number
    timestamp: number
  }
}

const VECHAIN_STATS_API_KEY = 'f121dd4fda838a2fd6b0ba84ed3d83b2302392b1bec7c4cf3096af8f5500b954'
const VECHAIN_STATS_API_URL = 'https://api.vechainstats.com/v2/network/totals'

export async function fetchVeChainNetwork(): Promise<VeChainNetworkData | null> {
  return cached('vechain-network', async () => {
    try {
      const response = await fetch(VECHAIN_STATS_API_URL, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'X-API-Key': VECHAIN_STATS_API_KEY
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: VeChainNetworkResponse = await response.json()
      
      if (!data.status.success) {
        throw new Error(`API error: ${data.status.message}`)
      }
      
      const networkData: VeChainNetworkData = {
        block_count: data.data.block_count,
        txns_total_count: data.data.txns_total_count,
        clauses_total_count: data.data.clauses_total_count,
        vtho_total_burned: data.data.vtho_total_burned,
        days: data.meta.days,
        timestamp: data.meta.timestamp
      }
      
      return networkData
    } catch (error) {
      console.error('Error fetching VeChain network data:', error)
      return null
    }
  }, 60 * 60 * 1000) as Promise<VeChainNetworkData | null> // Cache for 1 hour
}

export function formatNetworkCount(count: number): string {
  return count.toLocaleString()
}

export function formatVTHOBurned(vtho: string): string {
  const num = parseFloat(vtho)
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  } else {
    return num.toLocaleString()
  }
}

export function getNetworkTypeColor(networkType: 'blocks' | 'transactions' | 'clauses' | 'vtho'): string {
  switch (networkType) {
    case 'blocks':
      return 'text-blue-400'
    case 'transactions':
      return 'text-green-400'
    case 'clauses':
      return 'text-purple-400'
    case 'vtho':
      return 'text-orange-400'
    default:
      return 'text-neutral-400'
  }
}

export function getNetworkTypeLabel(networkType: 'blocks' | 'transactions' | 'clauses' | 'vtho'): string {
  switch (networkType) {
    case 'blocks':
      return 'Total Blocks'
    case 'transactions':
      return 'Total Transactions'
    case 'clauses':
      return 'Total Clauses'
    case 'vtho':
      return 'VTHO Burned'
    default:
      return 'Unknown'
  }
}
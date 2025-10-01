import { cached } from './cache'

export type NFTCollection = {
  id: string
  name: string
  type: string
  nfts: number
  contract: string
}

export type NFTListResponse = {
  status: {
    success: boolean
    message: string
  }
  data: NFTCollection[]
  meta: {
    count: number
    timestamp: number
  }
}

const VECHAIN_STATS_API_KEY = 'f121dd4fda838a2fd6b0ba84ed3d83b2302392b1bec7c4cf3096af8f5500b954'
const VECHAIN_STATS_API_URL = 'https://api.vechainstats.com/v2/nft/list'

export async function fetchNFTList(): Promise<NFTCollection[] | null> {
  return cached('nft-list', async () => {
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
      
      const data: NFTListResponse = await response.json()
      
      if (!data.status.success) {
        throw new Error(`API error: ${data.status.message}`)
      }
      
      return data.data
    } catch (error) {
      console.error('Error fetching NFT list:', error)
      return null
    }
  }, 24 * 60 * 60 * 1000) as Promise<NFTCollection[] | null> // Cache for 24 hours
}

export function formatNFTName(name: string): string {
  return name
}

export function formatNFTCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  } else {
    return count.toLocaleString()
  }
}

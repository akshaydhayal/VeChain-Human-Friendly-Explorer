import { cached } from './cache'

export type TokenInfo = {
  name: string
  type: string
  decimals: number
  contract: string | null
}

export type TokenListResponse = {
  status: {
    success: boolean
    message: string
  }
  data: Record<string, TokenInfo>
  meta: {
    count: number
    timestamp: number
  }
}

const VECHAIN_STATS_API_KEY = 'f121dd4fda838a2fd6b0ba84ed3d83b2302392b1bec7c4cf3096af8f5500b954'
const VECHAIN_STATS_API_URL = 'https://api.vechainstats.com/v2/token/list'

export async function fetchTokenList(): Promise<TokenInfo[] | null> {
  return cached('token-list', async () => {
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
      
      const data: TokenListResponse = await response.json()
      
      if (!data.status.success) {
        throw new Error(`API error: ${data.status.message}`)
      }
      
      // Transform the data into an array of TokenInfo objects
      const tokenList: TokenInfo[] = Object.entries(data.data).map(([symbol, tokenData]) => ({
        name: tokenData.name,
        type: tokenData.type,
        decimals: tokenData.decimals,
        contract: tokenData.contract
      }))
      
      return tokenList
    } catch (error) {
      console.error('Error fetching token list:', error)
      return null
    }
  }, 24 * 60 * 60 * 1000) as Promise<TokenInfo[] | null> // Cache for 24 hours
}

export function formatTokenBalance(balance: bigint, decimals: number): string {
  const divisor = BigInt(10 ** decimals)
  const wholePart = balance / divisor
  const fractionalPart = balance % divisor
  
  if (fractionalPart === 0n) {
    return wholePart.toString()
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0')
  const trimmedFractional = fractionalStr.replace(/0+$/, '')
  
  if (trimmedFractional === '') {
    return wholePart.toString()
  }
  
  return `${wholePart}.${trimmedFractional}`
}

export function formatTokenSymbol(symbol: string): string {
  return symbol.toUpperCase()
}


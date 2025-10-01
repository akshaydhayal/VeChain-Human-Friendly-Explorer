import { cached } from './cache'

export type VeChainNodesData = {
  xnode_tokens: number
  economic_node_tokens: number
  authority_nodes: number
  timestamp: number
}

export type VeChainNodesResponse = {
  status: {
    success: boolean
    message: string
  }
  data: {
    xnode_tokens: number
    economic_node_tokens: number
  }
  meta: {
    timestamp: number
  }
}

const VECHAIN_STATS_API_KEY = 'f121dd4fda838a2fd6b0ba84ed3d83b2302392b1bec7c4cf3096af8f5500b954'
const VECHAIN_STATS_API_URL = 'https://api.vechainstats.com/v2/network/node-token-count'

// Authority nodes are fixed at 101 for VeChain
const AUTHORITY_NODES = 101

export async function fetchVeChainNodes(): Promise<VeChainNodesData | null> {
  return cached('vechain-nodes', async () => {
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
      
      const data: VeChainNodesResponse = await response.json()
      
      if (!data.status.success) {
        throw new Error(`API error: ${data.status.message}`)
      }
      
      const nodesData: VeChainNodesData = {
        xnode_tokens: data.data.xnode_tokens,
        economic_node_tokens: data.data.economic_node_tokens,
        authority_nodes: AUTHORITY_NODES,
        timestamp: data.meta.timestamp
      }
      
      return nodesData
    } catch (error) {
      console.error('Error fetching VeChain nodes data:', error)
      return null
    }
  }, 24 * 60 * 60 * 1000) as Promise<VeChainNodesData | null> // Cache for 24 hours (1 day)
}

export function formatNodeCount(count: number): string {
  return count.toLocaleString()
}

export function getNodeTypeColor(nodeType: 'xnode' | 'economic' | 'authority'): string {
  switch (nodeType) {
    case 'xnode':
      return 'text-cyan-300'
    case 'economic':
      return 'text-green-300'
    case 'authority':
      return 'text-pink-300'
    default:
      return 'text-neutral-400'
  }
}

export function getNodeTypeLabel(nodeType: 'xnode' | 'economic' | 'authority'): string {
  switch (nodeType) {
    case 'xnode':
      return 'X-Node Tokens'
    case 'economic':
      return 'Economic Node Tokens'
    case 'authority':
      return 'Authority Nodes'
    default:
      return 'Unknown'
  }
}

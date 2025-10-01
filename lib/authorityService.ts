import { cached } from './cache'

export type AuthorityNode = {
  address: string
  endorser: string
  blocks_total_signed: number
  vtho_total_rewarded: number
  last_block_signed: number
  last_block_timestamp: number
}

export type AuthorityNodesResponse = {
  status: {
    success: boolean
    message: string
  }
  data: Record<string, {
    endorser: string
    blocks_total_signed: number
    vtho_total_rewarded: number
    last_block_signed: number
    last_block_timestamp: number
  }>
  meta: {
    count: number
    expanded: boolean
    timestamp: number
  }
}

const VECHAIN_STATS_API_KEY = 'f121dd4fda838a2fd6b0ba84ed3d83b2302392b1bec7c4cf3096af8f5500b954'
const VECHAIN_STATS_API_URL = 'https://api.vechainstats.com/v2/network/authority-nodes?expanded=true'

export async function fetchAuthorityNodes(): Promise<AuthorityNode[] | null> {
  return cached('authority-nodes', async () => {
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
      
      const data: AuthorityNodesResponse = await response.json()
      
      if (!data.status.success) {
        throw new Error(`API error: ${data.status.message}`)
      }
      
      // Transform the data into an array of AuthorityNode objects
      const authorityNodes: AuthorityNode[] = Object.entries(data.data).map(([address, nodeData]) => ({
        address,
        endorser: nodeData.endorser,
        blocks_total_signed: nodeData.blocks_total_signed,
        vtho_total_rewarded: nodeData.vtho_total_rewarded,
        last_block_signed: nodeData.last_block_signed,
        last_block_timestamp: nodeData.last_block_timestamp
      }))
      
      return authorityNodes
    } catch (error) {
      console.error('Error fetching authority nodes:', error)
      return null
    }
  }, 24 * 60 * 60 * 1000) as Promise<AuthorityNode[] | null> // Cache for 24 hours (1 day)
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatVTHO(vtho: number): string {
  if (vtho >= 1000000) {
    return `${(vtho / 1000000).toFixed(1)}M`
  } else if (vtho >= 1000) {
    return `${(vtho / 1000).toFixed(1)}K`
  } else {
    return vtho.toLocaleString()
  }
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleString()
}

export function generateNodeAvatar(address: string): {
  backgroundColor: string
  textColor: string
  pattern: string
  initial: string
  shape: string
  face: string
} {
  // Generate a consistent hash from the address
  const hash = address.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  // Generate different patterns based on hash
  const patterns = [
    'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.2) 0%, transparent 50%)',
    'linear-gradient(45deg, rgba(255,255,255,0.3) 0%, transparent 50%), linear-gradient(-45deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
    'radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, transparent 70%)',
    'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%), linear-gradient(225deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
    'conic-gradient(from 0deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(255,255,255,0.2) 100%)'
  ]
  
  const baseColors = [
    { bg: '#ef4444', text: '#ffffff' }, // red
    { bg: '#3b82f6', text: '#ffffff' }, // blue
    { bg: '#10b981', text: '#ffffff' }, // green
    { bg: '#f59e0b', text: '#ffffff' }, // yellow
    { bg: '#8b5cf6', text: '#ffffff' }, // purple
    { bg: '#ec4899', text: '#ffffff' }, // pink
    { bg: '#6366f1', text: '#ffffff' }, // indigo
    { bg: '#f97316', text: '#ffffff' }, // orange
    { bg: '#14b8a6', text: '#ffffff' }, // teal
    { bg: '#06b6d4', text: '#ffffff' }, // cyan
    { bg: '#84cc16', text: '#ffffff' }, // lime
    { bg: '#f43f5e', text: '#ffffff' }  // rose
  ]
  
  // Unique shapes for avatars
  const shapes = [
    'circle', 'square', 'diamond', 'hexagon', 'triangle', 'star', 'heart', 'shield'
  ]
  
  // Face expressions
  const faces = [
    '😊', '😎', '🤖', '👑', '⚡', '🔥', '💎', '🌟', '🚀', '🎯', '💫', '⭐'
  ]
  
  const colorIndex = Math.abs(hash) % baseColors.length
  const patternIndex = Math.abs(hash >> 4) % patterns.length
  const shapeIndex = Math.abs(hash >> 8) % shapes.length
  const faceIndex = Math.abs(hash >> 12) % faces.length
  
  const selectedColor = baseColors[colorIndex]
  const selectedPattern = patterns[patternIndex]
  const selectedShape = shapes[shapeIndex]
  const selectedFace = faces[faceIndex]
  
  return {
    backgroundColor: selectedColor.bg,
    textColor: selectedColor.text,
    pattern: selectedPattern,
    initial: selectedFace,
    shape: selectedShape,
    face: selectedFace
  }
}

export function getNodeAvatar(address: string): string {
  const avatar = generateNodeAvatar(address)
  return `${avatar.backgroundColor} text-${avatar.textColor} font-bold`
}

export function getNodeInitial(address: string): string {
  const avatar = generateNodeAvatar(address)
  return avatar.initial
}

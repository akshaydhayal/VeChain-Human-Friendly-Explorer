import { cached } from '@/lib/cache'
import { getThorClient } from '@/lib/thorClient'

export type VeChainBlock = {
  number: number
  id: string
  timestamp: number
  size: number
  gasLimit: number
  gasUsed: number
  beneficiary: string
  signer: string
  totalScore: number
  parentID: string
  baseFeePerGas?: string
  transactions: Array<{ id: string; reverted?: boolean; gasUsed?: number; paid?: string; reward?: string }>
}

export async function fetchLatestBlock(): Promise<VeChainBlock | null> {
  return cached('ve:latest', async () => {
    try {
      const thor = getThorClient()
      const b = await thor.blocks.getBestBlockExpanded()
      if (!b) return null
      return b as unknown as VeChainBlock
    } catch (err) {
      return null
    }
  }) as Promise<VeChainBlock | null>
}

export async function fetchBlockByIdOrNumber(idOrNumber: string | number): Promise<VeChainBlock | null> {
  return cached(`ve:block:${idOrNumber}`, async () => {
    try {
      const thor = getThorClient()
      const b = await thor.blocks.getBlockExpanded(idOrNumber as any)
      if (!b) return null
      return b as unknown as VeChainBlock
    } catch (err) {
      return null
    }
  }) as Promise<VeChainBlock | null>
}

export async function fetchRecentBlocks(count = 5): Promise<VeChainBlock[]> {
  const latest = await fetchLatestBlock()
  if (!latest) return []
  const heights = Array.from({ length: count }, (_, i) => latest.number - i)
  const blocks = await Promise.all(heights.map((h) => fetchBlockByIdOrNumber(h)))
  return blocks.filter(Boolean) as VeChainBlock[]
}

export function formatWeiHexToEthLike(hex?: string): string {
  if (!hex) return '0'
  // hex string to decimal BigInt
  const v = BigInt(hex)
  // show in gwei-like units for readability
  const gwei = Number(v) / 1e9
  return `${gwei.toFixed(4)} gwei`
}

export function formatTimestamp(ts: number): string {
  const d = new Date(ts * 1000)
  return d.toUTCString()
}



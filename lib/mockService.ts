import { cached } from '@/lib/cache'

export type NetworkStats = {
  tps: number
  validators: number
  priceUsd: number
}

export async function getNetworkStats(): Promise<NetworkStats> {
  return cached('network:stats', async () => {
    return {
      tps: 1396,
      validators: 958,
      priceUsd: 0.025,
    }
  })
}

export type Block = {
  height: number
  hash: string
  leader: string
  txCount: number
  successfulTxs: number
  failedTxs: number
  createdAt: string
}

export async function getRecentBlocks(): Promise<Block[]> {
  return cached('blocks:recent', async () => {
    return Array.from({ length: 5 }).map((_, i) => ({
      height: 370286052 - i,
      hash: `hash_${i}`,
      leader: 'Unknown Validator',
      txCount: 1400 - i * 3,
      successfulTxs: 1350 - i * 2,
      failedTxs: 50 + i,
      createdAt: new Date(Date.now() - i * 60000).toISOString(),
    }))
  })
}

export async function getBlockByHeight(height: number): Promise<Block> {
  return cached(`block:${height}`, async () => {
    return {
      height,
      hash: `hash_${height}`,
      leader: 'binance staking',
      txCount: 1480,
      successfulTxs: 1412,
      failedTxs: 68,
      createdAt: new Date().toISOString(),
    }
  })
}

export type Tx = { signature: string; type: string; status: 'Success' | 'Failed' }

export async function getBlockTxs(height: number): Promise<Tx[]> {
  return cached(`block:${height}:txs`, async () => {
    return Array.from({ length: 25 }).map((_, i) => ({
      signature: `sig_${height}_${i}_${Math.random().toString(36).slice(2, 8)}`,
      type: 'Vote',
      status: 'Success',
    }))
  })
}



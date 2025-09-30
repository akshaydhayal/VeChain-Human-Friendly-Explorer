'use client'

import { useState, useEffect, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { RealBlockService, RealBlockUpdate } from '@/lib/realBlockService'
import { formatTimestamp } from '@/lib/blockService'

type RecentBlock = {
  number: number
  id: string
  timestamp: number
  transactionCount: number
  timeAgo: string
}

export default function RecentBlocksWebSocket() {
  const [blocks, setBlocks] = useState<RecentBlock[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const wsRef = useRef<RealBlockService | null>(null)
  const networkRef = useRef<'mainnet' | 'testnet'>('mainnet')

  useEffect(() => {
    // Get current network from localStorage
    const savedNetwork = localStorage.getItem('vechain-network') || 'mainnet'
    networkRef.current = savedNetwork as 'mainnet' | 'testnet'

    // Initialize Real Block Service
    wsRef.current = new RealBlockService(
      handleBlockUpdate,
      handleConnectionChange,
      networkRef.current
    )

    // Connect to Real Block Service
    wsRef.current.connect()

    // Load some recent blocks immediately
    loadRecentBlocks()

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect()
      }
    }
  }, [])

  const loadRecentBlocks = async () => {
    try {
      const { getThorClient } = await import('@/lib/thorClient')
      const thor = getThorClient()
      const latestBlock = await thor.blocks.getBestBlockExpanded()
      
      if (latestBlock) {
        // Load the latest 5 blocks
        const blockNumbers = Array.from({ length: 5 }, (_, i) => latestBlock.number - i)
        
        for (const blockNumber of blockNumbers) {
          try {
            const block = await thor.blocks.getBlockExpanded(blockNumber)
            if (block) {
              const blockUpdate: RealBlockUpdate = {
                number: block.number,
                id: block.id,
                size: block.size,
                parentID: block.parentID,
                timestamp: block.timestamp,
                gasLimit: block.gasLimit,
                beneficiary: block.beneficiary,
                gasUsed: block.gasUsed,
                baseFeePerGas: block.baseFeePerGas || '0x0',
                totalScore: block.totalScore,
                txsRoot: block.txsRoot,
                txsFeatures: block.txsFeatures,
                stateRoot: block.stateRoot,
                receiptsRoot: block.receiptsRoot,
                com: block.com,
                signer: block.signer,
                transactions: block.transactions || [],
                obsolete: block.obsolete || false
              }
              handleBlockUpdate(blockUpdate)
            }
          } catch (error) {
            console.error(`Failed to load block #${blockNumber}:`, error)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load recent blocks:', error)
    }
  }

  // Listen for network changes
  useEffect(() => {
    const handleStorageChange = () => {
      const newNetwork = localStorage.getItem('vechain-network') || 'mainnet'
      if (newNetwork !== networkRef.current) {
        networkRef.current = newNetwork as 'mainnet' | 'testnet'
        if (wsRef.current) {
          wsRef.current.updateNetwork(networkRef.current)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleBlockUpdate = (block: RealBlockUpdate) => {
    const now = Date.now()
    const blockTime = block.timestamp * 1000
    const diffSeconds = Math.floor((now - blockTime) / 1000)
    
    let timeAgo: string
    if (diffSeconds < 60) {
      timeAgo = `${diffSeconds} seconds ago`
    } else if (diffSeconds < 3600) {
      const minutes = Math.floor(diffSeconds / 60)
      timeAgo = `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else {
      timeAgo = formatDistanceToNow(new Date(blockTime), { addSuffix: true })
    }

    // Debug: Log transaction count and block data
    console.log(`Block #${block.number}:`, {
      transactions: block.transactions,
      transactionCount: block.transactions ? block.transactions.length : 0,
      blockData: block
    })

    const newBlock: RecentBlock = {
      number: block.number,
      id: block.id,
      timestamp: block.timestamp,
      transactionCount: block.transactions ? block.transactions.length : 0,
      timeAgo
    }

    setBlocks(prevBlocks => {
      // Remove any existing block with the same number to prevent duplicates
      const filtered = prevBlocks.filter(b => b.number !== block.number)
      
      // Add new block to the beginning
      const updated = [newBlock, ...filtered]
      
      // Sort by block number (descending) and keep only 5 blocks
      return updated
        .sort((a, b) => b.number - a.number)
        .slice(0, 5)
    })

    setIsLoading(false)
  }

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected)
    if (connected) {
      setIsLoading(false)
    }
  }

  const formatBlockId = (id: string) => {
    return `${id.slice(0, 4)}....${id.slice(-4)}`
  }

  // Update timeAgo for all blocks periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setBlocks(prevBlocks => 
        prevBlocks.map(block => {
          const now = Date.now()
          const blockTime = block.timestamp * 1000
          const diffSeconds = Math.floor((now - blockTime) / 1000)
          
          let timeAgo: string
          if (diffSeconds < 60) {
            timeAgo = `${diffSeconds} seconds ago`
          } else if (diffSeconds < 3600) {
            const minutes = Math.floor(diffSeconds / 60)
            timeAgo = `${minutes} minute${minutes > 1 ? 's' : ''} ago`
          } else {
            timeAgo = formatDistanceToNow(new Date(blockTime), { addSuffix: true })
          }
          
          return {
            ...block,
            timeAgo
          }
        })
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="card">
        <div className="px-4 py-3 border-b border-border uptitle flex items-center justify-between">
          <span>Recent Blocks</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-neutral-400">Connecting...</span>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <div className="text-sm text-neutral-400">Connecting to blockchain...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="px-4 py-3 border-b border-border uptitle flex items-center justify-between">
        <span>Recent Blocks</span>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-danger'}`}></div>
          <span className="text-xs text-neutral-400">
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>
      <div className="divide-y divide-border">
        {blocks.length === 0 ? (
          <div className="p-6 text-center text-neutral-400">
            <div className="text-sm">Waiting for new blocks...</div>
          </div>
        ) : (
          blocks.map((block, index) => (
            <Link 
              key={`${block.number}-${block.id}`}
              href={`/block/${block.number}`}
              className="block p-4 hover:bg-black/20 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    {index === 0 ? '🔥' : block.number.toString().slice(-2)}
                  </div>
                  <div>
                    <div className="font-mono text-sm font-semibold">
                      Block #{block.number.toLocaleString()}
                    </div>
                    <div className="text-xs text-neutral-400">
                      {block.timeAgo}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm text-primary">
                    {formatBlockId(block.id)}
                  </div>
                  <div className="text-xs text-neutral-400">
                    {block.transactionCount} txs
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

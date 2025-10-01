'use client'

import { useState, useEffect } from 'react'
import { fetchVeChainNodes, VeChainNodesData, formatNodeCount, getNodeTypeColor, getNodeTypeLabel } from '@/lib/nodesService'
import { clientCache, CACHE_KEYS, CACHE_TTL } from '@/lib/clientCache'

export default function VeChainNodes() {
  const [nodesData, setNodesData] = useState<VeChainNodesData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadNodesData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Check client-side cache first
        const cachedData = clientCache.get<VeChainNodesData>(CACHE_KEYS.VECHAIN_NODES)
        if (cachedData) {
          setNodesData(cachedData)
          setIsLoading(false)
          return
        }
        
        // If no cache, fetch from API
        const data = await fetchVeChainNodes()
        
        if (data) {
          setNodesData(data)
          // Store in client cache
          clientCache.set(CACHE_KEYS.VECHAIN_NODES, data, CACHE_TTL.NODES)
        } else {
          setError('Failed to fetch nodes data')
        }
      } catch (err) {
        console.error('Error loading nodes data:', err)
        setError('Error loading nodes data')
      } finally {
        setIsLoading(false)
      }
    }

    loadNodesData()
  }, [])

  if (isLoading) {
    return (
      <div className="card p-3">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <div className="text-sm text-neutral-400">Loading VeChain nodes data...</div>
        </div>
      </div>
    )
  }

  if (error || !nodesData) {
    return (
      <div className="card p-3">
        <div className="text-center">
          <div className="text-sm text-neutral-400 mb-2">VeChain Nodes Unavailable</div>
          <div className="text-xs text-neutral-500">{error || 'Unable to load nodes data'}</div>
        </div>
      </div>
    )
  }

  const totalNodes = nodesData.xnode_tokens + nodesData.economic_node_tokens + nodesData.authority_nodes

  return (
    <div className="card p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">VECHAIN NODES</h3>
          <div className="w-4 h-4 rounded-full bg-neutral-600 flex items-center justify-center">
            <span className="text-xs text-neutral-300">i</span>
          </div>
        </div>
        <div className="text-xs text-neutral-400">
          Updated {new Date(nodesData.timestamp * 1000).toLocaleDateString()}
        </div>
      </div>

      {/* Main Total Display */}
      <div className="text-center mb-3">
        <div className="text-4xl font-bold text-primary mb-1">
          {formatNodeCount(totalNodes)}
        </div>
        <div className="text-sm text-neutral-400">
          Total VeChain network nodes
        </div>
      </div>

      {/* Node Type Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* X-Node Tokens */}
        <div className="text-center p-2 bg-neutral-800/50 rounded-lg">
          <div className={`text-lg font-bold mb-1 ${getNodeTypeColor('xnode')}`}>
            {formatNodeCount(nodesData.xnode_tokens)}
          </div>
          <div className="text-xs text-neutral-400">
            {getNodeTypeLabel('xnode')}
          </div>
        </div>

        {/* Economic Node Tokens */}
        <div className="text-center p-2 bg-neutral-800/50 rounded-lg">
          <div className={`text-lg font-bold mb-1 ${getNodeTypeColor('economic')}`}>
            {formatNodeCount(nodesData.economic_node_tokens)}
          </div>
          <div className="text-xs text-neutral-400">
            {getNodeTypeLabel('economic')}
          </div>
        </div>

        {/* Authority Nodes */}
        <div className="text-center p-2 bg-neutral-800/50 rounded-lg">
          <div className={`text-lg font-bold mb-1 ${getNodeTypeColor('authority')}`}>
            {nodesData.authority_nodes}
          </div>
          <div className="text-xs text-neutral-400">
            {getNodeTypeLabel('authority')}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-3 text-center">
        <div className="text-sm text-neutral-400">
          <span className="text-primary font-semibold">{nodesData.authority_nodes}</span> authority nodes form the consensus
        </div>
      </div>
    </div>
  )
}

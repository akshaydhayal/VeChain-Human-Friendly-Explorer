'use client'

import { useState, useEffect } from 'react'
import { fetchVeChainNetwork, VeChainNetworkData, formatNetworkCount, formatVTHOBurned, getNetworkTypeColor, getNetworkTypeLabel } from '@/lib/networkService'
import { clientCache, CACHE_KEYS, CACHE_TTL } from '@/lib/clientCache'

export default function VeChainNetwork() {
  const [networkData, setNetworkData] = useState<VeChainNetworkData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadNetworkData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Check client-side cache first
        const cachedData = clientCache.get<VeChainNetworkData>(CACHE_KEYS.VECHAIN_NETWORK)
        if (cachedData) {
          setNetworkData(cachedData)
          setIsLoading(false)
          return
        }
        
        // If no cache, fetch from API
        const data = await fetchVeChainNetwork()
        
        if (data) {
          setNetworkData(data)
          // Store in client cache
          clientCache.set(CACHE_KEYS.VECHAIN_NETWORK, data, CACHE_TTL.NETWORK)
        } else {
          setError('Failed to fetch network data')
        }
      } catch (err) {
        console.error('Error loading network data:', err)
        setError('Error loading network data')
      } finally {
        setIsLoading(false)
      }
    }

    loadNetworkData()
  }, [])

  if (isLoading) {
    return (
      <div className="card p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <div className="text-sm text-neutral-400">Loading network data...</div>
        </div>
      </div>
    )
  }

  if (error || !networkData) {
    return (
      <div className="card p-4">
        <div className="text-center">
          <div className="text-sm text-neutral-400 mb-2">Network Data Unavailable</div>
          <div className="text-xs text-neutral-500">{error || 'Unable to load network data'}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">NETWORK TOTALS</h3>
          <div className="w-4 h-4 rounded-full bg-neutral-600 flex items-center justify-center">
            <span className="text-xs text-neutral-300">i</span>
          </div>
        </div>
        <div className="text-xs text-neutral-400">
          Updated {new Date(networkData.timestamp * 1000).toLocaleDateString()}
        </div>
      </div>

      {/* Network Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Blocks */}
        <div className="text-center p-3 bg-neutral-800/50 rounded-lg">
          <div className={`text-lg font-bold mb-1 ${getNetworkTypeColor('blocks')}`}>
            {formatNetworkCount(networkData.block_count)}
          </div>
          <div className="text-xs text-neutral-400">
            {getNetworkTypeLabel('blocks')}
          </div>
        </div>

        {/* Total Transactions */}
        <div className="text-center p-3 bg-neutral-800/50 rounded-lg">
          <div className={`text-lg font-bold mb-1 ${getNetworkTypeColor('transactions')}`}>
            {formatNetworkCount(networkData.txns_total_count)}
          </div>
          <div className="text-xs text-neutral-400">
            {getNetworkTypeLabel('transactions')}
          </div>
        </div>

        {/* Total Clauses */}
        <div className="text-center p-3 bg-neutral-800/50 rounded-lg">
          <div className={`text-lg font-bold mb-1 ${getNetworkTypeColor('clauses')}`}>
            {formatNetworkCount(networkData.clauses_total_count)}
          </div>
          <div className="text-xs text-neutral-400">
            {getNetworkTypeLabel('clauses')}
          </div>
        </div>

        {/* VTHO Burned */}
        <div className="text-center p-3 bg-neutral-800/50 rounded-lg">
          <div className={`text-lg font-bold mb-1 ${getNetworkTypeColor('vtho')}`}>
            {formatVTHOBurned(networkData.vtho_total_burned)}
          </div>
          <div className="text-xs text-neutral-400">
            {getNetworkTypeLabel('vtho')}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-3 text-center">
        <div className="text-sm text-neutral-400">
          Network running for <span className="text-primary font-semibold">{networkData.days}</span> days
        </div>
      </div>
    </div>
  )
}

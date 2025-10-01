'use client'

import { useState, useEffect } from 'react'
import { fetchTokenPrices, PriceData } from '@/lib/priceService'
import TokenPriceCard from './TokenPriceCard'

export default function PriceSection() {
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPrices = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchTokenPrices()
        
        if (data) {
          setPriceData(data)
        } else {
          setError('Failed to fetch price data')
        }
      } catch (err) {
        console.error('Error loading prices:', err)
        setError('Error loading price data')
      } finally {
        setIsLoading(false)
      }
    }

    loadPrices()
    
    // Refresh prices every 5 minutes
    const interval = setInterval(loadPrices, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <div className="text-sm text-neutral-400">Loading token prices...</div>
        </div>
      </div>
    )
  }

  if (error || !priceData) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Token Prices</div>
          <div className="text-xs text-neutral-400">Loading...</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm text-neutral-400">VET PRICE</div>
                <div className="text-2xl font-bold text-white">--</div>
              </div>
              <div className="text-sm font-semibold text-neutral-500">--%</div>
            </div>
            <div className="text-xs text-neutral-500">Price data loading...</div>
          </div>
          
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm text-neutral-400">VTHO PRICE</div>
                <div className="text-2xl font-bold text-white">--</div>
              </div>
              <div className="text-sm font-semibold text-neutral-500">--%</div>
            </div>
            <div className="text-xs text-neutral-500">Price data loading...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="text-lg font-semibold">Token Prices</div>
        <div className="text-xs text-neutral-400">
          Updated {new Date(priceData.vet.last_updated).toLocaleTimeString()}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TokenPriceCard token={priceData.vet} />
        <TokenPriceCard token={priceData.vtho} />
      </div>
    </div>
  )
}


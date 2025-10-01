'use client'

import { useState, useEffect } from 'react'
import { getTokenChartData, ChartData, Timeframe, formatPrice, formatPercentage } from '@/lib/alchemyService'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { clientCache, CACHE_KEYS, CACHE_TTL } from '@/lib/clientCache'

type PriceChartProps = {
  symbol: string
  tokenName: string
  className?: string
}

const timeframes: { key: Timeframe; label: string }[] = [
  { key: '1h', label: '1H' },
  { key: '24h', label: '24H' },
  { key: '7d', label: '7D' },
  { key: '1m', label: '1M' }
]

export default function PriceChart({ symbol, tokenName, className = '' }: PriceChartProps) {
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1m')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allTimeframeData, setAllTimeframeData] = useState<Record<Timeframe, ChartData | null>>({
    '1h': null,
    '24h': null,
    '7d': null,
    '1m': null
  })

  useEffect(() => {
    const loadAllTimeframeData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Check cache for all timeframes first
        const cacheKey = `${CACHE_KEYS.PRICE_CHARTS}_${symbol}`
        const cachedAllData = clientCache.get<Record<Timeframe, ChartData | null>>(cacheKey)
        
        if (cachedAllData) {
          setAllTimeframeData(cachedAllData)
          setChartData(cachedAllData[selectedTimeframe])
          setIsLoading(false)
          return
        }
        
        // Load all timeframes in parallel
        const promises = timeframes.map(async ({ key }) => {
          try {
            const data = await getTokenChartData(symbol, key)
            return { timeframe: key, data }
          } catch (err) {
            console.error(`Error loading ${key} data:`, err)
            return { timeframe: key, data: null }
          }
        })
        
        const results = await Promise.all(promises)
        
        // Update all timeframe data
        const newAllData: Record<Timeframe, ChartData | null> = {
          '1h': null,
          '24h': null,
          '7d': null,
          '1m': null
        }
        
        results.forEach(({ timeframe, data }) => {
          newAllData[timeframe as Timeframe] = data
        })
        
        setAllTimeframeData(newAllData)
        
        // Cache the data
        clientCache.set(cacheKey, newAllData, CACHE_TTL.CHARTS)
        
        // Set the selected timeframe data
        const selectedData = newAllData[selectedTimeframe]
        if (selectedData) {
          setChartData(selectedData)
        } else {
          setError('Failed to fetch chart data')
        }
      } catch (err) {
        console.error('Error loading chart data:', err)
        setError('Error loading chart data')
      } finally {
        setIsLoading(false)
      }
    }

    loadAllTimeframeData()
  }, [symbol])

  const handleTimeframeChange = (timeframe: Timeframe) => {
    setSelectedTimeframe(timeframe)
    
    // Switch to preloaded data instantly
    const preloadedData = allTimeframeData[timeframe]
    if (preloadedData) {
      setChartData(preloadedData)
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 shadow-xl backdrop-blur-sm">
          <div className="text-xs text-neutral-400 mb-1">
            {new Date(data.timestamp).toLocaleString()}
          </div>
          <div className="text-white font-bold text-sm">
            {formatPrice(data.value)}
          </div>
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className={`card p-4 ${className}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <div className="text-sm text-neutral-400">Loading {tokenName} data for all timeframes...</div>
        </div>
      </div>
    )
  }

  if (error || !chartData) {
    return (
      <div className={`card p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-neutral-400">{symbol} PRICE</div>
            <div className="text-xl font-bold text-white">--</div>
          </div>
          <div className="text-sm font-semibold text-neutral-500">
            --%
          </div>
        </div>
        
        <div className="flex gap-1 mb-4">
          {timeframes.map(({ key, label }) => (
            <button
              key={key}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                selectedTimeframe === key
                  ? 'bg-primary text-white border border-primary shadow-lg'
                  : 'bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700 hover:border-neutral-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        
        <div className="h-40 w-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-sm text-neutral-400 mb-2">Chart temporarily unavailable</div>
            <div className="text-xs text-neutral-500">Retrying...</div>
          </div>
        </div>
      </div>
    )
  }

  const isPositive = chartData.priceChange >= 0

  return (
    <div className={`card p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs text-neutral-400">{symbol} PRICE</div>
          <div className="text-xl font-bold text-white">{formatPrice(chartData.currentPrice)}</div>
        </div>
        <div className={`text-sm font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
          {formatPercentage(chartData.priceChangePercent)}
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-1 mb-4">
        {timeframes.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleTimeframeChange(key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
              selectedTimeframe === key
                ? 'bg-primary text-white border border-primary shadow-lg'
                : 'bg-neutral-800 text-neutral-300 border border-neutral-700 hover:bg-neutral-700 hover:border-neutral-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="timestamp" 
              stroke="#9CA3AF"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                const date = new Date(value)
                if (selectedTimeframe === '1h') {
                  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                } else if (selectedTimeframe === '24h') {
                  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                } else if (selectedTimeframe === '7d') {
                  return date.toLocaleDateString([], { weekday: 'short', hour: 'numeric' })
                } else {
                  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
                }
              }}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatPrice(value)}
              domain={['dataMin', 'dataMax']}
              allowDataOverflow={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={isPositive ? '#10B981' : '#EF4444'}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: isPositive ? '#10B981' : '#EF4444', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Price trend indicator */}
      <div className="mt-3 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-success' : 'bg-danger'}`}></div>
        <span className="text-xs text-neutral-400">
          {isPositive ? 'Price up' : 'Price down'} in {selectedTimeframe}
        </span>
      </div>
    </div>
  )
}

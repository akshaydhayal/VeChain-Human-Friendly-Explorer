'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { UserNFTData } from '@/lib/accountNftService'

interface NFTPieChartProps {
  nftData: UserNFTData
}

interface ChartData {
  name: string
  value: number
  percentage: number
  color: string
}

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#06b6d4', '#f97316', '#ec4899', '#84cc16', '#6366f1',
  '#14b8a6', '#f43f5e', '#a855f7', '#22c55e', '#eab308',
  '#dc2626', '#7c3aed', '#0891b2', '#be185d', '#059669'
]

export default function NFTPieChart({ nftData }: NFTPieChartProps) {
  if (nftData.totalNFTs === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">NFT Distribution</h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">No NFTs to display</p>
        </div>
      </div>
    )
  }

  // Group NFTs by collection
  const collections = nftData.nfts.reduce((acc, nft) => {
    if (!acc[nft.collectionId]) {
      acc[nft.collectionId] = {
        name: nft.collectionName,
        count: 0
      }
    }
    acc[nft.collectionId].count++
    return acc
  }, {} as Record<string, { name: string; count: number }>)

  // Prepare chart data
  const chartData: ChartData[] = Object.entries(collections).map(([id, collection], index) => ({
    name: collection.name,
    value: collection.count,
    percentage: (collection.count / nftData.totalNFTs) * 100,
    color: COLORS[index % COLORS.length]
  }))

  // Sort by count (largest first)
  const sortedData = chartData.sort((a, b) => b.value - a.value)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-blue-400">
            {data.value} NFT{data.value !== 1 ? 's' : ''}
          </p>
          <p className="text-gray-400">
            {data.percentage.toFixed(2)}% of total
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-300">
              {entry.value} ({entry.payload.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-white mb-3">NFT Distribution</h3>
      
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Chart Section */}
        <div className="flex-1">
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sortedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {sortedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="flex-1">
          <div className="space-y-2">
            <div className="bg-gray-700 rounded-lg p-2 flex items-center justify-between">
              <span className="text-gray-400 text-sm">Total NFTs</span>
              <span className="text-white font-semibold">{nftData.totalNFTs}</span>
            </div>
            <div className="bg-gray-700 rounded-lg p-2 flex items-center justify-between">
              <span className="text-gray-400 text-sm">Collections</span>
              <span className="text-white font-semibold">{sortedData.length}</span>
            </div>
            <div className="bg-gray-700 rounded-lg p-2 flex items-center justify-between">
              <span className="text-gray-400 text-sm">Largest Collection</span>
              <span className="text-white font-semibold">{sortedData[0]?.name || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

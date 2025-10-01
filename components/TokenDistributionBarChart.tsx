'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { AccountBalance } from '@/lib/accountService'

interface TokenDistributionBarChartProps {
  tokenBalances: AccountBalance[]
  vetBalance: string
  vthoBalance: string
}

interface ChartData {
  name: string
  value: number
  percentage: number
  color: string
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // yellow
  '#ef4444', // red
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ec4899', // pink
  '#84cc16', // lime
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#f43f5e', // rose
]

export default function TokenDistributionBarChart({ 
  tokenBalances, 
  vetBalance, 
  vthoBalance 
}: TokenDistributionBarChartProps) {
  // Convert balances to numbers for calculation
  const vetValue = parseFloat(vetBalance) || 0
  const vthoValue = parseFloat(vthoBalance) || 0
  
  // Calculate total value
  const totalValue = vetValue + vthoValue + tokenBalances.reduce((sum, token) => {
    return sum + (parseFloat(token.balance) || 0)
  }, 0)

  if (totalValue === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Token Distribution (Bar Chart)</h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">No tokens to display</p>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const chartData: ChartData[] = []
  
  // Add VET
  if (vetValue > 0) {
    chartData.push({
      name: 'VET',
      value: vetValue,
      percentage: (vetValue / totalValue) * 100,
      color: COLORS[0]
    })
  }
  
  // Add VTHO
  if (vthoValue > 0) {
    chartData.push({
      name: 'VTHO',
      value: vthoValue,
      percentage: (vthoValue / totalValue) * 100,
      color: COLORS[1]
    })
  }
  
  // Add other tokens
  tokenBalances.forEach((token, index) => {
    const value = parseFloat(token.balance) || 0
    if (value > 0) {
      chartData.push({
        name: token.symbol,
        value: value,
        percentage: (value / totalValue) * 100,
        color: COLORS[(index + 2) % COLORS.length]
      })
    }
  })

  // Sort by value (largest first) and take top 10
  const sortedData = chartData.sort((a, b) => b.value - a.value).slice(0, 10)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-blue-400">
            {data.value.toLocaleString()} {data.name}
          </p>
          <p className="text-gray-400">
            {data.percentage.toFixed(2)}% of total
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Token Distribution (Bar Chart)</h3>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm">Total Tokens</div>
          <div className="text-white font-semibold text-lg">
            {chartData.length}
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm">Largest Holding</div>
          <div className="text-white font-semibold text-lg">
            {sortedData[0]?.name || 'N/A'}
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm">Top 3 Share</div>
          <div className="text-white font-semibold text-lg">
            {sortedData.slice(0, 3).reduce((sum, item) => sum + item.percentage, 0).toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm">Diversification</div>
          <div className="text-white font-semibold text-lg">
            {sortedData.length > 5 ? 'High' : sortedData.length > 2 ? 'Medium' : 'Low'}
          </div>
        </div>
      </div>
    </div>
  )
}

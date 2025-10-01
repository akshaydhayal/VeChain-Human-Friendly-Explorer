'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { AccountBalance } from '@/lib/accountService'

interface TokenDistributionChartProps {
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
  '#a855f7', // violet
  '#22c55e', // emerald
  '#eab308', // amber
  '#dc2626', // red-600
  '#7c3aed', // violet-600
  '#0891b2', // cyan-600
  '#be185d', // pink-600
  '#059669', // emerald-600
]

export default function TokenDistributionChart({ 
  tokenBalances, 
  vetBalance, 
  vthoBalance 
}: TokenDistributionChartProps) {
  // Convert balances to numbers for calculation
  const vetValue = parseFloat(vetBalance) || 0
  const vthoValue = parseFloat(vthoBalance) || 0
  
  // Calculate total value (simplified - in real app you'd use USD values)
  const totalValue = vetValue + vthoValue + tokenBalances.reduce((sum, token) => {
    return sum + (parseFloat(token.balance) || 0)
  }, 0)

  if (totalValue === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Token Distribution</h3>
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

  // Sort by value (largest first)
  chartData.sort((a, b) => b.value - a.value)

  const CustomTooltip = ({ active, payload }: any) => {
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
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Token Distribution</h3>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm">Total Tokens</div>
          <div className="text-white font-semibold text-lg">
            {chartData.length}
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm">Largest Holding</div>
          <div className="text-white font-semibold text-lg">
            {chartData[0]?.name || 'N/A'}
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm">Top 3 Share</div>
          <div className="text-white font-semibold text-lg">
            {chartData.slice(0, 3).reduce((sum, item) => sum + item.percentage, 0).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  )
}

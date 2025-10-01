'use client'

import { AccountBalance } from '@/lib/accountService'

interface TokenPercentageChartProps {
  tokenBalances: AccountBalance[]
  vetBalance: string
  vthoBalance: string
}

interface TokenData {
  name: string
  value: number
  percentage: number
  color: string
}

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#06b6d4', '#f97316', '#ec4899', '#84cc16', '#6366f1'
]

export default function TokenPercentageChart({ 
  tokenBalances, 
  vetBalance, 
  vthoBalance 
}: TokenPercentageChartProps) {
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
        <h3 className="text-lg font-semibold text-white mb-4">Token Percentage Breakdown</h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">No tokens to display</p>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const chartData: TokenData[] = []
  
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

  // Sort by percentage (largest first)
  const sortedData = chartData.sort((a, b) => b.percentage - a.percentage)

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Token Percentage Breakdown</h3>
      
      <div className="space-y-4">
        {sortedData.map((token, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: token.color }}
                />
                <span className="text-white font-medium">{token.name}</span>
              </div>
              <div className="text-right">
                <div className="text-blue-400 font-semibold">
                  {token.percentage.toFixed(2)}%
                </div>
                <div className="text-gray-400 text-sm">
                  {token.value.toLocaleString()} {token.name}
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${token.percentage}%`,
                  backgroundColor: token.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm">Total Tokens</div>
          <div className="text-white font-semibold text-lg">
            {sortedData.length}
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm">Largest Share</div>
          <div className="text-white font-semibold text-lg">
            {sortedData[0]?.percentage.toFixed(1)}%
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

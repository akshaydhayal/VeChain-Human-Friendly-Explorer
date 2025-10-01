'use client'

import { TokenPrice } from '@/lib/priceService'
import { formatPrice, formatPercentage, formatMarketCap } from '@/lib/priceService'

type TokenPriceCardProps = {
  token: TokenPrice
  className?: string
}

export default function TokenPriceCard({ token, className = '' }: TokenPriceCardProps) {
  const isPositive = token.price_change_percentage_24h >= 0
  
  return (
    <div className={`card p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-neutral-400">{token.symbol} PRICE</div>
          <div className="text-2xl font-bold text-white">{formatPrice(token.current_price)}</div>
        </div>
        <div className={`text-sm font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}>
          {formatPercentage(token.price_change_percentage_24h)}
        </div>
      </div>
      
      <div className="space-y-2 text-xs text-neutral-400">
        <div className="flex justify-between">
          <span>Market Cap</span>
          <span className="text-white">{formatMarketCap(token.market_cap)}</span>
        </div>
        <div className="flex justify-between">
          <span>24h Volume</span>
          <span className="text-white">{formatMarketCap(token.total_volume)}</span>
        </div>
        <div className="flex justify-between">
          <span>Last Updated</span>
          <span className="text-white">
            {new Date(token.last_updated).toLocaleTimeString()}
          </span>
        </div>
      </div>
      
      {/* Price trend indicator */}
      <div className="mt-3 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-success' : 'bg-danger'}`}></div>
        <span className="text-xs text-neutral-400">
          {isPositive ? '24h gain' : '24h loss'}
        </span>
      </div>
    </div>
  )
}


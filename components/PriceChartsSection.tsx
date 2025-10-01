'use client'

import PriceChart from './PriceChart'

export default function PriceChartsSection() {
  return (
    <div className="space-y-6">
      <div className="card p-4">
        <div className="text-lg font-semibold mb-4">Token Price Charts</div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PriceChart 
            symbol="VET" 
            tokenName="VeChain" 
          />
          <PriceChart 
            symbol="VTHO" 
            tokenName="VeThor" 
          />
        </div>
      </div>
    </div>
  )
}

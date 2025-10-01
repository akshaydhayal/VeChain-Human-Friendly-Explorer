'use client'

import PriceChart from './PriceChart'

export default function PriceChartsSection() {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="text-lg font-semibold mb-6">Token Price Charts</div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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

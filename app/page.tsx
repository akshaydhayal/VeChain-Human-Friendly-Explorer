import { StatCard } from '@/components/StatCard'
import RecentBlocksWebSocket from '@/components/RecentBlocksWebSocket'
import PriceChartsSection from '@/components/PriceChartsSection'
import VeChainNodes from '@/components/VeChainNodes'
import VeChainNetwork from '@/components/VeChainNetwork'
import { fetchLatestBlock } from '@/lib/blockService'
import dynamic from 'next/dynamic'

const TinyChart = dynamic(() => import('@/components/TinyChart'), { ssr: false })

export default async function Page() {
  const latest = await fetchLatestBlock()
  if (!latest) {
    return (
      <div className="card p-6">
        <div className="text-sm text-neutral-400">Network unavailable</div>
        <div className="mt-2">Unable to load latest block. Please check your connection or endpoint.</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-8 space-y-8">
      {/* Recent Blocks Section */}
      <RecentBlocksWebSocket />
      
      {/* VeChain Nodes Section */}
      <VeChainNodes />
      
      {/* VeChain Network Section */}
      <VeChainNetwork />
      
      {/* Price Charts Section */}
      <PriceChartsSection />
      
      {/* Network Stats Grid */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Latest Block" value={`#${latest.number.toLocaleString()}`} />
        <StatCard title="Block Size" value={`${latest.size.toLocaleString()} bytes`} />
        <StatCard title="Gas Used" value={latest.gasUsed.toLocaleString()} />
      </div> */}
      
      {/* Network TPS Chart */}
      {/* <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="text-lg font-semibold">Network TPS</div>
          <span className="chip">Include vote txs</span>
        </div>
        <div className="h-48">
          <TinyChart />
        </div>
      </div> */}
    </div>
  )
}



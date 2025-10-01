import { StatCard } from '@/components/StatCard'
import RecentBlocksWebSocket from '@/components/RecentBlocksWebSocket'
import PriceSection from '@/components/PriceSection'
import PriceChartsSection from '@/components/PriceChartsSection'
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <RecentBlocksWebSocket />
        <PriceSection />
        <PriceChartsSection />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Latest Block" value={`#${latest.number.toLocaleString()}`} />
          <StatCard title="Block Size" value={`${latest.size.toLocaleString()} bytes`} />
          <StatCard title="Gas Used" value={latest.gasUsed.toLocaleString()} />
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">Network TPS (mock last 2h)</div>
            <span className="chip">Include vote txs</span>
          </div>
          <div className="h-40 mt-4">
            <TinyChart />
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="card p-4">
          <div className="font-medium">Client Distribution</div>
          <div className="text-sm text-neutral-400 mt-2">Jito 75% · Firedancer 21% · Agave 4%</div>
          <div className="h-48 mt-3 flex items-center justify-center text-neutral-500">Pie Chart Placeholder</div>
        </div>
        <div className="card p-4">
          <div className="font-medium">Node Versions</div>
          <div className="space-y-2 mt-3">
            <div className="h-2 bg-black/40 rounded">
              <div className="h-2 bg-primary rounded" style={{ width: '19%' }} />
            </div>
            <div className="h-2 bg-black/40 rounded">
              <div className="h-2 bg-neutral-400 rounded" style={{ width: '11%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



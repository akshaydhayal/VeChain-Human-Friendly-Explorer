import { getNetworkStats, getRecentBlocks } from '@/lib/mockService'
import { StatCard } from '@/components/StatCard'
import { BlocksList } from '@/components/BlocksList'
import dynamic from 'next/dynamic'

const TinyChart = dynamic(() => import('@/components/TinyChart'), { ssr: false })

export default async function Page() {
  const [stats, blocks] = await Promise.all([getNetworkStats(), getRecentBlocks()])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <BlocksList blocks={blocks} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Network TPS" value={<span className="text-green-400">{stats.tps.toLocaleString()}</span>} />
          <StatCard title="Validators" value={<span className="text-green-400">{stats.validators.toLocaleString()}</span>} />
          <StatCard title="VET Price" value={`$${stats.priceUsd.toFixed(3)}`} />
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



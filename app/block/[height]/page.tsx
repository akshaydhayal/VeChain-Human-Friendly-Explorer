import { getBlockByHeight, getBlockTxs } from '@/lib/mockService'
import { TransactionsTable } from '@/components/TransactionsTable'

type Params = { params: { height: string } }

export default async function BlockPage({ params }: Params) {
  const height = Number(params.height)
  const [block, txs] = await Promise.all([
    getBlockByHeight(height),
    getBlockTxs(height),
  ])

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-neutral-400">Block</div>
            <div className="text-2xl font-semibold">#{block.height.toLocaleString()}</div>
          </div>
          <div className="flex items-center gap-2">
            <a className="chip" href={`/block/${block.height - 1}`}>Previous</a>
            <a className="chip" href={`/block/${block.height + 1}`}>Next</a>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 text-sm">
          <div className="card p-3">
            <div className="text-neutral-400 text-xs">Leader</div>
            <div>{block.leader}</div>
          </div>
          <div className="card p-3">
            <div className="text-neutral-400 text-xs">Successful Transactions</div>
            <div>{block.successfulTxs} ({((block.successfulTxs / block.txCount) * 100).toFixed(2)}%)</div>
          </div>
          <div className="card p-3">
            <div className="text-neutral-400 text-xs">Failed Transactions</div>
            <div>{block.failedTxs} ({((block.failedTxs / block.txCount) * 100).toFixed(2)}%)</div>
          </div>
          <div className="card p-3">
            <div className="text-neutral-400 text-xs">Created</div>
            <div>{new Date(block.createdAt).toUTCString()}</div>
          </div>
          <div className="card p-3 col-span-2">
            <div className="text-neutral-400 text-xs">Blockhash</div>
            <div className="font-mono text-xs break-all">{block.hash}</div>
          </div>
        </div>
      </div>

      <TransactionsTable txs={txs} />
    </div>
  )
}



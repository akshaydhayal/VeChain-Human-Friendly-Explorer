import { TransactionsTable } from '@/components/TransactionsTable'
import { fetchBlockByIdOrNumber, VeChainBlock, formatTimestamp, formatWeiHexToEthLike } from '@/lib/blockService'

type Params = { params: { height: string } }

export default async function BlockPage({ params }: Params) {
  const height = Number(params.height)
  const block = await fetchBlockByIdOrNumber(height)
  if (!block) {
    return (
      <div className="card p-6">
        <div className="text-sm text-neutral-400">Block not found</div>
        <div className="mt-2">Could not load block #{height}. It may not exist or the endpoint is unavailable.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="muted text-sm">Block</div>
            <div className="heading-block">#{block.number.toLocaleString()}</div>
          </div>
          <div className="flex items-center gap-2">
            <a className="chip" href={`/block/${block.number - 1}`}>Previous</a>
            <a className="chip" href={`/block/${block.number + 1}`}>Next</a>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 text-sm">
          <div className="card p-3">
            <div className="text-neutral-400 text-xs">Beneficiary</div>
            <div>{block.beneficiary}</div>
          </div>
          <div className="card p-3">
            <div className="text-neutral-400 text-xs">Successful Transactions</div>
            <div>{block.transactions.length}</div>
          </div>
          <div className="card p-3">
            <div className="text-neutral-400 text-xs">Gas Used</div>
            <div>{block.gasUsed.toLocaleString()}</div>
          </div>
          <div className="card p-3">
            <div className="text-neutral-400 text-xs">Created</div>
            <div>{formatTimestamp(block.timestamp)}</div>
          </div>
          <div className="card p-3 col-span-2">
            <div className="text-neutral-400 text-xs">Blockhash</div>
            <div className="font-mono text-xs break-all">{block.id}</div>
          </div>
          <div className="card p-3 col-span-2">
            <div className="text-neutral-400 text-xs">Base Fee</div>
            <div>{formatWeiHexToEthLike(block.baseFeePerGas)}</div>
          </div>
        </div>
      </div>
      <TransactionsTable txs={block.transactions.map((t) => ({ signature: t.id, status: t.reverted ? 'Failed' : 'Success', origin: (t as any).origin, gasUsed: t.gasUsed, typeCode: t.type }))} />
    </div>
  )
}



import Link from 'next/link'

export type BlockListItem = {
  number: number
  id: string
  beneficiary?: string
  transactions?: unknown[]
}

export function BlocksList({ blocks }: { blocks: BlockListItem[] }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="font-medium">Recent Blocks</div>
      </div>
      <ul className="divide-y divide-border">
        {blocks.map((b) => (
          <li key={b.id} className="px-4 py-3 hover:bg-black/30 cursor-pointer">
            <Link href={`/block/${b.number}`} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-danger rounded-sm" />
                <div>
                  <div className="text-sm">Block #{b.number.toLocaleString()}</div>
                  <div className="text-xs text-neutral-500">{b.beneficiary || 'Unknown'}</div>
                </div>
              </div>
              <div className="text-xs text-neutral-400">{(b as any).transactions?.length ?? 0} txs</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}



import { fetchTransaction, decodeClauseHuman, decodeFunctionParams } from '@/lib/txService'
import { formatTimestamp } from '@/lib/blockService'

type Params = { params: { id: string } }

export default async function TxPage({ params }: Params) {
  const tx = await fetchTransaction(params.id)
  if (!tx) {
    return (
      <div className="card p-6">
        <div className="text-sm text-neutral-400">Transaction not found</div>
        <div className="mt-2">We could not find this transaction on the selected network.</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="card">
        <div className="tabbar">
          <div className="tab tab-active">Summary</div>
          <div className="tab">Advanced</div>
          <div className="tab">Clauses</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 text-sm">
          <Info label="Signature" value={<span className="font-mono text-xs break-all">{tx.id}</span>} />
          <Info label="Time" value={tx.meta?.blockTimestamp ? formatTimestamp(tx.meta.blockTimestamp) : '—'} />
          <Info label="Gas Used" value={tx.gas.toLocaleString()} />
          <Info label="Origin" value={<span className="font-mono text-xs">{tx.origin}</span>} />
        </div>
      </div>

      {/* Advanced */}
      <div className="card">
        <div className="px-4 py-3 border-b border-border uptitle">Details</div>
        <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-4 text-sm">
          <Info label="Type" value={String(tx.type)} />
          <Info label="Chain Tag" value={`0x${tx.chainTag.toString(16)}`} />
          <Info label="Block" value={tx.meta ? `#${tx.meta.blockNumber.toLocaleString()}` : '—'} />
          <Info label="Delegator" value={tx.delegator || '—'} />
          <Info label="Nonce" value={tx.nonce} />
          <Info label="Size" value={`${tx.size} B`} />
        </div>
      </div>

      {/* Clauses */}
      <div className="card">
        <div className="px-4 py-3 border-b border-border uptitle">Clauses</div>
        <div className="divide-y divide-border">
          {tx.clauses.map((c, i) => {
            const decoded = decodeClauseHuman(c.data)
            const params = c.data ? decodeFunctionParams(c.data, decoded?.method || '') : []
            return (
              <div key={i} className="p-4 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-danger/20 border border-danger/40 flex items-center justify-center">#{i + 1}</div>
                    <div>
                      <div className="font-semibold">{decoded?.summary || 'Clause'}</div>
                      <div className="text-xs text-neutral-400">{decoded?.method || '—'}</div>
                    </div>
                  </div>
                  <div className="text-xs">to <span className="font-mono text-primary hover:underline cursor-pointer">{c.to || '—'}</span></div>
                </div>
                
                {decoded && params.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs text-neutral-400 mb-3 font-semibold">Decoded Parameters:</div>
                    <div className="bg-surface/50 rounded border border-border overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left text-xs text-neutral-400 px-3 py-2">#</th>
                            <th className="text-left text-xs text-neutral-400 px-3 py-2">Name</th>
                            <th className="text-left text-xs text-neutral-400 px-3 py-2">Type</th>
                            <th className="text-left text-xs text-neutral-400 px-3 py-2">Data</th>
                          </tr>
                        </thead>
                        <tbody>
                          {params.map((param, idx) => (
                            <tr key={idx} className="border-b border-border/50 last:border-b-0">
                              <td className="px-3 py-2 text-xs">{idx}</td>
                              <td className="px-3 py-2 text-xs text-neutral-300">{param.name}</td>
                              <td className="px-3 py-2 text-xs text-neutral-300">{param.type}</td>
                              <td className="px-3 py-2 text-xs">
                                <span className="font-mono text-primary hover:underline cursor-pointer">{param.value}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-neutral-400 text-xs">{label}</div>
      <div className="mt-1">{value}</div>
    </div>
  )
}



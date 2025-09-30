type Tx = {
  signature: string
  status: 'Success' | 'Failed'
  origin?: string
  gasUsed?: number
  typeCode?: number
}

export function TransactionsTable({ txs }: { txs: Tx[] }) {
  return (
    <div className="card p-4">
      <div className="font-medium mb-3">Transactions</div>
      <table className="table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Origin</th>
            <th>Gas Used</th>
            <th>Status</th>
            <th>Signature</th>
          </tr>
        </thead>
        <tbody>
          {txs.map((t) => (
            <tr key={t.signature} className="hover:bg-black/20 cursor-pointer">
              <td className="font-semibold text-orange-400">{t.typeCode ?? ''}</td>
              <td className="text-neutral-400 font-mono text-xs">{t.origin ? `${t.origin.slice(0,6)}....${t.origin.slice(-4)}` : '—'}</td>
              <td className="text-neutral-300">{t.gasUsed?.toLocaleString?.() ?? '—'}</td>
              <td>
                <span className={`chip ${t.status === 'Success' ? 'text-success' : 'text-danger'}`}>{t.status}</span>
              </td>
              <td className="font-mono text-xs break-all">
                <a className="text-primary hover:underline cursor-pointer" href={`/tx/${t.signature}`}>{t.signature}</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}



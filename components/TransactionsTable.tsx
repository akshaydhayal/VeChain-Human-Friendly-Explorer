type Tx = {
  signature: string
  type: string
  status: 'Success' | 'Failed'
}

export function TransactionsTable({ txs }: { txs: Tx[] }) {
  return (
    <div className="card p-4">
      <div className="font-medium mb-3">Transactions</div>
      <table className="table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Status</th>
            <th>Signature</th>
          </tr>
        </thead>
        <tbody>
          {txs.map((t) => (
            <tr key={t.signature}>
              <td>{t.type}</td>
              <td>
                <span className={`chip ${t.status === 'Success' ? 'text-success' : 'text-danger'}`}>{t.status}</span>
              </td>
              <td className="font-mono text-xs break-all">{t.signature}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}



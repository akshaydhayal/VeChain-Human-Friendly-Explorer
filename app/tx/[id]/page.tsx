import { fetchTransaction, decodeClauseHuman, decodeFunctionParams } from '@/lib/txService'
import { formatTimestamp } from '@/lib/blockService'
import TxTabs from '@/components/TxTabs'

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
    <TxTabs tx={tx} />
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



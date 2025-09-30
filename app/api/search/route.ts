import { NextRequest, NextResponse } from 'next/server'
import { fetchBlockByIdOrNumber } from '@/lib/blockService'
import { fetchTransaction } from '@/lib/txService'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  if (!q) return NextResponse.json({ type: 'none' })

  // Try block by number or id
  let block = null
  if (/^\d+$/.test(q)) {
    block = await fetchBlockByIdOrNumber(Number(q))
  } else if (q.startsWith('0x')) {
    block = await fetchBlockByIdOrNumber(q)
  }
  if (block) return NextResponse.json({ type: 'block', href: `/block/${block.number}` })

  // Try transaction
  if (q.startsWith('0x')) {
    const tx = await fetchTransaction(q)
    if (tx) return NextResponse.json({ type: 'tx', href: `/tx/${tx.id}` })
  }

  return NextResponse.json({ type: 'none' })
}



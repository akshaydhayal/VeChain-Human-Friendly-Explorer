import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { network } = await request.json()
    
    if (network === 'testnet') {
      process.env.VECHAIN_ENDPOINT = 'https://testnet.vechain.org'
    } else {
      process.env.VECHAIN_ENDPOINT = 'https://mainnet.vechain.org'
    }
    
    return NextResponse.json({ success: true, network })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update network' }, { status: 500 })
  }
}

import { cached } from '@/lib/cache'
import { getThorClient } from '@/lib/thorClient'

export type VeChainTx = {
  id: string
  type: number
  chainTag: number
  blockRef: string
  expiration: number
  clauses: Array<{ to: string | null; value: string; data?: string }>
  gasPriceCoef: number
  gas: number
  origin: string
  delegator?: string | null
  nonce: string
  dependsOn?: string | null
  size: number
  meta?: { blockID: string; blockNumber: number; blockTimestamp: number }
}

export async function fetchTransaction(id: string): Promise<VeChainTx | null> {
  return cached(`ve:tx:${id}`, async () => {
    try {
      const thor = getThorClient()
      const tx = await thor.transactions.getTransaction(id)
      if (!tx) return null
      return tx as unknown as VeChainTx
    } catch {
      return null
    }
  }) as Promise<VeChainTx | null>
}

// Enhanced decoding for VeChain clauses
export function decodeClauseHuman(data?: string): { method: string; summary: string; decoded?: any } | null {
  if (!data || data === '0x' || data.length < 10) return null
  const selector = data.slice(2, 10).toLowerCase()
  
  // Common ERC20/ERC721 methods
  switch (selector) {
    case 'a9059cbb':
      return { method: 'transfer(address,uint256)', summary: 'Token transfer' }
    case '095ea7b3':
      return { method: 'approve(address,uint256)', summary: 'Approve spending' }
    case '23b872dd':
      return { method: 'transferFrom(address,address,uint256)', summary: 'Transfer from' }
    case '40c10f19':
      return { method: 'mint(address,uint256)', summary: 'Mint tokens' }
    case '27557354':
      return { method: 'executeWithAuthorization(address,uint256,bytes,uint256,uint256,bytes)', summary: 'Execute with authorization' }
    case '74420f4c':
      return { method: 'approve(address,uint256)', summary: 'Approve token spending' }
    case 'e23285a0':
      return { method: 'transfer(address,uint256)', summary: 'Transfer tokens' }
    default:
      return { method: `method 0x${selector}`, summary: 'Contract call' }
  }
}

// Decode function parameters with proper ABI parsing
export function decodeFunctionParams(data: string, method: string): { name: string; type: string; value: string }[] {
  if (!data || data === '0x' || data.length < 10) return []
  
  try {
    // Remove function selector (first 4 bytes)
    const paramsHex = data.slice(10)
    
    // For executeWithAuthorization: (address,uint256,bytes,uint256,uint256,bytes)
    if (method.includes('executeWithAuthorization')) {
      const params = []
      let offset = 0
      
      // param 0: address (32 bytes)
      if (offset + 64 <= paramsHex.length) {
        const addrHex = paramsHex.slice(offset, offset + 64)
        const addr = '0x' + addrHex.slice(24) // last 20 bytes for address
        params.push({ name: 'to', type: 'address', value: addr })
        offset += 64
      }
      
      // param 1: uint256 (32 bytes)
      if (offset + 64 <= paramsHex.length) {
        const valueHex = paramsHex.slice(offset, offset + 64)
        const value = BigInt('0x' + valueHex).toString()
        params.push({ name: 'value', type: 'uint256', value })
        offset += 64
      }
      
      // param 2: bytes (dynamic, need to read offset)
      if (offset + 64 <= paramsHex.length) {
        const dataOffsetHex = paramsHex.slice(offset, offset + 64)
        const dataOffset = parseInt(dataOffsetHex, 16) * 2 // convert to hex string offset
        const dataLengthHex = paramsHex.slice(dataOffset, dataOffset + 64)
        const dataLength = parseInt(dataLengthHex, 16) * 2
        const dataValue = '0x' + paramsHex.slice(dataOffset + 64, dataOffset + 64 + dataLength)
        params.push({ name: 'data', type: 'bytes', value: dataValue })
        offset += 64
      }
      
      // param 3: uint256 (32 bytes)
      if (offset + 64 <= paramsHex.length) {
        const validAfterHex = paramsHex.slice(offset, offset + 64)
        const validAfter = BigInt('0x' + validAfterHex).toString()
        params.push({ name: 'validAfter', type: 'uint256', value: validAfter })
        offset += 64
      }
      
      // param 4: uint256 (32 bytes)
      if (offset + 64 <= paramsHex.length) {
        const validBeforeHex = paramsHex.slice(offset, offset + 64)
        const validBefore = BigInt('0x' + validBeforeHex).toString()
        params.push({ name: 'validBefore', type: 'uint256', value: validBefore })
        offset += 64
      }
      
      // param 5: bytes (dynamic, need to read offset)
      if (offset + 64 <= paramsHex.length) {
        const sigOffsetHex = paramsHex.slice(offset, offset + 64)
        const sigOffset = parseInt(sigOffsetHex, 16) * 2
        const sigLengthHex = paramsHex.slice(sigOffset, sigOffset + 64)
        const sigLength = parseInt(sigLengthHex, 16) * 2
        const sigValue = '0x' + paramsHex.slice(sigOffset + 64, sigOffset + 64 + sigLength)
        params.push({ name: 'signature', type: 'bytes', value: sigValue })
      }
      
      return params
    }
    
    // Fallback for other functions - just return basic params
    const params = []
    for (let i = 0; i < paramsHex.length; i += 64) {
      const paramHex = paramsHex.slice(i, i + 64)
      if (paramHex.length === 64) {
        const value = BigInt('0x' + paramHex)
        params.push({ name: `param${params.length}`, type: 'uint256', value: value.toString() })
      }
    }
    
    return params
  } catch {
    return []
  }
}



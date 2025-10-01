import { getThorClient } from './thorClient'
import { ABIContract } from '@vechain/sdk-core'
import { erc20Abi } from './erc20Abi'
import { TokenInfo, formatTokenBalance } from './tokenService'

export type AccountBalance = {
  symbol: string
  name: string
  balance: string
  decimals: number
  contract: string | null
  type: string
}

export type AccountData = {
  address: string
  vetBalance: string
  vthoBalance: string
  tokenBalances: AccountBalance[]
  nftData?: any // Will be added by the page component
}

export async function fetchAccountBalances(address: string, tokens: TokenInfo[]): Promise<AccountData | null> {
  try {
    const thor = getThorClient()
    
    // Get VET balance (native token)
    const vetBalance = await thor.accounts.getAccount(address as any)
    const vetBalanceFormatted = formatTokenBalance(BigInt(vetBalance.balance || '0'), 18)
    
    // Get VTHO balance
    const vthoBalance = await thor.accounts.getAccount(address as any)
    const vthoBalanceFormatted = formatTokenBalance(BigInt(vthoBalance.energy || '0'), 18)
    
    // Get balances for all ERC20 tokens
    const tokenBalances: AccountBalance[] = []
    
    for (const token of tokens) {
      if (token.contract && token.type === 'vip180') {
        try {
          const abi = new ABIContract(erc20Abi as any)
          const result = await thor.contracts.executeCall(
            token.contract as any,
            abi.getFunction('balanceOf'),
            [address as any]
          )
          
          if (result && result.result) {
            const balance = BigInt(String(result.result.plain || '0'))
            const formattedBalance = formatTokenBalance(balance, token.decimals)
            
            // Only include tokens with non-zero balance
            if (balance > 0n) {
              tokenBalances.push({
                symbol: token.name.split(' ')[0].toUpperCase(), // Use first word as symbol
                name: token.name,
                balance: formattedBalance,
                decimals: token.decimals,
                contract: token.contract,
                type: token.type
              })
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch balance for token ${token.name}:`, error)
          // Continue with other tokens
        }
      }
    }
    
    return {
      address,
      vetBalance: vetBalanceFormatted,
      vthoBalance: vthoBalanceFormatted,
      tokenBalances
    }
  } catch (error) {
    console.error('Error fetching account balances:', error)
    return null
  }
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatFullAddress(address: string): string {
  return address
}

export function isValidAddress(address: string): boolean {
  return address.length === 42 && address.startsWith('0x')
}

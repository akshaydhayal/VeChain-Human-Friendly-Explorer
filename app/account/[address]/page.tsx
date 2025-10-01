import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { fetchTokenList } from '@/lib/tokenService'
import { fetchAccountBalances, isValidAddress } from '@/lib/accountService'
import { fetchNFTList } from '@/lib/nftService'
import { fetchUserNFTs } from '@/lib/accountNftService'
import AccountDetails from '@/components/AccountDetails'

interface AccountPageProps {
  params: {
    address: string
  }
}

export default async function AccountPage({ params }: AccountPageProps) {
  const { address } = params
  
  // Validate address format
  if (!isValidAddress(address)) {
    notFound()
  }
  
  // Fetch token list, NFT list, and account data in parallel
  const [tokenList, nftList, accountData] = await Promise.all([
    fetchTokenList(),
    fetchNFTList(),
    fetchAccountBalances(address, []) // We'll pass tokens after fetching them
  ])
  
  if (!tokenList) {
    throw new Error('Failed to fetch token list')
  }
  
  if (!nftList) {
    throw new Error('Failed to fetch NFT list')
  }
  
  // Fetch account balances and NFTs with their respective lists
  const [accountBalances, nftData] = await Promise.all([
    fetchAccountBalances(address, tokenList),
    fetchUserNFTs(address, nftList)
  ])
  
  if (!accountBalances) {
    notFound()
  }
  
  // Add NFT data to account data
  accountBalances.nftData = nftData
  
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto px-8 py-8">
        <Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        }>
          <AccountDetails accountData={accountBalances} />
        </Suspense>
      </div>
    </div>
  )
}


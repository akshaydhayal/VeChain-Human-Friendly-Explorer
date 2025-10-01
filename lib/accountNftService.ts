import { getThorClient } from './thorClient'
import { ABIContract } from '@vechain/sdk-core'
import { erc721Abi } from './erc721Abi'
import { NFTCollection } from './nftService'

export type UserNFT = {
  tokenId: string
  collectionName: string
  collectionId: string
  contract: string
  tokenURI?: string
  metadata?: any
}

export type UserNFTData = {
  address: string
  nfts: UserNFT[]
  totalNFTs: number
}

export async function fetchUserNFTs(address: string, nftCollections: NFTCollection[]): Promise<UserNFTData | null> {
  try {
    const thor = getThorClient()
    const userNFTs: UserNFT[] = []
    
    // Check each NFT collection
    for (const collection of nftCollections) {
      try {
        const abi = new ABIContract(erc721Abi as any)
        
        // Get user's balance for this collection
        const balanceResult = await thor.contracts.executeCall(
          collection.contract as any,
          abi.getFunction('balanceOf'),
          [address as any]
        )
        
        if (balanceResult && balanceResult.result) {
          const balance = parseInt(String(balanceResult.result.plain || '0'))
          
          if (balance > 0) {
            // Get token IDs owned by user
            for (let i = 0; i < balance; i++) {
              try {
                const tokenIdResult = await thor.contracts.executeCall(
                  collection.contract as any,
                  abi.getFunction('tokenOfOwnerByIndex'),
                  [address as any, i as any]
                )
                
                if (tokenIdResult && tokenIdResult.result) {
                  const tokenId = String(tokenIdResult.result.plain || '0')
                  
                  // Try to get token URI
                  let tokenURI: string | undefined
                  try {
                    const uriResult = await thor.contracts.executeCall(
                      collection.contract as any,
                      abi.getFunction('tokenURI'),
                      [tokenId as any]
                    )
                    
                    if (uriResult && uriResult.result) {
                      tokenURI = String(uriResult.result.plain || '')
                    }
                  } catch (error) {
                    console.warn(`Failed to get token URI for ${collection.name} #${tokenId}:`, error)
                  }
                  
                  userNFTs.push({
                    tokenId,
                    collectionName: collection.name,
                    collectionId: collection.id,
                    contract: collection.contract,
                    tokenURI
                  })
                }
              } catch (error) {
                console.warn(`Failed to get token ID ${i} for ${collection.name}:`, error)
                // Continue with other tokens
              }
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to check balance for ${collection.name}:`, error)
        // Continue with other collections
      }
    }
    
    return {
      address,
      nfts: userNFTs,
      totalNFTs: userNFTs.length
    }
  } catch (error) {
    console.error('Error fetching user NFTs:', error)
    return null
  }
}

export function formatTokenId(tokenId: string): string {
  return `#${tokenId}`
}

export function formatContractAddress(contract: string): string {
  return `${contract.slice(0, 6)}...${contract.slice(-4)}`
}

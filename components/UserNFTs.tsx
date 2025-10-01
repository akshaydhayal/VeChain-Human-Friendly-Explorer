'use client'

import { useState } from 'react'
import { UserNFTData } from '@/lib/accountNftService'
import CopyButton from './CopyButton'
import NFTCard from './NFTCard'
import CollectionFilter from './CollectionFilter'

interface UserNFTsProps {
  nftData: UserNFTData
}

export default function UserNFTs({ nftData }: UserNFTsProps) {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [imageStatusMap, setImageStatusMap] = useState<Record<string, boolean>>({})

  if (nftData.totalNFTs === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">NFTs</h3>
        <div className="flex items-center justify-center h-32">
          <p className="text-gray-400">No NFTs found</p>
        </div>
      </div>
    )
  }

  // Handle image status changes
  const handleImageStatusChange = (tokenId: string, hasRealImage: boolean) => {
    setImageStatusMap(prev => ({
      ...prev,
      [tokenId]: hasRealImage
    }))
  }

  // Filter NFTs by selected collection
  const filteredNFTs = selectedCollection 
    ? nftData.nfts.filter(nft => nft.collectionId === selectedCollection)
    : nftData.nfts

  // Sort NFTs: those with real images first, then those without
  const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    const aHasImage = imageStatusMap[a.tokenId] || false
    const bHasImage = imageStatusMap[b.tokenId] || false
    
    // If both have images or both don't have images, maintain original order
    if (aHasImage === bHasImage) return 0
    
    // NFTs with images come first
    return bHasImage ? -1 : 1
  })

  return (
    <div className="space-y-6">
      {/* Collection Filter */}
      <CollectionFilter
        nfts={nftData.nfts}
        selectedCollection={selectedCollection}
        onCollectionSelect={setSelectedCollection}
      />
      
      {/* NFT Grid */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            {selectedCollection ? 'Collection NFTs' : 'All NFTs'}
          </h3>
          <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            {filteredNFTs.length} NFT{filteredNFTs.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {sortedNFTs.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-400">No NFTs in this collection</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedNFTs.map((nft, index) => (
              <NFTCard 
                key={index} 
                nft={nft} 
                onImageStatusChange={handleImageStatusChange}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm">Total NFTs</div>
          <div className="text-white font-semibold text-lg">
            {nftData.totalNFTs}
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm">Collections</div>
          <div className="text-white font-semibold text-lg">
            {new Set(nftData.nfts.map(nft => nft.collectionId)).size}
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-gray-400 text-sm">Largest Collection</div>
          <div className="text-white font-semibold text-lg">
            {(() => {
              const collectionCounts = nftData.nfts.reduce((acc, nft) => {
                acc[nft.collectionId] = (acc[nft.collectionId] || 0) + 1
                return acc
              }, {} as Record<string, number>)
              
              const maxCollection = Object.entries(collectionCounts)
                .sort(([,a], [,b]) => b - a)[0]
              
              return maxCollection ? `${maxCollection[1]} NFTs` : 'N/A'
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}

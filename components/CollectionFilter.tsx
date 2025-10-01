'use client'

import { useState } from 'react'
import { UserNFT } from '@/lib/accountNftService'

interface CollectionFilterProps {
  nfts: UserNFT[]
  selectedCollection: string | null
  onCollectionSelect: (collectionId: string | null) => void
}

export default function CollectionFilter({ nfts, selectedCollection, onCollectionSelect }: CollectionFilterProps) {
  // Group NFTs by collection
  const collections = nfts.reduce((acc, nft) => {
    if (!acc[nft.collectionId]) {
      acc[nft.collectionId] = {
        id: nft.collectionId,
        name: nft.collectionName,
        count: 0,
        nfts: []
      }
    }
    acc[nft.collectionId].count++
    acc[nft.collectionId].nfts.push(nft)
    return acc
  }, {} as Record<string, { id: string; name: string; count: number; nfts: UserNFT[] }>)

  const collectionList = Object.values(collections).sort((a, b) => b.count - a.count)
  const [showMore, setShowMore] = useState(false)
  const visibleCollections = showMore ? collectionList : collectionList.slice(0, 5)

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">NFT Collections</h3>
        <div className="text-gray-400 text-sm">
          {nfts.length} NFT{nfts.length !== 1 ? 's' : ''} across {collectionList.length} collection{collectionList.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Collection Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => onCollectionSelect(null)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedCollection === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All ({nfts.length})
        </button>
        
        {visibleCollections.map((collection) => (
          <button
            key={collection.id}
            onClick={() => onCollectionSelect(collection.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCollection === collection.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {collection.name} ({collection.count})
          </button>
        ))}
        
        {collectionList.length > 5 && (
          <button
            onClick={() => setShowMore(!showMore)}
            className="px-4 py-2 rounded-lg font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
          >
            {showMore ? 'Show Less' : `+${collectionList.length - 5} More`}
          </button>
        )}
      </div>

      {/* Selected Collection Info */}
      {selectedCollection && (
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-semibold">
                {collections[selectedCollection]?.name}
              </h4>
              <p className="text-gray-400 text-sm">
                {collections[selectedCollection]?.count} NFT{collections[selectedCollection]?.count !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => onCollectionSelect(null)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

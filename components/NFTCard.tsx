'use client'

import { useState, useEffect } from 'react'
import { UserNFT } from '@/lib/accountNftService'
import { fetchNFTMetadata, getNFTImageUrl, getCollectionIcon } from '@/lib/nftMetadataService'
import CopyButton from './CopyButton'

interface NFTCardProps {
  nft: UserNFT
  onImageStatusChange?: (tokenId: string, hasRealImage: boolean) => void
}

export default function NFTCard({ nft, onImageStatusChange }: NFTCardProps) {
  const [metadata, setMetadata] = useState<any>(null)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [hasRealImage, setHasRealImage] = useState<boolean>(false)

  useEffect(() => {
    const loadMetadata = async () => {
      console.log('Loading NFT metadata for:', nft.collectionName, 'Token ID:', nft.tokenId, 'URI:', nft.tokenURI)
      
      if (nft.tokenURI) {
        try {
          const meta = await fetchNFTMetadata(nft.tokenURI)
          console.log('Fetched metadata:', meta)
          setMetadata(meta)
          const imageUrl = getNFTImageUrl(meta, getCollectionIcon(nft.collectionName))
          console.log('Generated image URL:', imageUrl)
          setImageUrl(imageUrl)
          
          // Check if we have a real image (not a data URL fallback)
          const hasRealImage = Boolean(meta?.image && !imageUrl.startsWith('data:image/svg+xml'))
          setHasRealImage(hasRealImage)
          console.log('Has real image:', hasRealImage)
          onImageStatusChange?.(nft.tokenId, hasRealImage)
        } catch (error) {
          console.warn('Failed to load NFT metadata:', error)
          const fallbackUrl = getNFTImageUrl(null, getCollectionIcon(nft.collectionName))
          console.log('Using fallback image URL:', fallbackUrl)
          setImageUrl(fallbackUrl)
          setHasRealImage(false)
          onImageStatusChange?.(nft.tokenId, false)
        }
      } else {
        const fallbackUrl = getNFTImageUrl(null, getCollectionIcon(nft.collectionName))
        console.log('No token URI, using fallback:', fallbackUrl)
        setImageUrl(fallbackUrl)
        setHasRealImage(false)
        onImageStatusChange?.(nft.tokenId, false)
      }
      setLoading(false)
    }

    loadMetadata()
  }, [nft.tokenURI, nft.collectionName])

  return (
    <div className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
      {/* NFT Image */}
      <div className="w-full h-48 rounded-lg mb-4 relative overflow-hidden">
        {loading ? (
          <div className="w-full h-full bg-gray-600 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading...</div>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={`${nft.collectionName} #${nft.tokenId}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.log('Image failed to load:', imageUrl)
              // Fallback to gradient if image fails to load
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const fallback = target.nextElementSibling as HTMLElement
              if (fallback) fallback.style.display = 'flex'
            }}
            onLoad={(e) => {
              console.log('Image loaded successfully:', imageUrl)
              // Hide fallback when image loads successfully
              const target = e.target as HTMLImageElement
              const fallback = target.nextElementSibling as HTMLElement
              if (fallback) fallback.style.display = 'none'
            }}
          />
        )}
        
        {/* Fallback gradient */}
        <div className="fallback-gradient w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center absolute inset-0" style={{ display: loading ? 'none' : 'flex' }}>
          <div className="text-white text-4xl font-bold">
            {getCollectionIcon(nft.collectionName)}
          </div>
        </div>
        
        {/* Collection Badge */}
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
          {nft.collectionId}
        </div>
      </div>
      
      {/* NFT Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-white font-semibold text-lg truncate">
            {metadata?.name || nft.collectionName}
          </h4>
          <span className="text-blue-400 font-mono text-sm bg-gray-800 px-2 py-1 rounded">
            #{nft.tokenId}
          </span>
        </div>
        
        {metadata?.description && (
          <p className="text-gray-300 text-sm line-clamp-2">
            {metadata.description}
          </p>
        )}
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Collection ID:</span>
            <span className="text-gray-300 font-mono">{nft.collectionId}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Contract:</span>
            <div className="flex items-center space-x-2">
              <span className="text-gray-300 font-mono text-xs">
                {nft.contract.slice(0, 6)}...{nft.contract.slice(-4)}
              </span>
              <CopyButton text={nft.contract} />
            </div>
          </div>
          
          {nft.tokenURI && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Token URI:</span>
              <div className="flex items-center space-x-2">
                <span className="text-gray-300 text-xs truncate max-w-24">
                  {nft.tokenURI.length > 20 ? `${nft.tokenURI.slice(0, 20)}...` : nft.tokenURI}
                </span>
                <CopyButton text={nft.tokenURI} />
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  )
}

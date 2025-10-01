export interface NFTMetadata {
  name?: string
  description?: string
  image?: string
  attributes?: Array<{
    trait_type: string
    value: string | number
  }>
}

export async function fetchNFTMetadata(tokenURI: string): Promise<NFTMetadata | null> {
  try {
    if (!tokenURI || tokenURI === '') {
      return null
    }

    // Handle IPFS URLs
    let url = tokenURI
    if (tokenURI.startsWith('ipfs://')) {
      url = `https://ipfs.io/ipfs/${tokenURI.slice(7)}`
    } else if (tokenURI.startsWith('https://ipfs.io/ipfs/')) {
      url = tokenURI
    } else if (tokenURI.startsWith('Qm') || tokenURI.startsWith('bafy')) {
      // Direct IPFS hash
      url = `https://ipfs.io/ipfs/${tokenURI}`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      return null
    }

    const metadata = await response.json()
    return metadata as NFTMetadata
  } catch (error) {
    console.warn('Failed to fetch NFT metadata:', error)
    return null
  }
}

export function getNFTImageUrl(metadata: NFTMetadata | null, fallbackChar: string): string {
  if (metadata?.image) {
    console.log('Processing image URL:', metadata.image)
    
    // Handle IPFS images
    if (metadata.image.startsWith('ipfs://')) {
      const ipfsUrl = `https://ipfs.io/ipfs/${metadata.image.slice(7)}`
      console.log('Converted IPFS URL:', ipfsUrl)
      return ipfsUrl
    } else if (metadata.image.startsWith('Qm') || metadata.image.startsWith('bafy')) {
      // Direct IPFS hash
      const ipfsUrl = `https://ipfs.io/ipfs/${metadata.image}`
      console.log('Direct IPFS hash URL:', ipfsUrl)
      return ipfsUrl
    } else if (metadata.image.startsWith('http')) {
      // Regular HTTP URL
      console.log('HTTP URL:', metadata.image)
      return metadata.image
    } else {
      // Try to treat as IPFS hash if it doesn't start with http
      const ipfsUrl = `https://ipfs.io/ipfs/${metadata.image}`
      console.log('Treating as IPFS hash:', ipfsUrl)
      return ipfsUrl
    }
  }
  
  console.log('No image found, using fallback for:', fallbackChar)
  // Return a gradient based on the first character
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#grad)"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
            text-anchor="middle" dominant-baseline="middle" fill="white">${fallbackChar}</text>
    </svg>
  `)}`
}

export function getCollectionIcon(collectionName: string): string {
  const firstChar = collectionName.charAt(0).toUpperCase()
  return firstChar
}

'use client'

import { useState, useEffect } from 'react'

export default function NetworkSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState('mainnet')
  const [mounted, setMounted] = useState(false)
  const [isChanging, setIsChanging] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('vechain-network')
    if (saved) {
      setSelectedNetwork(saved)
    }
  }, [])

  const networks = [
    { id: 'mainnet', name: 'Mainnet', endpoint: 'https://mainnet.vechain.org' },
    { id: 'testnet', name: 'Testnet', endpoint: 'https://testnet.vechain.org' }
  ]

  const handleNetworkChange = async (network: typeof networks[0]) => {
    if (network.id === selectedNetwork) return // Don't change if same network
    
    setIsChanging(true)
    setSelectedNetwork(network.id)
    setIsOpen(false)
    
    // Store in localStorage for persistence
    localStorage.setItem('vechain-network', network.id)
    
    try {
      // Update environment variable for server-side rendering
      const response = await fetch('/api/network', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ network: network.id })
      })
      
      if (response.ok) {
        // Redirect to home page and reload to apply new endpoint
        window.location.href = '/'
      } else {
        setIsChanging(false)
        console.error('Failed to update network')
      }
    } catch (error) {
      setIsChanging(false)
      console.error('Error changing network:', error)
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded text-sm">
        <span className="text-xs">🌙</span>
        <span className="capitalize">mainnet</span>
        <span className="text-xs">▼</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded text-sm hover:bg-black/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isChanging ? (
          <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <span className="text-xs">🌙</span>
        )}
        <span className="capitalize">{selectedNetwork}</span>
        {!isChanging && <span className="text-xs">▼</span>}
      </button>
      
      {isOpen && !isChanging && (
        <div className="absolute top-full right-0 mt-1 bg-surface border border-border rounded shadow-lg z-50 min-w-[120px]">
          {networks.map((network) => (
            <button
              key={network.id}
              onClick={() => handleNetworkChange(network)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-black/40 transition-colors ${
                selectedNetwork === network.id ? 'text-primary' : 'text-neutral-300'
              }`}
            >
              {network.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

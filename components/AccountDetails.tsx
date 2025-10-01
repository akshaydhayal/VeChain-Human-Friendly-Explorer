'use client'

import { useState } from 'react'
import { AccountData } from '@/lib/accountService'
import CopyButton from './CopyButton'
import TokenPieChart from './TokenPieChart'
import NFTPieChart from './NFTPieChart'
import UserNFTs from './UserNFTs'

interface AccountDetailsProps {
  accountData: AccountData
}

export default function AccountDetails({ accountData }: AccountDetailsProps) {
  const [activeTab, setActiveTab] = useState<'tokens' | 'nfts'>('tokens')

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Account</h1>
        <p className="text-gray-400 text-lg">{accountData.address}</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8">
        {[
          { id: 'tokens', label: 'Tokens' },
          { id: 'nfts', label: 'NFTs' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                : 'text-blue-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'tokens' && (
        <div className="space-y-8">
          {/* Address Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Address</h3>
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 rounded-lg">
                    <span className="text-white font-mono text-sm">{accountData.address}</span>
                  </div>
                  <CopyButton text={accountData.address} />
                  <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                    <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Native Token Balances */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Native Tokens</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* VET Balance */}
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div>
                  <div className="text-white font-semibold">VET</div>
                  <div className="text-blue-400 text-lg font-bold">{accountData.vetBalance} VET</div>
                  <div className="text-gray-400 text-sm">≈ 0 BTC</div>
                </div>
              </div>
              
              {/* VTHO Balance */}
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div>
                  <div className="text-white font-semibold">VTHO</div>
                  <div className="text-blue-400 text-lg font-bold">{accountData.vthoBalance} VTHO</div>
                  <div className="text-gray-400 text-sm">≈ 0.0000 BTC</div>
                </div>
              </div>
            </div>
          </div>

          {/* Token Balances */}
          {accountData.tokenBalances.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Tokens</h3>
              <div className="space-y-3">
                {accountData.tokenBalances.map((token, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {token.symbol.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-semibold">{token.symbol}</div>
                        <div className="text-gray-400 text-sm">{token.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-blue-400 font-bold">
                        {parseFloat(token.balance).toLocaleString()} {token.symbol}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Token Distribution Chart */}
          <TokenPieChart 
            tokenBalances={accountData.tokenBalances}
            vetBalance={accountData.vetBalance}
            vthoBalance={accountData.vthoBalance}
          />
        </div>
      )}

      {activeTab === 'nfts' && accountData.nftData && (
        <div className="space-y-6">
          {/* NFT Distribution Chart */}
          <NFTPieChart nftData={accountData.nftData} />
          
          {/* NFT List */}
          <UserNFTs nftData={accountData.nftData} />
        </div>
      )}
    </div>
  )
}


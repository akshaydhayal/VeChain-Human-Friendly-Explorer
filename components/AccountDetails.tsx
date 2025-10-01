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
          {/* Account Overview */}
          <div className="bg-gray-800 rounded-lg p-4 px-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Account Overview</h3>
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 rounded-lg">
                    <span className="text-white font-mono text-sm">{accountData.address}</span>
                  </div>
                  <CopyButton text={accountData.address} />
                </div>
              </div>
              
              {/* Account Stats */}
              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {accountData.tokenBalances.length + 2}
                  </div>
                  <div className="text-gray-400 text-sm">Tokens</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {accountData.nftData?.totalNFTs || 0}
                  </div>
                  <div className="text-gray-400 text-sm">NFTs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {accountData.nftData?.totalCollections || 0}
                  </div>
                  <div className="text-gray-400 text-sm">Collections</div>
                </div>
              </div>
            </div>
          </div>

          {/* Native Token Balances */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
              <h3 className="text-lg font-semibold text-white">Native Tokens</h3>
            </div>
            <div className="divide-y divide-gray-700">
              {/* VET Balance */}
              <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-750 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">V</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div>
                      <div className="text-white font-semibold">VET</div>
                      <div className="text-gray-400 text-sm">VeChain</div>
                    </div>
                    <CopyButton text="VET" />
                  </div>
                </div>
                <div className="text-white font-semibold">{accountData.vetBalance} VET</div>
              </div>
              
              {/* VTHO Balance */}
              <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-750 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">T</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div>
                      <div className="text-white font-semibold">VTHO</div>
                      <div className="text-gray-400 text-sm">VeThor</div>
                    </div>
                    <CopyButton text="VTHO" />
                  </div>
                </div>
                <div className="text-white font-semibold">{accountData.vthoBalance} VTHO</div>
              </div>
            </div>
          </div>

          {/* Token Balances */}
          {accountData.tokenBalances.length > 0 && (
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Tokens</h3>
                  <div className="text-gray-400 text-sm uppercase tracking-wider">
                    {accountData.tokenBalances.length} Token{accountData.tokenBalances.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-700">
                {accountData.tokenBalances.map((token, index) => (
                  <div key={index} className="flex items-center justify-between px-4 py-3 hover:bg-gray-750 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {token.symbol.charAt(0)}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div>
                          <div className="text-white font-semibold">{token.symbol}</div>
                          <div className="text-gray-400 text-sm">{token.name}</div>
                        </div>
                        <CopyButton text={token.symbol} />
                      </div>
                    </div>
                    <div className="text-white font-semibold">
                      {parseFloat(token.balance).toLocaleString()} {token.symbol}
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
          {/* Account Overview */}
          <div className="bg-gray-800 rounded-lg p-4 px-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Account Overview</h3>
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 rounded-lg">
                    <span className="text-white font-mono text-sm">{accountData.address}</span>
                  </div>
                  <CopyButton text={accountData.address} />
                </div>
              </div>
              
              {/* Account Stats */}
              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {accountData.tokenBalances.length + 2}
                  </div>
                  <div className="text-gray-400 text-sm">Tokens</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {accountData.nftData?.totalNFTs || 0}
                  </div>
                  <div className="text-gray-400 text-sm">NFTs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {accountData.nftData?.totalCollections || 0}
                  </div>
                  <div className="text-gray-400 text-sm">Collections</div>
                </div>
              </div>
            </div>
          </div>

          {/* NFT Distribution Chart */}
          <NFTPieChart nftData={accountData.nftData} />
          
          {/* NFT List */}
          <UserNFTs nftData={accountData.nftData} />
        </div>
      )}
    </div>
  )
}


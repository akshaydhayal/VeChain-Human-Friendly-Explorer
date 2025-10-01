'use client'

import { useState } from 'react'
import { formatTimestamp } from '@/lib/blockService'
import { decodeClauseHuman, decodeFunctionParams } from '@/lib/txService'
import CopyButton from '@/components/CopyButton'
import AIExplanation from '@/components/AIExplanation'

type TxTabsProps = {
  tx: {
    id: string
    type: number
    chainTag: number
    blockRef: string
    expiration: number
    gas: number
    gasPriceCoef: number
    origin: string
    delegator?: string | null
    nonce: string
    dependsOn?: string | null
    size: number
    meta?: { blockNumber: number; blockTimestamp: number }
    clauses: Array<{ to: string | null; value: string; data?: string }>
  }
}

export default function TxTabs({ tx }: TxTabsProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'clauses' | 'ai'>('details')

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'details'
              ? 'text-white border-primary bg-primary/10'
              : 'text-neutral-400 border-transparent hover:text-white'
          }`}
        >
          <span>✓</span>
          Details
        </button>
        <button
          onClick={() => setActiveTab('clauses')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'clauses'
              ? 'text-white border-primary bg-primary/10'
              : 'text-neutral-400 border-transparent hover:text-white'
          }`}
        >
          <span>{}</span>
          Clauses
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'ai'
              ? 'text-white border-primary bg-primary/10'
              : 'text-neutral-400 border-transparent hover:text-white'
          }`}
        >
          <span>🤖</span>
          AI Analysis
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="card">
          <div className="px-4 py-3 border-b border-border uptitle">Transaction Details</div>
          <div className="p-6 space-y-6">
            {/* Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-xs text-neutral-400 mb-1">Signature</div>
              <div className="flex items-center justify-center gap-2">
                <div className="font-mono text-sm break-all">{tx.id.slice(0, 6)}....{tx.id.slice(-4)}</div>
                <CopyButton text={tx.id} />
              </div>
            </div>
              <div className="text-center">
                <div className="text-xs text-neutral-400 mb-1">Time</div>
                <div className="text-sm">{tx.meta?.blockTimestamp ? formatTimestamp(tx.meta.blockTimestamp) : '—'}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-neutral-400 mb-1">Programs</div>
                <div className="w-8 h-8 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">VP</div>
              </div>
            </div>

            {/* All Transaction Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <Info label="Type" value={String(tx.type)} />
              <Info label="Chain Tag" value={`0x${tx.chainTag.toString(16)}`} />
              <Info label="Block" value={tx.meta ? `#${tx.meta.blockNumber.toLocaleString()}` : '—'} />
              <Info label="Gas Used" value={tx.gas.toLocaleString()} />
              <Info label="Gas Price Coef" value={String(tx.gasPriceCoef)} />
              <Info label="Expiration" value={`${tx.expiration} blocks`} />
              <Info label="Origin" value={
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">{tx.origin}</span>
                  <CopyButton text={tx.origin} />
                </div>
              } />
              <Info label="Delegator" value={tx.delegator ? (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">{tx.delegator}</span>
                  <CopyButton text={tx.delegator} />
                </div>
              ) : '—'} />
              <Info label="Nonce" value={
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">{tx.nonce}</span>
                  <CopyButton text={tx.nonce} />
                </div>
              } />
              <Info label="Depends On" value={tx.dependsOn || '—'} />
              <Info label="Size" value={`${tx.size} B`} />
              <Info label="Block Ref" value={<span className="font-mono text-xs">{tx.blockRef}</span>} />
            </div>

            {/* Clauses Summary */}
            <div>
              <div className="text-sm font-semibold mb-3">Clauses ({tx.clauses.length})</div>
              <div className="space-y-2">
                {tx.clauses.map((clause, i) => {
                  const decoded = decodeClauseHuman(clause.data)
                  return (
                    <div key={i} className="flex items-center justify-between p-3 bg-surface/50 rounded border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-danger/20 border border-danger/40 flex items-center justify-center text-xs">#{i + 1}</div>
                        <div>
                          <div className="text-sm font-medium">{decoded?.summary || 'Contract Call'}</div>
                          <div className="text-xs text-neutral-400">{decoded?.method || 'Unknown method'}</div>
                        </div>
                      </div>
                      <div className="text-xs text-neutral-400">to {clause.to?.slice(0, 6)}...{clause.to?.slice(-4)}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'clauses' && (
        <div className="card">
          <div className="px-4 py-3 border-b border-border uptitle">Clauses</div>
          <div className="divide-y divide-border">
            {tx.clauses.map((c, i) => {
              const decoded = decodeClauseHuman(c.data)
              const params = c.data ? decodeFunctionParams(c.data, decoded?.method || '') : []
              return (
                <div key={i} className="p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-danger/20 border border-danger/40 flex items-center justify-center">#{i + 1}</div>
                      <div>
                        <div className="font-semibold">{decoded?.summary || 'Clause'}</div>
                        <div className="text-xs text-neutral-400">{decoded?.method || '—'}</div>
                      </div>
                    </div>
                    <div className="text-xs">to <span className="font-mono text-primary">{c.to || '—'}</span></div>
                  </div>
                  
                  {decoded && params.length > 0 && (
                    <div className="mt-4">
                      <div className="text-xs text-neutral-400 mb-3 font-semibold">Decoded Parameters:</div>
                      <div className="bg-surface/50 rounded border border-border overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left text-xs text-neutral-400 px-3 py-2">#</th>
                              <th className="text-left text-xs text-neutral-400 px-3 py-2">Name</th>
                              <th className="text-left text-xs text-neutral-400 px-3 py-2">Type</th>
                              <th className="text-left text-xs text-neutral-400 px-3 py-2">Data</th>
                            </tr>
                          </thead>
                          <tbody>
                            {params.map((param, idx) => (
                              <tr key={idx} className="border-b border-border/50 last:border-b-0">
                                <td className="px-3 py-2 text-xs">{idx}</td>
                                <td className="px-3 py-2 text-xs text-neutral-300">{param.name}</td>
                                <td className="px-3 py-2 text-xs text-neutral-300">{param.type}</td>
                                <td className="px-3 py-2 text-xs">
                                  <span className="font-mono text-primary">{param.value}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'ai' && (
        <AIExplanation 
          transactionData={{
            id: tx.id,
            type: tx.type,
            gasUsed: tx.gas,
            gasPayer: tx.origin, // Assuming gas payer is the origin for now
            origin: tx.origin,
            clauses: tx.clauses.map(clause => ({
              to: clause.to || '',
              value: clause.value,
              data: clause.data || '',
              decoded: clause.data ? decodeClauseHuman(clause.data) : undefined
            })),
            meta: {
              blockNumber: tx.meta?.blockNumber || 0,
              blockTimestamp: tx.meta?.blockTimestamp || 0
            }
          }}
        />
      )}
    </div>
  )
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-neutral-400 text-xs">{label}</div>
      <div className="mt-1">{value}</div>
    </div>
  )
}

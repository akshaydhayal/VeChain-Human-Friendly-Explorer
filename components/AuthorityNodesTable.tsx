'use client'

import { useState, useEffect } from 'react'
import { fetchAuthorityNodes, AuthorityNode, formatAddress, formatVTHO, formatTimestamp, generateNodeAvatar } from '@/lib/authorityService'
import CopyButton from '@/components/CopyButton'

export default function AuthorityNodesTable() {
  const [nodes, setNodes] = useState<AuthorityNode[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    const loadAuthorityNodes = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchAuthorityNodes()
        
        if (data) {
          setNodes(data)
        } else {
          setError('Failed to fetch authority nodes')
        }
      } catch (err) {
        console.error('Error loading authority nodes:', err)
        setError('Error loading authority nodes')
      } finally {
        setIsLoading(false)
      }
    }

    loadAuthorityNodes()
  }, [])

  const totalPages = Math.ceil(nodes.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentNodes = nodes.slice(startIndex, endIndex)

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-sm text-neutral-400">Loading authority nodes...</div>
        </div>
      </div>
    )
  }

  if (error || nodes.length === 0) {
    return (
      <div className="card p-6">
        <div className="text-center">
          <div className="text-sm text-neutral-400 mb-2">Authority Nodes Unavailable</div>
          <div className="text-xs text-neutral-500">{error || 'Unable to load authority nodes'}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">AUTHORITY NODES</h2>
          <p className="text-sm text-neutral-400 mt-1">Showing {nodes.length} authority nodes</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-400">Show active only</span>
            <div className="w-4 h-4 rounded-full bg-neutral-600 flex items-center justify-center">
              <span className="text-xs text-neutral-300">i</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-700">
              <th className="text-left py-2 px-3 text-sm font-medium text-cyan-400">
                <div className="flex items-center gap-1">
                  #
                  <span className="text-xs">◆</span>
                </div>
              </th>
              <th className="text-left py-2 px-3 text-sm font-medium text-blue-400">
                <div className="flex items-center gap-1">
                  Authority Node
                  <span className="text-xs">◆</span>
                </div>
              </th>
              <th className="text-left py-2 px-3 text-sm font-medium text-yellow-400">
                <div className="flex items-center gap-1">
                  Blocks Signed
                  <span className="text-xs">◆</span>
                </div>
              </th>
              <th className="text-left py-2 px-3 text-sm font-medium text-green-400">
                <div className="flex items-center gap-1">
                  VTHO Rewarded
                  <span className="text-xs">◆</span>
                </div>
              </th>
              <th className="text-left py-2 px-3 text-sm font-medium text-purple-400">
                <div className="flex items-center gap-1">
                  Last Block
                  <span className="text-xs">◆</span>
                </div>
              </th>
              <th className="text-left py-2 px-3 text-sm font-medium text-orange-400">
                <div className="flex items-center gap-1">
                  Last Activity
                  <span className="text-xs">◆</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentNodes.map((node, index) => (
              <tr key={node.address} className="border-b border-neutral-800 hover:bg-neutral-800/30 transition-colors">
                <td className="py-2 px-3 text-sm text-neutral-300">
                  {startIndex + index + 1}
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className={`w-8 h-8 flex items-center justify-center text-sm shadow-md ${
                        generateNodeAvatar(node.address).shape === 'circle' ? 'rounded-full' :
                        generateNodeAvatar(node.address).shape === 'square' ? 'rounded' :
                        generateNodeAvatar(node.address).shape === 'diamond' ? 'rotate-45 rounded' :
                        generateNodeAvatar(node.address).shape === 'hexagon' ? 'rounded' :
                        generateNodeAvatar(node.address).shape === 'triangle' ? 'rounded' :
                        generateNodeAvatar(node.address).shape === 'star' ? 'rounded' :
                        generateNodeAvatar(node.address).shape === 'heart' ? 'rounded' :
                        generateNodeAvatar(node.address).shape === 'shield' ? 'rounded' :
                        'rounded-full'
                      }`}
                      style={{
                        background: `${generateNodeAvatar(node.address).backgroundColor}`,
                        backgroundImage: generateNodeAvatar(node.address).pattern,
                        clipPath: generateNodeAvatar(node.address).shape === 'diamond' ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' :
                                  generateNodeAvatar(node.address).shape === 'hexagon' ? 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)' :
                                  generateNodeAvatar(node.address).shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' :
                                  generateNodeAvatar(node.address).shape === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' :
                                  generateNodeAvatar(node.address).shape === 'heart' ? 'polygon(50% 85%, 85% 20%, 50% 50%, 15% 20%)' :
                                  generateNodeAvatar(node.address).shape === 'shield' ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' :
                                  'none'
                      }}
                    >
                      {generateNodeAvatar(node.address).initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        Authority Node {startIndex + index + 1}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="text-xs text-neutral-400 font-mono truncate">
                          {formatAddress(node.address)}
                        </div>
                        <CopyButton text={node.address} />
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="text-xs text-neutral-500 truncate">
                          Endorser: {formatAddress(node.endorser)}
                        </div>
                        <CopyButton text={node.endorser} />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-2 px-3 text-sm text-yellow-400 font-semibold">
                  {node.blocks_total_signed.toLocaleString()}
                </td>
                <td className="py-2 px-3 text-sm text-green-400 font-semibold">
                  {formatVTHO(node.vtho_total_rewarded)}
                </td>
                <td className="py-2 px-3 text-sm text-blue-400 font-semibold">
                  #{node.last_block_signed.toLocaleString()}
                </td>
                <td className="py-2 px-3 text-sm text-neutral-300">
                  {formatTimestamp(node.last_block_timestamp)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-700">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-400">Rows per page</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="bg-neutral-800 border border-neutral-600 rounded px-2 py-1 text-sm text-white"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-neutral-400">‹</span>
          </button>
          <span className="text-sm text-neutral-400">Page {currentPage}</span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-neutral-400">›</span>
          </button>
        </div>
      </div>
    </div>
  )
}

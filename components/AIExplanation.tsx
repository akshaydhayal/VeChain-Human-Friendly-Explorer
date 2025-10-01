'use client'

import { useState, useEffect } from 'react'
import { TransactionData, analyzeTransaction, getDetailedAnalysis } from '@/lib/aiExplanationService'

interface AIExplanationProps {
  transactionData: TransactionData
}

export default function AIExplanation({ transactionData }: AIExplanationProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [analysis, setAnalysis] = useState<any>(null)

  useEffect(() => {
    const handleAnalyze = async () => {
      setIsAnalyzing(true)
      
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const result = analyzeTransaction(transactionData)
      setAnalysis(result)
      setIsAnalyzing(false)
    }

    handleAnalyze()
  }, [transactionData])

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'text-green-400'
      case 'moderate': return 'text-yellow-400'
      case 'complex': return 'text-red-400'
      default: return 'text-neutral-400'
    }
  }

  const getComplexityIcon = (complexity: string) => {
    switch (complexity) {
      case 'simple': return '🟢'
      case 'moderate': return '🟡'
      case 'complex': return '🔴'
      default: return '⚪'
    }
  }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
          <span className="text-white text-lg">🤖</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">AI Transaction Analysis</h3>
          <p className="text-sm text-neutral-400">Analyzing transaction details and generating explanation...</p>
        </div>
      </div>

      <div className="space-y-4">
          {isAnalyzing ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-lg font-semibold text-white mb-2">AI is analyzing...</div>
              <div className="text-sm text-neutral-400">Processing transaction details and generating explanation</div>
            </div>
          ) : analysis && (
            <div className="space-y-4">
              {/* Transaction Type Header */}
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-4 border border-blue-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🔍</span>
                  <div>
                    <h4 className="text-xl font-bold text-white">{analysis.transactionType}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm">{getComplexityIcon(analysis.complexity)}</span>
                      <span className={`text-sm font-medium ${getComplexityColor(analysis.complexity)}`}>
                        {analysis.complexity.charAt(0).toUpperCase() + analysis.complexity.slice(1)} Complexity
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-neutral-300">{analysis.summary}</p>
              </div>

              {/* Key Points */}
              <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg p-4 border border-green-500/20">
                <h5 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
                  <span>📋</span>
                  KEY POINTS
                </h5>
                <ul className="space-y-2">
                  {analysis.keyPoints.map((point: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span className="text-neutral-300">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Additional Information */}
              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-4 border border-purple-500/20">
                <h5 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
                  <span>ℹ️</span>
                  ADDITIONAL INFORMATION
                </h5>
                <p className="text-neutral-300 leading-relaxed">{analysis.additionalInfo}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setIsAnalyzing(true)
                    setTimeout(async () => {
                      const result = analyzeTransaction(transactionData)
                      setAnalysis(result)
                      setIsAnalyzing(false)
                    }, 1500)
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center gap-2"
                >
                  <span>🔄</span>
                  Re-analyze
                </button>
              </div>
            </div>
          )}
        </div>
    </div>
  )
}

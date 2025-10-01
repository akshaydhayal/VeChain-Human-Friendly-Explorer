// AI-powered transaction explanation service
export interface TransactionAnalysis {
  summary: string
  keyPoints: string[]
  additionalInfo: string
  transactionType: string
  complexity: 'simple' | 'moderate' | 'complex'
}

export interface TransactionData {
  id: string
  type: number
  gasUsed: number
  gasPayer: string
  origin: string
  clauses: Array<{
    to: string
    value: string
    data: string
    decoded?: {
      functionName: string
      parameters: Array<{
        name: string
        type: string
        value: any
      }>
    }
  }>
  meta: {
    blockNumber: number
    blockTimestamp: number
  }
}

// AI-powered transaction analysis
export function analyzeTransaction(txData: TransactionData): TransactionAnalysis {
  const { clauses, gasUsed, origin, gasPayer } = txData
  
  // Determine transaction type
  const transactionType = determineTransactionType(clauses)
  
  // Analyze complexity
  const complexity = determineComplexity(clauses, gasUsed)
  
  // Generate summary
  const summary = generateSummary(transactionType, clauses, origin, gasPayer)
  
  // Extract key points
  const keyPoints = extractKeyPoints(txData, clauses)
  
  // Generate additional info
  const additionalInfo = generateAdditionalInfo(txData, complexity)
  
  return {
    summary,
    keyPoints,
    additionalInfo,
    transactionType,
    complexity
  }
}

function determineTransactionType(clauses: any[]): string {
  if (clauses.length === 0) return 'Empty Transaction'
  if (clauses.length === 1) {
    const clause = clauses[0]
    if (clause.value !== '0x0') return 'Simple Transfer'
    if (clause.data === '0x') return 'Contract Call'
    return 'Smart Contract Interaction'
  }
  
  // Check for common patterns
  const hasTransfers = clauses.some(c => c.value !== '0x0')
  const hasContractCalls = clauses.some(c => c.data !== '0x')
  
  if (hasTransfers && hasContractCalls) return 'Multi-Action Transaction'
  if (hasTransfers) return 'Batch Transfer'
  if (hasContractCalls) return 'Batch Contract Calls'
  
  return 'Complex Transaction'
}

function determineComplexity(clauses: any[], gasUsed: number): 'simple' | 'moderate' | 'complex' {
  if (clauses.length === 1 && gasUsed < 100000) return 'simple'
  if (clauses.length <= 3 && gasUsed < 500000) return 'moderate'
  return 'complex'
}

function generateSummary(transactionType: string, clauses: any[], origin: string, gasPayer: string): string {
  const clauseCount = clauses.length
  const isSelfTransaction = origin === gasPayer
  
  let summary = `${transactionType}`
  
  if (clauseCount > 1) {
    summary += ` involving ${clauseCount} operations`
  }
  
  if (isSelfTransaction) {
    summary += ` executed by the transaction originator`
  } else {
    summary += ` with gas paid by a different account`
  }
  
  return summary
}

function extractKeyPoints(txData: TransactionData, clauses: any[]): string[] {
  const points: string[] = []
  
  // Gas information
  points.push(`Transaction fee: ${formatGasFee(txData.gasUsed)}`)
  
  // Clause information
  if (clauses.length > 0) {
    const transferClauses = clauses.filter(c => c.value !== '0x0')
    const contractClauses = clauses.filter(c => c.data !== '0x')
    
    if (transferClauses.length > 0) {
      const totalValue = transferClauses.reduce((sum, c) => {
        const value = parseInt(c.value, 16)
        return sum + value
      }, 0)
      points.push(`Involved ${transferClauses.length} token transfer${transferClauses.length > 1 ? 's' : ''} worth ${formatValue(totalValue)}`)
    }
    
    if (contractClauses.length > 0) {
      points.push(`Executed ${contractClauses.length} smart contract interaction${contractClauses.length > 1 ? 's' : ''}`)
    }
  }
  
  // Decoded function information with specific details
  const decodedClauses = clauses.filter(c => c.decoded)
  if (decodedClauses.length > 0) {
    const functions = decodedClauses.map(c => c.decoded?.functionName).filter(Boolean)
    if (functions.length > 0) {
      points.push(`Called functions: ${functions.join(', ')}`)
    }
    
    // Add specific clause details
    decodedClauses.forEach((clause, index) => {
      if (clause.decoded?.summary) {
        points.push(`Clause ${index + 1}: ${clause.decoded.summary}`)
      }
      
      // Add key parameters if available
      if (clause.decoded?.parameters && clause.decoded.parameters.length > 0) {
        const keyParams = clause.decoded.parameters.slice(0, 3) // Show first 3 parameters
        const paramDetails = keyParams.map(p => `${p.name}: ${formatParameterValue(p.value, p.type)}`).join(', ')
        if (paramDetails) {
          points.push(`Key parameters: ${paramDetails}`)
        }
      }
    })
  }
  
  // Gas payer information
  if (txData.origin !== txData.gasPayer) {
    points.push(`Gas paid by different account (${formatAddress(txData.gasPayer)})`)
  }
  
  // Transaction type specific points
  if (txData.type === 0) {
    points.push('Standard VeChain transaction')
  } else if (txData.type === 1) {
    points.push('Contract creation transaction')
  }
  
  return points
}

function formatParameterValue(value: any, type: string): string {
  if (typeof value === 'string' && value.startsWith('0x')) {
    // Handle hex values
    if (value.length === 42) {
      // Likely an address
      return `${value.slice(0, 6)}...${value.slice(-4)}`
    } else if (value.length > 10) {
      // Long hex string, truncate
      return `${value.slice(0, 10)}...`
    }
    return value
  }
  
  if (typeof value === 'number') {
    if (type.includes('uint') || type.includes('int')) {
      return value.toLocaleString()
    }
    return value.toString()
  }
  
  if (typeof value === 'string' && value.length > 20) {
    return `${value.slice(0, 20)}...`
  }
  
  return String(value)
}

function formatValue(value: number): string {
  if (value === 0) return '0 VET'
  if (value < Math.pow(10, 18)) {
    return `${(value / Math.pow(10, 18)).toFixed(6)} VET`
  }
  return `${value.toLocaleString()} wei`
}

function generateAdditionalInfo(txData: TransactionData, complexity: string): string {
  let info = `Transaction executed in block ${txData.meta.blockNumber} at ${new Date(txData.meta.blockTimestamp * 1000).toLocaleString()}. `
  
  // Add clause-specific context
  const decodedClauses = txData.clauses.filter(c => c.decoded)
  if (decodedClauses.length > 0) {
    const functionNames = decodedClauses.map(c => c.decoded?.functionName).filter(Boolean)
    if (functionNames.length > 0) {
      info += `The transaction calls ${functionNames.length} function${functionNames.length > 1 ? 's' : ''}: ${functionNames.join(', ')}. `
    }
  }
  
  // Add complexity-based explanation
  if (complexity === 'complex') {
    info += 'This is a complex transaction involving multiple operations and smart contract interactions, likely part of a sophisticated DeFi strategy or multi-step protocol interaction.'
  } else if (complexity === 'moderate') {
    info += 'This transaction involves moderate complexity with multiple operations, possibly including token transfers and smart contract calls.'
  } else {
    info += 'This is a straightforward transaction with simple operations.'
  }
  
  // Add specific clause details if available
  const transferClauses = txData.clauses.filter(c => c.value !== '0x0')
  if (transferClauses.length > 0) {
    info += ` The transaction includes ${transferClauses.length} token transfer${transferClauses.length > 1 ? 's' : ''}.`
  }
  
  return info
}

function formatGasFee(gasUsed: number): string {
  // For VeChain, gas is typically measured in units, not wei
  // This is a simplified representation
  return `${gasUsed.toLocaleString()} gas units`
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Enhanced analysis for specific transaction types
export function getDetailedAnalysis(txData: TransactionData): string {
  const analysis = analyzeTransaction(txData)
  
  let detailedAnalysis = `## ${analysis.transactionType}\n\n`
  
  detailedAnalysis += `**Summary:** ${analysis.summary}\n\n`
  
  detailedAnalysis += `**Key Points:**\n`
  analysis.keyPoints.forEach(point => {
    detailedAnalysis += `• ${point}\n`
  })
  
  detailedAnalysis += `\n**Additional Information:**\n${analysis.additionalInfo}`
  
  return detailedAnalysis
}

import { getThorClient } from './thorClient'

export type RealBlockUpdate = {
  number: number
  id: string
  size: number
  parentID: string
  timestamp: number
  gasLimit: number
  beneficiary: string
  gasUsed: number
  baseFeePerGas: string
  totalScore: number
  txsRoot: string
  txsFeatures: number
  stateRoot: string
  receiptsRoot: string
  com: boolean
  signer: string
  transactions: string[]
  obsolete: boolean
}

export class RealBlockService {
  private interval: NodeJS.Timeout | null = null
  private isConnected = false
  private lastBlockNumber = 0

  constructor(
    private onBlockUpdate: (block: RealBlockUpdate) => void,
    private onConnectionChange: (connected: boolean) => void,
    private network: 'mainnet' | 'testnet' = 'mainnet'
  ) {}

  async connect(): Promise<void> {
    if (this.isConnected) {
      return
    }

    console.log('Real Block Service: Connecting to VeChain...')
    
    try {
      // Get the latest real block first
      const thor = getThorClient()
      const latestBlock = await thor.blocks.getBestBlockExpanded()
      
      if (latestBlock && latestBlock.number) {
        this.lastBlockNumber = latestBlock.number
        console.log(`Real Block Service: Latest block is #${this.lastBlockNumber}`)
        
        this.isConnected = true
        this.onConnectionChange(true)
        
        // Start polling for new blocks
        this.startPolling()
      } else {
        throw new Error('Could not fetch latest block')
      }
    } catch (error) {
      console.error('Real Block Service: Failed to connect:', error)
      this.onConnectionChange(false)
    }
  }

  private startPolling(): void {
    const pollForNewBlocks = async () => {
      try {
        const thor = getThorClient()
        const latestBlock = await thor.blocks.getBestBlockExpanded()
        
        if (latestBlock && latestBlock.number > this.lastBlockNumber) {
          console.log(`New block detected: #${latestBlock.number}`)
          
          // Convert to our format
          const blockUpdate: RealBlockUpdate = {
            number: latestBlock.number,
            id: latestBlock.id,
            size: latestBlock.size,
            parentID: latestBlock.parentID,
            timestamp: latestBlock.timestamp,
            gasLimit: latestBlock.gasLimit,
            beneficiary: latestBlock.beneficiary,
            gasUsed: latestBlock.gasUsed,
            baseFeePerGas: latestBlock.baseFeePerGas || '0x0',
            totalScore: latestBlock.totalScore,
            txsRoot: latestBlock.txsRoot,
            txsFeatures: latestBlock.txsFeatures,
            stateRoot: latestBlock.stateRoot,
            receiptsRoot: latestBlock.receiptsRoot,
            com: latestBlock.com,
            signer: latestBlock.signer,
            transactions: latestBlock.transactions || [],
            obsolete: latestBlock.obsolete || false
          }
          
          this.onBlockUpdate(blockUpdate)
          this.lastBlockNumber = latestBlock.number
        }
      } catch (error) {
        console.error('Error polling for new blocks:', error)
      }
    }

    // Poll every 3 seconds
    this.interval = setInterval(pollForNewBlocks, 3000)
  }

  disconnect(): void {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
    this.isConnected = false
    this.onConnectionChange(false)
    console.log('Real Block Service: Disconnected')
  }

  updateNetwork(network: 'mainnet' | 'testnet'): void {
    this.network = network
    if (this.isConnected) {
      this.disconnect()
      setTimeout(() => this.connect(), 100)
    }
  }
}

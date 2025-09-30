export type BlockUpdate = {
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

export class MockVeChainWebSocket {
  private interval: NodeJS.Timeout | null = null
  private isConnected = false
  private blockNumber = 0
  private isInitialized = false

  constructor(
    private onBlockUpdate: (block: BlockUpdate) => void,
    private onConnectionChange: (connected: boolean) => void,
    private network: 'mainnet' | 'testnet' = 'mainnet'
  ) {}

  async connect(): Promise<void> {
    if (this.isConnected) {
      return
    }

    console.log('Mock WebSocket: Connecting to VeChain...')
    
    // Simulate connection delay
    setTimeout(async () => {
      this.isConnected = true
      this.onConnectionChange(true)
      console.log('Mock WebSocket: Connected to VeChain')
      
      // Get the latest real block number first
      await this.initializeLatestBlock()
      
      // Start generating mock blocks every 3-8 seconds
      this.startMockBlocks()
    }, 1000)
  }

  private async initializeLatestBlock(): Promise<void> {
    try {
      // Fetch the latest real block from VeChain
      const { getThorClient } = await import('./thorClient')
      const thor = getThorClient()
      const latestBlock = await thor.blocks.getBestBlockExpanded()
      
      if (latestBlock && latestBlock.number) {
        this.blockNumber = latestBlock.number
        console.log(`Mock WebSocket: Initialized with latest block #${this.blockNumber}`)
      } else {
        // Fallback to a recent block number
        this.blockNumber = Math.floor(Date.now() / 1000) % 1000000 + 22800000
        console.log(`Mock WebSocket: Using fallback block #${this.blockNumber}`)
      }
    } catch (error) {
      console.error('Failed to get latest block, using fallback:', error)
      // Fallback to a recent block number
      this.blockNumber = Math.floor(Date.now() / 1000) % 1000000 + 22800000
    }
  }

  private startMockBlocks(): void {
    const generateMockBlock = () => {
      this.blockNumber++
      console.log(`Generating mock block #${this.blockNumber}`)
      const block: BlockUpdate = {
        number: this.blockNumber,
        id: `0x${Math.random().toString(16).substr(2, 64)}`,
        size: Math.floor(Math.random() * 20000) + 10000,
        parentID: `0x${Math.random().toString(16).substr(2, 64)}`,
        timestamp: Math.floor(Date.now() / 1000),
        gasLimit: 40000000,
        beneficiary: `0x${Math.random().toString(16).substr(2, 40)}`,
        gasUsed: Math.floor(Math.random() * 5000000) + 1000000,
        baseFeePerGas: '0x9184e72a000',
        totalScore: this.blockNumber * 1000,
        txsRoot: `0x${Math.random().toString(16).substr(2, 64)}`,
        txsFeatures: 1,
        stateRoot: `0x${Math.random().toString(16).substr(2, 64)}`,
        receiptsRoot: `0x${Math.random().toString(16).substr(2, 64)}`,
        com: true,
        signer: `0x${Math.random().toString(16).substr(2, 40)}`,
        transactions: Array.from({ length: Math.floor(Math.random() * 50) + 10 }, () => 
          `0x${Math.random().toString(16).substr(2, 64)}`
        ),
        obsolete: false
      }
      
      this.onBlockUpdate(block)
    }

    // Generate first block immediately (this will be the latest + 1)
    generateMockBlock()
    
    // Then generate blocks every 3-8 seconds
    const scheduleNext = () => {
      const delay = Math.random() * 5000 + 3000 // 3-8 seconds
      this.interval = setTimeout(() => {
        generateMockBlock()
        scheduleNext()
      }, delay)
    }
    
    scheduleNext()
  }

  disconnect(): void {
    if (this.interval) {
      clearTimeout(this.interval)
      this.interval = null
    }
    this.isConnected = false
    this.onConnectionChange(false)
    console.log('Mock WebSocket: Disconnected')
  }

  updateNetwork(network: 'mainnet' | 'testnet'): void {
    this.network = network
    if (this.isConnected) {
      this.disconnect()
      setTimeout(() => this.connect(), 100)
    }
  }
}

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

export class SimpleVeChainWebSocket {
  private ws: WebSocket | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor(
    private onBlockUpdate: (block: BlockUpdate) => void,
    private onConnectionChange: (connected: boolean) => void,
    private network: 'mainnet' | 'testnet' = 'mainnet'
  ) {}

  private getWebSocketUrl(): string {
    // Use direct WebSocket URLs for VeChain
    if (this.network === 'testnet') {
      return 'wss://testnet.vechain.org/events'
    } else {
      return 'wss://mainnet.vechain.org/events'
    }
  }

  connect(): void {
    if (this.ws && this.isConnected) {
      return
    }

    // Check if WebSocket is available
    if (typeof window === 'undefined' || !window.WebSocket) {
      console.error('WebSocket not available in this environment')
      this.onConnectionChange(false)
      return
    }

    try {
      const wsUrl = this.getWebSocketUrl()
      console.log('Connecting to WebSocket:', wsUrl)
      this.ws = new window.WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('WebSocket connected to VeChain')
        this.isConnected = true
        this.reconnectAttempts = 0
        this.onConnectionChange(true)
      }

      this.ws.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data)
          if (parsedData && parsedData.number) {
            // Ensure transaction count is correctly set from the actual data
            const blockData = parsedData as BlockUpdate
            if (blockData.transactions && Array.isArray(blockData.transactions)) {
              // Transaction count is already correct from the block data
              this.onBlockUpdate(blockData)
            } else {
              // Fallback if transactions array is missing
              blockData.transactions = []
              this.onBlockUpdate(blockData)
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.isConnected = false
        this.onConnectionChange(false)
        this.attemptReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.isConnected = false
        this.onConnectionChange(false)
      }

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      this.attemptReconnect()
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
    
    setTimeout(() => {
      this.connect()
    }, this.reconnectDelay * this.reconnectAttempts)
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.isConnected = false
    this.onConnectionChange(false)
  }

  updateNetwork(network: 'mainnet' | 'testnet'): void {
    this.network = network
    if (this.isConnected) {
      this.disconnect()
      setTimeout(() => this.connect(), 100)
    }
  }
}

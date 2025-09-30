import { subscriptions } from '@vechain/sdk-network'

// Dynamic import for isomorphic-ws to handle SSR
let WebSocket: any = null
if (typeof window !== 'undefined') {
  WebSocket = require('isomorphic-ws').default
}

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

export class VeChainWebSocket {
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
    if (!WebSocket) {
      console.error('WebSocket not available in this environment')
      this.onConnectionChange(false)
      return
    }

    try {
      const wsUrl = this.getWebSocketUrl()
      console.log('Connecting to WebSocket:', wsUrl)
      this.ws = new WebSocket(wsUrl)

      this.ws.on('open', () => {
        console.log('WebSocket connected to VeChain')
        this.isConnected = true
        this.reconnectAttempts = 0
        this.onConnectionChange(true)
      })

      this.ws.on('message', (data: any) => {
        try {
          const parsedData = JSON.parse(data.toString())
          if (parsedData && parsedData.number) {
            this.onBlockUpdate(parsedData as BlockUpdate)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      })

      this.ws.on('close', () => {
        console.log('WebSocket disconnected')
        this.isConnected = false
        this.onConnectionChange(false)
        this.attemptReconnect()
      })

      this.ws.on('error', (error) => {
        console.error('WebSocket error:', error)
        this.isConnected = false
        this.onConnectionChange(false)
      })

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
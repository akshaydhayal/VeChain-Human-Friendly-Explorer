import { ThorClient } from '@vechain/sdk-network'

let thorSingleton: ReturnType<typeof ThorClient.at> | null = null

function getEndpoint(): string {
  // Server-side fallback or default
  return process.env.VECHAIN_ENDPOINT || 'https://mainnet.vechain.org'
}

export function getThorClient() {
  if (!thorSingleton) {
    thorSingleton = ThorClient.at(getEndpoint())
  }
  return thorSingleton
}

export function resetThorClient() {
  thorSingleton = null
}

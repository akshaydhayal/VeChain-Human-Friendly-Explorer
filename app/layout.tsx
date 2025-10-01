import './globals.css'
import { ReactNode } from 'react'
import SearchInput from '@/components/SearchInput'
import NetworkSelector from '@/components/NetworkSelector'

export const metadata = {
  title: 'VeChain Explorer (Human Friendly)',
  description: 'A human-friendly blockchain explorer for VeChain',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-50 border-b border-border bg-black/60 backdrop-blur">
            <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-4">
              <a href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-dashed flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                </div>
                <span className="text-primary font-bold text-xl tracking-wide">VeStats</span>
              </a>
              <SearchInput />
              <nav className="flex items-center gap-3 text-sm">
                <a className="hover:text-white" href="/">VeStats</a>
                <a className="hover:text-white" href="/authority-nodes">Authority Nodes</a>
                <a className="hover:text-white" href="#">Stake</a>
                <NetworkSelector />
              </nav>
            </div>
          </header>
          <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6">{children}</main>
          <footer className="border-t border-border text-xs text-neutral-500 px-4 py-6">
            <div className="mx-auto max-w-7xl">Powered by mock services. VeChain SDK integration coming soon.</div>
          </footer>
        </div>
      </body>
    </html>
  )
}



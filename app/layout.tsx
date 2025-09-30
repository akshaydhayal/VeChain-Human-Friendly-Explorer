import './globals.css'
import { ReactNode } from 'react'
import SearchInput from '@/components/SearchInput'

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
              <div className="text-primary font-semibold tracking-wide">orb</div>
              <SearchInput />
              <nav className="flex items-center gap-3 text-sm">
                <a className="hover:text-white" href="/">Stats</a>
                <a className="hover:text-white" href="#">Stake</a>
                <span className="chip">Mainnet</span>
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



'use client'

export default function SearchInput() {
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = (e.target as HTMLInputElement).value.trim()
      if (!q) return
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const json = await res.json()
      if (json?.href) window.location.href = json.href
    }
  }

  return (
    <input
      className="flex-1 bg-surface border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
      placeholder="Search for block or tx id..."
      onKeyDown={handleKeyDown}
    />
  )
}

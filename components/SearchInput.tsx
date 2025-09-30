'use client'

import { useState, useEffect } from 'react'

export default function SearchInput() {
  const [placeholder, setPlaceholder] = useState('Search for...')
  
  useEffect(() => {
    const texts = ['wallets', 'transactions', 'blocks', 'accounts', 'tokens']
    let textIndex = 0
    let charIndex = 0
    let isDeleting = false
    
    const animate = () => {
      const current = texts[textIndex]
      
      if (isDeleting) {
        charIndex--
      } else {
        charIndex++
      }
      
      const displayText = current.substring(0, charIndex)
      setPlaceholder(`Search for ${displayText}...`)
      
      if (!isDeleting && charIndex === current.length) {
        setTimeout(() => { isDeleting = true }, 1500)
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false
        textIndex = (textIndex + 1) % texts.length
      }
      
      setTimeout(animate, isDeleting ? 80 : 150)
    }
    
    animate()
  }, [])

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
      placeholder={placeholder}
      onKeyDown={handleKeyDown}
    />
  )
}

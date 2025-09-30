import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0b0b0c',
        surface: '#151517',
        border: '#262629',
        primary: '#ff5533',
        success: '#2ecc71',
        warn: '#f1c40f',
        danger: '#e74c3c'
      },
      boxShadow: {
        soft: '0 0 0 1px rgba(255,255,255,0.04), 0 6px 24px rgba(0,0,0,0.45)'
      }
    }
  },
  plugins: []
}

export default config



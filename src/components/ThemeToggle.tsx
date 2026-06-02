'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className="p-2 t2 hover:t1 rounded-xl transition duration-200"
      title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
    >
      {theme === 'dark'
        ? <Sun size={17} strokeWidth={1.5} />
        : <Moon size={17} strokeWidth={1.5} />
      }
    </button>
  )
}

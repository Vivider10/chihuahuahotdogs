import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'
import '../business-theme.css'
import BusinessDashboard from '../components/BusinessDashboard'

const THEME_KEY = 'chihuahua-pos-theme'
type Theme = 'dark' | 'light'

export const Route = createFileRoute('/business')({
  component: Business,
})

function Business() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark'
    return window.localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'
  })

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    window.localStorage.setItem(THEME_KEY, next)
  }

  return (
    <div className="business-page" data-theme={theme}>
      <button className="business-theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
      </button>
      <BusinessDashboard />
    </div>
  )
}

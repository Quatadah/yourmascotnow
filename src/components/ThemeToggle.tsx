import { useEffect, useState } from 'react'

import { appearanceChangeEvent } from '#/lib/mascotAppearance'

type Theme = 'light' | 'dark'

const storageKey = 'ymn-theme'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    const appliedTheme =
      document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
    setTheme(appliedTheme)
  }, [])

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = nextTheme
    window.localStorage.setItem(storageKey, nextTheme)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', nextTheme === 'dark' ? '#111613' : '#eef1ec')
    setTheme(nextTheme)
    window.dispatchEvent(new CustomEvent(appearanceChangeEvent))
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={
        theme
          ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`
          : 'Toggle color theme'
      }
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className={theme === 'dark' ? undefined : 'is-active'}>
          Light
        </span>
        <span className={theme === 'dark' ? 'is-active' : undefined}>Dark</span>
      </span>
    </button>
  )
}

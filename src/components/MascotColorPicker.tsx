import { RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  appearanceChangeEvent,
  applyMascotColor,
  darkMascotInk,
  isHexColor,
  lightMascotInk,
  mascotColorStorageKey,
  resetMascotColor,
} from '#/lib/mascotAppearance'

export function MascotColorPicker() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [customColor, setCustomColor] = useState<string | null>(null)

  useEffect(() => {
    const syncAppearance = () => {
      setTheme(
        document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
      )
      const storedColor = window.localStorage.getItem(mascotColorStorageKey)
      setCustomColor(isHexColor(storedColor) ? storedColor : null)
    }

    syncAppearance()
    window.addEventListener(appearanceChangeEvent, syncAppearance)
    return () =>
      window.removeEventListener(appearanceChangeEvent, syncAppearance)
  }, [])

  const visibleColor =
    customColor ?? (theme === 'dark' ? darkMascotInk : lightMascotInk)

  return (
    <div className="mascot-color-control">
      <label>
        <span>Ink</span>
        <input
          type="color"
          value={visibleColor}
          onChange={(event) => {
            const color = event.target.value
            setCustomColor(color)
            applyMascotColor(color)
          }}
          aria-label="Choose mascot color"
          title="Choose any mascot color"
        />
      </label>
      {customColor ? (
        <button
          type="button"
          className="mascot-color-reset"
          onClick={() => {
            setCustomColor(null)
            resetMascotColor()
          }}
          aria-label="Reset mascot color to theme"
          title="Use the light or dark theme color"
        >
          <RotateCcw aria-hidden="true" />
        </button>
      ) : (
        <span className="mascot-color-auto">Auto</span>
      )}
    </div>
  )
}

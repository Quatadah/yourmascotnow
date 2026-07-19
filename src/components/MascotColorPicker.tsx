import { Check, ChevronDown, Palette, RotateCcw } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useEffect, useId, useRef, useState } from 'react'

import {
  appearanceChangeEvent,
  applyMascotColor,
  darkMascotInk,
  isHexColor,
  lightMascotInk,
  mascotColorStorageKey,
  resetMascotColor,
} from '#/lib/mascotAppearance'

const studioColors = [
  { name: 'Graphite', value: '#161616' },
  { name: 'Chalk', value: '#f5f5f5' },
  { name: 'Vermilion', value: '#e6492d' },
  { name: 'Cobalt', value: '#2f6fdb' },
  { name: 'Moss', value: '#397158' },
  { name: 'Plum', value: '#755384' },
  { name: 'Saffron', value: '#c48818' },
  { name: 'Cerulean', value: '#237f91' },
] as const

type HslColor = {
  hue: number
  saturation: number
  lightness: number
}

function hexToHsl(color: string): HslColor {
  const red = Number.parseInt(color.slice(1, 3), 16) / 255
  const green = Number.parseInt(color.slice(3, 5), 16) / 255
  const blue = Number.parseInt(color.slice(5, 7), 16) / 255
  const maximum = Math.max(red, green, blue)
  const minimum = Math.min(red, green, blue)
  const delta = maximum - minimum
  const lightness = (maximum + minimum) / 2
  let hue = 0

  if (delta) {
    if (maximum === red) hue = ((green - blue) / delta) % 6
    if (maximum === green) hue = (blue - red) / delta + 2
    if (maximum === blue) hue = (red - green) / delta + 4
    hue *= 60
    if (hue < 0) hue += 360
  }

  const saturation = delta ? delta / (1 - Math.abs(2 * lightness - 1)) : 0

  return {
    hue: Math.round(hue),
    saturation: Math.round(saturation * 100),
    lightness: Math.round(lightness * 100),
  }
}

function hslToHex({ hue, saturation, lightness }: HslColor) {
  const normalizedSaturation = saturation / 100
  const normalizedLightness = lightness / 100
  const channel = (offset: number) => {
    const position = (offset + hue / 30) % 12
    const amount =
      normalizedSaturation *
      Math.min(normalizedLightness, 1 - normalizedLightness)
    return (
      normalizedLightness -
      amount * Math.max(-1, Math.min(position - 3, 9 - position, 1))
    )
  }
  const toHex = (value: number) =>
    Math.round(255 * value)
      .toString(16)
      .padStart(2, '0')

  return `#${toHex(channel(0))}${toHex(channel(8))}${toHex(channel(4))}`
}

export function MascotColorPicker() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [customColor, setCustomColor] = useState<string | null>(null)
  const [hexDraft, setHexDraft] = useState(lightMascotInk)
  const [isOpen, setIsOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    const syncAppearance = () => {
      const nextTheme =
        document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
      const storedColor = window.localStorage.getItem(mascotColorStorageKey)
      const nextCustomColor = isHexColor(storedColor)
        ? storedColor.toLowerCase()
        : null
      const nextVisibleColor =
        nextCustomColor ??
        (nextTheme === 'dark' ? darkMascotInk : lightMascotInk)

      setTheme(nextTheme)
      setCustomColor(nextCustomColor)
      setHexDraft(nextVisibleColor)
    }

    syncAppearance()
    window.addEventListener(appearanceChangeEvent, syncAppearance)
    return () =>
      window.removeEventListener(appearanceChangeEvent, syncAppearance)
  }, [])

  const visibleColor =
    customColor ?? (theme === 'dark' ? darkMascotInk : lightMascotInk)
  const hsl = hexToHsl(visibleColor)

  const selectColor = (color: string) => {
    const normalizedColor = color.toLowerCase()
    setCustomColor(normalizedColor)
    setHexDraft(normalizedColor)
    applyMascotColor(normalizedColor)
  }

  const updateChannel = (channel: keyof HslColor, value: number) => {
    selectColor(hslToHex({ ...hsl, [channel]: value }))
  }

  const commitHex = () => {
    const normalizedDraft = hexDraft.startsWith('#') ? hexDraft : `#${hexDraft}`
    if (isHexColor(normalizedDraft)) {
      selectColor(normalizedDraft)
      return
    }
    setHexDraft(visibleColor)
  }

  const useThemeColor = () => {
    const themeColor = theme === 'dark' ? darkMascotInk : lightMascotInk
    setCustomColor(null)
    setHexDraft(themeColor)
    resetMascotColor()
  }

  const sliderStyles = {
    '--saturation-start': hslToHex({
      ...hsl,
      saturation: 0,
    }),
    '--saturation-end': hslToHex({
      ...hsl,
      saturation: 100,
    }),
    '--lightness-mid': hslToHex({
      ...hsl,
      lightness: 50,
    }),
    '--picker-color': visibleColor,
  } as CSSProperties

  return (
    <div className="color-picker" ref={pickerRef} style={sliderStyles}>
      <button
        type="button"
        className="color-trigger"
        aria-label={`Choose mascot color, current ${visibleColor}`}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-haspopup="dialog"
        popoverTarget={panelId}
      >
        <Palette aria-hidden="true" />
        <span>Color</span>
        <span
          className="color-trigger-chip"
          style={{ backgroundColor: visibleColor }}
          aria-hidden="true"
        />
        <ChevronDown aria-hidden="true" />
      </button>

      <div
        ref={panelRef}
        id={panelId}
        className="color-popover"
        role="dialog"
        aria-label="Mascot color mixer"
        popover="auto"
        onToggle={(event) =>
          setIsOpen(event.currentTarget.matches(':popover-open'))
        }
      >
        <div className="color-popover-heading">
          <div>
            <strong>Mascot color</strong>
            <span>Choose a swatch or mix your own.</span>
          </div>
          <span
            className="color-current-chip"
            style={{ backgroundColor: visibleColor }}
            aria-hidden="true"
          />
        </div>

        <div className="color-swatches" aria-label="Studio colors">
          {studioColors.map((color) => {
            const isSelected = customColor === color.value
            return (
              <button
                key={color.value}
                type="button"
                className="color-swatch"
                aria-label={`${color.name}, ${color.value}`}
                aria-pressed={isSelected}
                onClick={() => selectColor(color.value)}
              >
                <span style={{ backgroundColor: color.value }}>
                  {isSelected ? <Check aria-hidden="true" /> : null}
                </span>
                <small>{color.name}</small>
              </button>
            )
          })}
        </div>

        <div className="color-mixer">
          <label className="color-slider color-slider--hue">
            <span>Hue</span>
            <input
              type="range"
              min="0"
              max="359"
              value={hsl.hue}
              onChange={(event) =>
                updateChannel('hue', Number(event.target.value))
              }
            />
            <output>{hsl.hue}°</output>
          </label>
          <label className="color-slider color-slider--saturation">
            <span>Saturation</span>
            <input
              type="range"
              min="0"
              max="100"
              value={hsl.saturation}
              onChange={(event) =>
                updateChannel('saturation', Number(event.target.value))
              }
            />
            <output>{hsl.saturation}%</output>
          </label>
          <label className="color-slider color-slider--lightness">
            <span>Lightness</span>
            <input
              type="range"
              min="0"
              max="100"
              value={hsl.lightness}
              onChange={(event) =>
                updateChannel('lightness', Number(event.target.value))
              }
            />
            <output>{hsl.lightness}%</output>
          </label>
        </div>

        <div className="color-popover-footer">
          <label className="color-hex-field">
            <span>Hex</span>
            <input
              type="text"
              value={hexDraft}
              aria-label="Custom hex color"
              inputMode="text"
              spellCheck="false"
              maxLength={7}
              onChange={(event) => setHexDraft(event.target.value)}
              onBlur={commitHex}
              onKeyDown={(event) => {
                if (event.key === 'Enter') commitHex()
              }}
            />
          </label>
          <button
            type="button"
            className="color-auto-button"
            aria-pressed={!customColor}
            onClick={useThemeColor}
          >
            <RotateCcw aria-hidden="true" />
            Use theme color
          </button>
        </div>
      </div>
    </div>
  )
}

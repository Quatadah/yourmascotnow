import { useEffect, useState } from 'react'

export const mascotColorStorageKey = 'ymn-mascot-color'
export const appearanceChangeEvent = 'ymn-appearance-change'

export const lightMascotInk = '#161616'
export const darkMascotInk = '#f5f5f5'
export const lightArtworkSurface = '#ffffff'
export const darkArtworkSurface = '#111111'

export function isHexColor(value: string | null): value is string {
  return Boolean(value && /^#[0-9a-f]{6}$/i.test(value))
}

export function getContrastingSurface(color: string) {
  const red = Number.parseInt(color.slice(1, 3), 16)
  const green = Number.parseInt(color.slice(3, 5), 16)
  const blue = Number.parseInt(color.slice(5, 7), 16)
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255

  return luminance > 0.56 ? darkArtworkSurface : lightArtworkSurface
}

export function applyMascotColor(color: string) {
  if (!isHexColor(color)) return

  const root = document.documentElement
  root.dataset.mascotColor = 'custom'
  root.style.setProperty('--mascot-ink-user', color)
  root.style.setProperty('--art-paper-user', getContrastingSurface(color))
  window.localStorage.setItem(mascotColorStorageKey, color)
  window.dispatchEvent(new CustomEvent(appearanceChangeEvent))
}

export function resetMascotColor() {
  const root = document.documentElement
  delete root.dataset.mascotColor
  root.style.removeProperty('--mascot-ink-user')
  root.style.removeProperty('--art-paper-user')
  window.localStorage.removeItem(mascotColorStorageKey)
  window.dispatchEvent(new CustomEvent(appearanceChangeEvent))
}

export function getActiveMascotColor() {
  const root = document.documentElement
  const custom = root.style.getPropertyValue('--mascot-ink-user').trim()

  if (root.dataset.mascotColor === 'custom' && isHexColor(custom)) {
    return custom.toLowerCase()
  }

  return root.dataset.theme === 'dark' ? darkMascotInk : lightMascotInk
}

function getColorInstruction() {
  if (typeof document === 'undefined') return ''

  const root = document.documentElement
  if (root.dataset.mascotColor === 'custom') {
    const color = getActiveMascotColor()
    return `Color direction: replace every black marker stroke and solid ink area with ${color}. Keep the canvas ${getContrastingSurface(color) === darkArtworkSurface ? 'near-black' : 'clean white'} for strong contrast; do not introduce any additional colors.`
  }

  if (root.dataset.theme === 'dark') {
    return 'Color direction: create the reversed dark-mode version with soft white marker strokes and solid ink areas on a neutral near-black canvas.'
  }

  return ''
}

export function getColorAwarePrompt(prompt: string) {
  const instruction = getColorInstruction()
  return instruction ? `${prompt}\n\n${instruction}` : prompt
}

export function useColorAwarePrompt(prompt: string) {
  const [resolvedPrompt, setResolvedPrompt] = useState(prompt)

  useEffect(() => {
    const updatePrompt = () => setResolvedPrompt(getColorAwarePrompt(prompt))
    updatePrompt()
    window.addEventListener(appearanceChangeEvent, updatePrompt)
    return () => window.removeEventListener(appearanceChangeEvent, updatePrompt)
  }, [prompt])

  return resolvedPrompt
}

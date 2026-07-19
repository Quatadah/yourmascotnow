import { Check, Download } from 'lucide-react'
import { useState } from 'react'

import type { Illustration } from '#/data/catalog'
import { getActiveMascotColor } from '#/lib/mascotAppearance'

export function ColorizedSvgDownload({
  illustration,
}: {
  illustration: Illustration
}) {
  const [state, setState] = useState<'idle' | 'done' | 'failed'>('idle')

  if (!illustration.asset) return null

  const downloadColoredSvg = async () => {
    try {
      const response = await fetch(illustration.asset!.vector)
      if (!response.ok) throw new Error('SVG unavailable')

      const source = await response.text()
      const color = getActiveMascotColor()
      const coloredSvg = source.replaceAll('#171916', color)
      const blobUrl = URL.createObjectURL(
        new Blob([coloredSvg], { type: 'image/svg+xml' }),
      )
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `${illustration.slug}-${color.slice(1)}.svg`
      link.click()
      URL.revokeObjectURL(blobUrl)
      setState('done')
      window.setTimeout(() => setState('idle'), 1800)
    } catch {
      setState('failed')
    }
  }

  return (
    <button
      type="button"
      className="action action--secondary"
      onClick={downloadColoredSvg}
    >
      {state === 'done' ? (
        <Check aria-hidden="true" />
      ) : (
        <Download aria-hidden="true" />
      )}
      {state === 'done'
        ? 'Color SVG ready'
        : state === 'failed'
          ? 'Color export failed'
          : 'Current color SVG'}
    </button>
  )
}

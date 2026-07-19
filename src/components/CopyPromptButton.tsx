import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

import { getColorAwarePrompt } from '#/lib/mascotAppearance'

type CopyPromptButtonProps = {
  prompt: string
  compact?: boolean
}

export function CopyPromptButton({
  prompt,
  compact = false,
}: CopyPromptButtonProps) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(getColorAwarePrompt(prompt))
      setState('copied')
      window.setTimeout(() => setState('idle'), 1800)
    } catch {
      setState('failed')
    }
  }

  const label =
    state === 'copied'
      ? 'Prompt copied'
      : state === 'failed'
        ? 'Copy unavailable'
        : 'Copy prompt'

  return (
    <button
      type="button"
      className={`copy-prompt${compact ? ' copy-prompt--compact' : ''}`}
      data-state={state}
      aria-live="polite"
      onClick={copyPrompt}
    >
      {state === 'copied' ? (
        <Check aria-hidden="true" />
      ) : (
        <Copy aria-hidden="true" />
      )}
      {label}
    </button>
  )
}

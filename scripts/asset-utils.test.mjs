import { describe, expect, it } from 'vitest'

import { matchCatalogEntry, slugifyAsset } from './asset-utils.mjs'

const catalog = [
  { id: 1, title: 'Mascot waving hello' },
  { id: 29, title: 'Mascot holding a project card' },
]

describe('asset matching', () => {
  it('matches numeric prefixes', () => {
    expect(matchCatalogEntry('001-any-export-name.png', catalog)?.id).toBe(1)
    expect(matchCatalogEntry('029_mascot.png', catalog)?.id).toBe(29)
  })

  it('matches exact canonical slugs', () => {
    expect(
      matchCatalogEntry('mascot-holding-a-project-card.webp', catalog)?.id,
    ).toBe(29)
  })

  it('does not silently match unknown files', () => {
    expect(matchCatalogEntry('final-export.png', catalog)).toBeNull()
  })

  it('normalizes punctuation into stable slugs', () => {
    expect(slugifyAsset('Before & After — Proof')).toBe('before-after-proof')
  })
})

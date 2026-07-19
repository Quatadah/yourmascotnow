import { describe, expect, it } from 'vitest'

import {
  categories,
  filterIllustrations,
  getIllustration,
  illustrations,
} from './catalog'

describe('illustration catalog', () => {
  it('contains the canonical first 80 entries', () => {
    expect(illustrations).toHaveLength(80)
    expect(illustrations[0]?.id).toBe(1)
    expect(illustrations.at(-1)?.id).toBe(80)
    expect(new Set(illustrations.map((item) => item.id)).size).toBe(80)
    expect(new Set(illustrations.map((item) => item.slug)).size).toBe(80)
  })

  it('keeps the expected category ranges', () => {
    expect(categories.map((category) => category.range)).toEqual([
      '001—016',
      '017—028',
      '029—046',
      '047—080',
    ])
    expect(
      categories.map(
        (category) =>
          illustrations.filter((item) => item.category === category.id).length,
      ),
    ).toEqual([16, 12, 18, 34])
  })

  it('provides a normalized SVG for every illustration', () => {
    expect(
      illustrations.every((item) => item.asset?.vector.endsWith('.svg')),
    ).toBe(true)
  })

  it('provides a photo-to-mascot prompt for every illustration', () => {
    expect(
      illustrations.every(
        (item) =>
          item.prompt.includes(item.title) &&
          item.prompt.includes('uploaded portrait') &&
          item.prompt.length > 500,
      ),
    ).toBe(true)
  })

  it('finds illustrations by canonical slug', () => {
    expect(getIllustration('mascot-waving-hello')?.proofCode).toBe('YM/01/001')
  })

  it('filters by text and category', () => {
    expect(filterIllustrations(illustrations, { q: 'logo' })).toHaveLength(3)
    expect(
      filterIllustrations(illustrations, { category: 'portfolio' }),
    ).toHaveLength(18)
    expect(
      filterIllustrations(illustrations, {
        q: 'project',
        category: 'portfolio',
      }).every((item) => item.category === 'portfolio'),
    ).toBe(true)
  })

  it('filters available assets without assuming the manifest is complete', () => {
    const expected = illustrations.filter((item) => item.available)
    expect(filterIllustrations(illustrations, { available: true })).toEqual(
      expected,
    )
  })
})

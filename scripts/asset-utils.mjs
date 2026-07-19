import path from 'node:path'

export function slugifyAsset(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function matchCatalogEntry(filename, catalog) {
  const base = path.basename(filename, path.extname(filename))
  const numericMatch = base.match(/^0*(\d{1,3})(?:[-_\s]|$)/)

  if (numericMatch) {
    const id = Number(numericMatch[1])
    return catalog.find((entry) => entry.id === id) ?? null
  }

  const normalized = slugifyAsset(base)
  return (
    catalog.find((entry) => slugifyAsset(entry.title) === normalized) ?? null
  )
}

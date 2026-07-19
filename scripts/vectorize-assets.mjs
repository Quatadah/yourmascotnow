import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { writeNormalizedSvg } from './vector-utils.mjs'

const root = process.cwd()
const catalogPath = path.join(root, 'src', 'data', 'catalog.json')
const manifestPath = path.join(root, 'src', 'data', 'assets.generated.json')
const originalDirectory = path.join(root, 'public', 'mascots', 'original')
const vectorDirectory = path.join(root, 'public', 'mascots', 'vector')

const [catalog, manifest] = await Promise.all([
  readJson(catalogPath),
  readJson(manifestPath),
  mkdir(vectorDirectory, { recursive: true }),
])

let vectorized = 0

for (const entry of catalog) {
  const asset = manifest[String(entry.id)]
  if (!asset) continue

  const sourcePath = path.join(originalDirectory, path.basename(asset.original))
  const stem = path.basename(asset.original, path.extname(asset.original))
  const vectorFilename = `${stem}.svg`

  await writeNormalizedSvg(
    sourcePath,
    path.join(vectorDirectory, vectorFilename),
    entry.title,
  )

  asset.vector = `/mascots/vector/${vectorFilename}`
  vectorized += 1
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
console.log(`Vectorized and normalized ${vectorized} illustrations.`)

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'))
}

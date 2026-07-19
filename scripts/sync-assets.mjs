import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import sharp from 'sharp'

import { matchCatalogEntry, slugifyAsset } from './asset-utils.mjs'

const root = process.cwd()
const incomingDirectory = path.join(root, 'assets', 'incoming')
const originalDirectory = path.join(root, 'public', 'mascots', 'original')
const previewDirectory = path.join(root, 'public', 'mascots', 'preview')
const catalogPath = path.join(root, 'src', 'data', 'catalog.json')
const manifestPath = path.join(root, 'src', 'data', 'assets.generated.json')
const supportedExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp'])

await Promise.all([
  mkdir(incomingDirectory, { recursive: true }),
  mkdir(originalDirectory, { recursive: true }),
  mkdir(previewDirectory, { recursive: true }),
])

const [catalog, currentManifest, filenames] = await Promise.all([
  readJson(catalogPath),
  readJson(manifestPath),
  readdir(incomingDirectory),
])

const imageFiles = filenames.filter((filename) =>
  supportedExtensions.has(path.extname(filename).toLowerCase()),
)

if (imageFiles.length === 0) {
  console.log(
    'No incoming image files found; the current asset manifest is unchanged.',
  )
  process.exit(0)
}

const matches = new Map()
const unmatched = []

for (const filename of imageFiles) {
  const entry = matchCatalogEntry(filename, catalog)

  if (!entry) {
    unmatched.push(filename)
    continue
  }

  if (matches.has(entry.id)) {
    throw new Error(
      `Duplicate asset mapping for ${String(entry.id).padStart(3, '0')}: ${matches.get(entry.id)} and ${filename}`,
    )
  }

  matches.set(entry.id, filename)
}

if (unmatched.length) {
  throw new Error(
    `Unmatched assets:\n${unmatched.map((filename) => `- ${filename}`).join('\n')}\nUse a 001-080 numeric prefix or the exact title slug.`,
  )
}

const nextManifest = { ...currentManifest }

for (const entry of catalog) {
  const filename = matches.get(entry.id)
  if (!filename) continue

  const sourcePath = path.join(incomingDirectory, filename)
  const extension = path
    .extname(filename)
    .toLowerCase()
    .replace('.jpeg', '.jpg')
  const stem = `${String(entry.id).padStart(3, '0')}-${slugifyAsset(entry.title)}`
  const canonicalOriginal = `${stem}${extension}`
  const smallPreview = `${stem}-480.webp`
  const largePreview = `${stem}-960.webp`
  const metadata = await sharp(sourcePath).metadata()

  if (!metadata.width || !metadata.height) {
    throw new Error(`Could not read image dimensions for ${filename}`)
  }

  await Promise.all([
    copyFile(sourcePath, path.join(originalDirectory, canonicalOriginal)),
    sharp(sourcePath)
      .resize({
        width: 480,
        height: 480,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 5 })
      .toFile(path.join(previewDirectory, smallPreview)),
    sharp(sourcePath)
      .resize({
        width: 960,
        height: 960,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 88, effort: 5 })
      .toFile(path.join(previewDirectory, largePreview)),
  ])

  nextManifest[String(entry.id)] = {
    original: `/mascots/original/${canonicalOriginal}`,
    previewSmall: `/mascots/preview/${smallPreview}`,
    previewLarge: `/mascots/preview/${largePreview}`,
    width: metadata.width,
    height: metadata.height,
    extension: extension.slice(1),
  }
}

const orderedManifest = Object.fromEntries(
  Object.entries(nextManifest).sort(
    ([left], [right]) => Number(left) - Number(right),
  ),
)

await writeFile(
  manifestPath,
  `${JSON.stringify(orderedManifest, null, 2)}\n`,
  'utf8',
)
console.log(
  `Synced ${matches.size} illustration asset${matches.size === 1 ? '' : 's'}.`,
)

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'))
}

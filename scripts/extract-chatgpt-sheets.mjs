import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceDirectory = path.join(root, 'assets', 'chatgpt-source')
const outputDirectory = path.join(root, 'assets', 'incoming')

const sheets = [
  {
    file: 'sheet-011-020.png',
    firstId: 11,
    count: 10,
    columns: 3,
    columnStarts: [31, 439, 846],
    rowStarts: [20, 350, 673, 995],
    artHeights: [232, 225, 215, 175],
    cellWidth: 372,
  },
  {
    file: 'sheet-021-030.png',
    firstId: 21,
    count: 10,
    columns: 3,
    columnStarts: [31, 439, 846],
    rowStarts: [20, 357, 690, 998],
    artHeights: [235, 228, 218, 180],
    cellWidth: 372,
  },
  {
    file: 'sheet-031-040.png',
    firstId: 31,
    count: 10,
    columns: 3,
    columnStarts: [31, 439, 846],
    rowStarts: [18, 351, 690, 993],
    artHeights: [234, 228, 218, 180],
    cellWidth: 372,
  },
  {
    file: 'sheet-041-050.png',
    firstId: 41,
    count: 10,
    columns: 3,
    columnStarts: [31, 439, 846],
    rowStarts: [18, 350, 690, 997],
    artHeights: [234, 228, 218, 178],
    cellWidth: 372,
  },
  {
    file: 'sheet-051-080.png',
    firstId: 51,
    count: 30,
    columns: 5,
    columnStarts: [16, 262, 507, 753, 998],
    rowStarts: [18, 228, 440, 665, 864, 1075],
    artHeights: [145, 145, 145, 137, 145, 118],
    cellWidth: 240,
  },
]

const padId = (id) => String(id).padStart(3, '0')

async function extractSheet(sheet) {
  const source = path.join(sourceDirectory, sheet.file)
  const metadata = await sharp(source).metadata()

  if (!metadata.width || !metadata.height) {
    throw new Error(`Could not read dimensions for ${sheet.file}`)
  }

  for (let index = 0; index < sheet.count; index += 1) {
    const column = index % sheet.columns
    const row = Math.floor(index / sheet.columns)
    const horizontalInset = sheet.columns === 5 ? 7 : 10
    const topInset = sheet.columns === 5 ? 2 : 5
    const left = sheet.columnStarts[column] + horizontalInset
    const top = sheet.rowStarts[row] + topInset
    const width = Math.min(
      metadata.width - left,
      sheet.cellWidth - horizontalInset * 2,
    )
    const height = Math.min(
      metadata.height - top,
      sheet.artHeights[row] - topInset,
    )
    const id = sheet.firstId + index
    const target = path.join(outputDirectory, `${padId(id)}.png`)

    let cropped
    try {
      const panel = await sharp(source)
        .extract({ left, top, width, height })
        .flatten({ background: '#ffffff' })
        .png()
        .toBuffer()

      cropped = await sharp(panel)
        .trim({ background: '#ffffff', threshold: 24 })
        .png()
        .toBuffer({ resolveWithObject: true })
    } catch (error) {
      throw new Error(
        `${sheet.file} panel ${id} failed at ${JSON.stringify({ left, top, width, height })}`,
        { cause: error },
      )
    }

    const squareSize = Math.max(cropped.info.width, cropped.info.height)
    const horizontalPadding = squareSize - cropped.info.width
    const verticalPadding = squareSize - cropped.info.height

    const squared = await sharp(cropped.data)
      .extend({
        top: Math.floor(verticalPadding / 2),
        bottom: Math.ceil(verticalPadding / 2),
        left: Math.floor(horizontalPadding / 2),
        right: Math.ceil(horizontalPadding / 2),
        background: '#ffffff',
      })
      .png()
      .toBuffer()

    await sharp(squared)
      .resize(960, 960, {
        fit: 'contain',
        background: '#ffffff',
        withoutEnlargement: false,
      })
      .png({ compressionLevel: 9 })
      .toFile(target)
  }

  return `${sheet.file}: ${sheet.count} panels`
}

await fs.mkdir(outputDirectory, { recursive: true })
const results = []

for (const sheet of sheets) {
  results.push(await extractSheet(sheet))
}

console.log(
  `Extracted ${sheets.reduce((total, sheet) => total + sheet.count, 0)} illustrations.`,
)
for (const result of results) console.log(`- ${result}`)

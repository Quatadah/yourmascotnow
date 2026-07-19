import fs from 'node:fs/promises'

import potrace from 'potrace'
import sharp from 'sharp'

const CANVAS_SIZE = 1200
const SAFE_AREA = 1040

export async function createNormalizedSvg(sourcePath, title) {
  const normalized = await normalizeMonochromeArtwork(sourcePath)
  const svg = await traceBuffer(normalized)

  return svg
    .replace(
      '<svg ',
      `<svg role="img" aria-labelledby="artwork-title" shape-rendering="geometricPrecision" `,
    )
    .replace(
      '>\n\t<path',
      `>\n\t<title id="artwork-title">${escapeXml(title)}</title>\n\t<path`,
    )
}

export async function writeNormalizedSvg(sourcePath, targetPath, title) {
  const svg = await createNormalizedSvg(sourcePath, title)
  await fs.writeFile(targetPath, svg, 'utf8')
}

async function normalizeMonochromeArtwork(sourcePath) {
  const thresholded = await sharp(sourcePath)
    .flatten({ background: '#ffffff' })
    .greyscale()
    .threshold(196)
    .png()
    .toBuffer()

  const trimmed = await sharp(thresholded)
    .trim({ background: '#ffffff', threshold: 2 })
    .png()
    .toBuffer({ resolveWithObject: true })

  const resized = await sharp(trimmed.data)
    .resize({
      width: SAFE_AREA,
      height: SAFE_AREA,
      fit: 'inside',
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: false,
    })
    .png()
    .toBuffer({ resolveWithObject: true })

  const horizontalSpace = CANVAS_SIZE - resized.info.width
  const verticalSpace = CANVAS_SIZE - resized.info.height

  return sharp(resized.data)
    .extend({
      top: Math.floor(verticalSpace / 2),
      bottom: Math.ceil(verticalSpace / 2),
      left: Math.floor(horizontalSpace / 2),
      right: Math.ceil(horizontalSpace / 2),
      background: '#ffffff',
    })
    .png()
    .toBuffer()
}

function traceBuffer(buffer) {
  return new Promise((resolve, reject) => {
    potrace.trace(
      buffer,
      {
        alphaMax: 1,
        background: 'transparent',
        blackOnWhite: true,
        color: '#171916',
        optCurve: true,
        optTolerance: 0.22,
        threshold: 128,
        turdSize: 7,
        turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
      },
      (error, svg) => {
        if (error) reject(error)
        else resolve(svg)
      },
    )
  })
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

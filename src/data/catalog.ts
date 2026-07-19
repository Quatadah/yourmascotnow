import assetSource from './assets.generated.json'
import catalogSource from './catalog.json'

export const categoryIds = [
  'identity',
  'biography',
  'portfolio',
  'development',
] as const

export type CategoryId = (typeof categoryIds)[number]

export type IllustrationAsset = {
  original: string
  previewSmall: string
  previewLarge: string
  vector: string
  width: number
  height: number
  extension: string
}

export type Illustration = {
  id: number
  slug: string
  title: string
  category: CategoryId
  alt: string
  asset: IllustrationAsset | null
  available: boolean
  proofCode: string
  prompt: string
}

export type Category = {
  id: CategoryId
  title: string
  range: string
  description: string
  proofCode: string
}

export const categories: ReadonlyArray<Category> = [
  {
    id: 'identity',
    title: 'Identity',
    range: '001—016',
    description: 'Introductions, signatures, confidence, and character.',
    proofCode: '01',
  },
  {
    id: 'biography',
    title: 'Biography',
    range: '017—028',
    description: 'Journeys, milestones, experience, and personal history.',
    proofCode: '02',
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    range: '029—046',
    description: 'Projects presented, inspected, compared, and launched.',
    proofCode: '03',
  },
  {
    id: 'development',
    title: 'Development',
    range: '047—080',
    description: 'Code, tests, databases, repositories, and deployments.',
    proofCode: '04',
  },
]

const categoryById = new Map(
  categories.map((category) => [category.id, category]),
)
const assetManifest = assetSource as Partial<Record<string, IllustrationAsset>>

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function createMascotPrompt(title: string) {
  return `Create one finished square mascot illustration using both images attached to this message:

• SCENE REFERENCE — the selected illustration titled “${title}”. This image controls the composition and drawing style.
• IDENTITY REFERENCE — my uploaded portrait. This image controls who the mascot looks like.

Before generating, verify that both reference images are attached. If either image is missing, ask me to attach it instead of guessing.

SCENE FIDELITY — Reproduce the scene reference as closely as possible. Keep the same 1:1 framing, crop, character scale, camera angle, pose, gesture, expression, gaze, hand placement, prop design, prop position, silhouette, and negative space. The result must unmistakably depict “${title}”. Do not redesign, simplify, mirror, zoom, add, remove, or rearrange scene elements.

IDENTITY TRANSFER — Replace only the original mascot’s identity with the person in my portrait. Preserve the person’s recognizable face shape and proportions, hairline, hair length and texture, eyebrows, eye shape, nose, lips, ears, facial hair, eyewear, visible age cues, and distinctive accessories. Translate skin-tone and complexion cues sensitively through the illustration’s single-ink linework and negative space. Keep visible body-build cues when the portrait provides them. Do not retain the original mascot’s curls, beard, sunglasses, or other identity traits unless they are also present in my portrait. Do not invent facial hair, eyewear, accessories, or hair that the portrait does not show. If scene and portrait conflict, use the scene reference for pose and composition and the portrait only for identity.

STYLE FIDELITY — Match the reference’s bold hand-drawn marker language exactly: slightly imperfect organic outlines, chunky variable line weight, compact cartoon proportions, flat solid ink shapes, sparse scratchy hatching, and a crisp vector-friendly silhouette. Keep the simple dark T-shirt and any scene-specific clothing shown in the reference. Avoid photorealism, gradients, soft airbrushing, 3D rendering, smooth corporate-vector styling, or added detail. Default to carbon-black ink on a clean white canvas unless a color direction below overrides it.

OUTPUT — Return one high-resolution illustration only. No caption, written words, letters, numbers, logos, watermark, border, mockup, collage, scenery, or decorative background. Keep the complete illustrated subject comfortably inside the square canvas with the same margins as the scene reference.`
}

export const illustrations: ReadonlyArray<Illustration> = catalogSource.map(
  (entry) => {
    const category = entry.category as CategoryId
    const asset = assetManifest[String(entry.id)] ?? null
    const categoryMeta = categoryById.get(category)

    if (!categoryMeta) {
      throw new Error(`Unknown category: ${entry.category}`)
    }

    return {
      id: entry.id,
      slug: slugify(entry.title),
      title: entry.title,
      category,
      alt: `Black-and-white hand-drawn illustration: ${entry.title}.`,
      asset,
      available: asset !== null,
      proofCode: `YM/${categoryMeta.proofCode}/${String(entry.id).padStart(3, '0')}`,
      prompt: createMascotPrompt(entry.title),
    }
  },
)

export function getCategory(id: CategoryId) {
  return categoryById.get(id) as Category
}

export function getIllustration(slug: string) {
  return illustrations.find((illustration) => illustration.slug === slug)
}

export function getAdjacentIllustrations(illustration: Illustration) {
  const index = illustrations.findIndex((item) => item.id === illustration.id)

  return {
    previous: index > 0 ? illustrations[index - 1] : undefined,
    next:
      index < illustrations.length - 1 ? illustrations[index + 1] : undefined,
  }
}

export function filterIllustrations(
  collection: ReadonlyArray<Illustration>,
  filters: { q?: string; category?: CategoryId; available?: boolean },
) {
  const query = filters.q?.trim().toLowerCase() ?? ''

  return collection.filter((illustration) => {
    const matchesQuery =
      !query ||
      illustration.title.toLowerCase().includes(query) ||
      getCategory(illustration.category).title.toLowerCase().includes(query)
    const matchesCategory =
      !filters.category || illustration.category === filters.category
    const matchesAvailability = !filters.available || illustration.available

    return matchesQuery && matchesCategory && matchesAvailability
  })
}

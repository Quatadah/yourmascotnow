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
  return `Use my uploaded portrait as the identity reference and turn me into the character in this scene: “${title}”. Keep my face recognizable—preserve my facial structure, hairstyle, facial hair, skin-tone cues, and distinctive accessories—while translating me into a bold black-and-white hand-drawn marker mascot. Match the reference composition, pose, expression, camera angle, and object placement exactly. Use slightly imperfect organic outlines, solid black shapes, subtle scratchy hatching, and a clean vector-friendly silhouette. Dress the character in a simple black T-shirt so the collection stays visually consistent. One character, one dominant idea, no written words, no logos, no border, and no extra background elements. Center the complete figure with comfortable, even margins on a square white or transparent canvas. Do not copy the original mascot’s facial identity; replace it with mine.`
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

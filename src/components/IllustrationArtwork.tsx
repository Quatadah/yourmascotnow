import type { Illustration } from '#/data/catalog'

type IllustrationArtworkProps = {
  illustration: Illustration
  eager?: boolean
}

export function IllustrationArtwork({
  illustration,
  eager = false,
}: IllustrationArtworkProps) {
  if (illustration.asset) {
    return (
      <picture className="artwork-picture">
        <source
          srcSet={`${illustration.asset.previewSmall} 480w, ${illustration.asset.previewLarge} 960w`}
          type="image/webp"
        />
        <img
          src={illustration.asset.previewLarge}
          alt={illustration.alt}
          width={illustration.asset.width}
          height={illustration.asset.height}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
        />
      </picture>
    )
  }

  return (
    <div
      className="artwork-placeholder"
      role="img"
      aria-label={`Artwork pending for ${illustration.title}`}
    >
      <svg viewBox="0 0 420 420" aria-hidden="true">
        <path
          className="proof-line"
          d="M45 74h42M66 53v42M333 74h42M354 53v42"
        />
        <path
          className="ink-light"
          d="M142 129c18-54 135-65 153 18 8 40-4 97-34 117-37 25-95 12-116-23-21-34-19-76-3-112Z"
        />
        <path
          className="ink-heavy"
          d="M145 144c8-50 45-76 85-72 42 5 68 26 72 67-26-13-51-17-82-12-28 4-49 15-75 17Z"
        />
        <path
          className="ink-heavy"
          d="M159 183h60c-2 32-12 52-30 52s-30-20-30-52Zm68 0h60c-2 32-12 52-30 52s-28-20-30-52Z"
        />
        <path className="ink-light" d="M218 196h10M179 263c22 22 70 23 91-2" />
        <path
          className="ink-heavy"
          d="M150 249c20 56 43 73 79 73 35 0 61-21 76-75-18 18-38 32-77 32-37 0-58-11-78-30Z"
        />
        <path
          className="ink-heavy"
          d="M110 390c10-63 51-89 119-89 69 0 107 29 117 89Z"
        />
        <path
          className="proof-line proof-scribble"
          d="M108 346c28 16 63 19 102 12m43-8c25-4 44-11 57-24"
        />
      </svg>
      <span>Awaiting original artwork</span>
    </div>
  )
}

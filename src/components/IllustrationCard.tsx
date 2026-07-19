import { ArrowUpRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import type { Illustration } from '#/data/catalog'
import { getCategory } from '#/data/catalog'
import { CopyPromptButton } from './CopyPromptButton'
import { IllustrationArtwork } from './IllustrationArtwork'

type IllustrationCardProps = {
  illustration: Illustration
  featured?: boolean
}

export function IllustrationCard({
  illustration,
  featured = false,
}: IllustrationCardProps) {
  const category = getCategory(illustration.category)

  return (
    <article
      className={`illustration-card${featured ? ' illustration-card--featured' : ''}`}
    >
      <div className="card-artwork-wrap">
        <Link
          to="/illustrations/$slug"
          params={{ slug: illustration.slug }}
          className="card-artwork-link"
          aria-label={`View ${illustration.title}`}
        >
          <div className="card-artwork">
            <IllustrationArtwork illustration={illustration} />
            <span
              className={`availability-dot${illustration.available ? ' is-available' : ''}`}
            >
              {illustration.available ? 'Available' : 'Proof pending'}
            </span>
          </div>
        </Link>
      </div>
      <div className="card-caption">
        <span className="card-proof">{illustration.proofCode}</span>
        <Link
          to="/illustrations/$slug"
          params={{ slug: illustration.slug }}
          className="card-title-link"
        >
          <h2>{illustration.title}</h2>
          <ArrowUpRight className="card-arrow" aria-hidden="true" />
        </Link>
        <span className="card-category">{category.title}</span>
      </div>
      <div className="card-recipe">
        <span>Photo → mascot</span>
        <CopyPromptButton prompt={illustration.prompt} compact />
      </div>
    </article>
  )
}

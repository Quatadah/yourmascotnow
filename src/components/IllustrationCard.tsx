import { ArrowUpRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import type { Illustration } from '#/data/catalog'
import { getCategory } from '#/data/catalog'
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
      <Link
        to="/illustrations/$slug"
        params={{ slug: illustration.slug }}
        className="card-link"
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
        <div className="card-caption">
          <span className="card-proof">{illustration.proofCode}</span>
          <h2>{illustration.title}</h2>
          <span className="card-category">{category.title}</span>
          <ArrowUpRight className="card-arrow" aria-hidden="true" />
        </div>
      </Link>
    </article>
  )
}

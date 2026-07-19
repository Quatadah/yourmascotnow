import { ArrowLeft, ArrowRight, Check, Copy, Download } from 'lucide-react'
import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { useState } from 'react'

import { IllustrationArtwork } from '#/components/IllustrationArtwork'
import { IllustrationCard } from '#/components/IllustrationCard'
import { CopyPromptButton } from '#/components/CopyPromptButton'
import { ColorizedSvgDownload } from '#/components/ColorizedSvgDownload'
import { SiteHeader } from '#/components/SiteHeader'
import {
  getAdjacentIllustrations,
  getCategory,
  getIllustration,
  illustrations,
} from '#/data/catalog'
import { useColorAwarePrompt } from '#/lib/mascotAppearance'

export const Route = createFileRoute('/illustrations/$slug')({
  loader: ({ params }) => {
    const illustration = getIllustration(params.slug)

    if (!illustration) {
      throw notFound()
    }

    return illustration
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}

    const meta = [
      { title: `${loaderData.title} — Your Mascot Now` },
      { name: 'description', content: loaderData.alt },
      { property: 'og:title', content: loaderData.title },
      { property: 'og:description', content: loaderData.alt },
    ]

    if (loaderData.asset) {
      meta.push({
        property: 'og:image',
        content: loaderData.asset.previewLarge,
      })
    }

    return { meta }
  },
  component: IllustrationDetail,
})

function IllustrationDetail() {
  const illustration = Route.useLoaderData()
  const colorAwarePrompt = useColorAwarePrompt(illustration.prompt)
  const category = getCategory(illustration.category)
  const { previous, next } = getAdjacentIllustrations(illustration)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>(
    'idle',
  )
  const related = illustrations
    .filter(
      (item) =>
        item.category === illustration.category && item.id !== illustration.id,
    )
    .slice(0, 3)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopyState('copied')
      window.setTimeout(() => setCopyState('idle'), 1800)
    } catch {
      setCopyState('failed')
    }
  }

  return (
    <div className="site-shell detail-page">
      <SiteHeader />
      <main id="main-content">
        <div className="detail-toolbar">
          <Link
            to="/"
            search={{ q: '', available: false }}
            className="text-link"
          >
            <ArrowLeft aria-hidden="true" /> Back to all illustrations
          </Link>
        </div>

        <article className="detail-layout">
          <div className="detail-proof">
            <IllustrationArtwork illustration={illustration} eager />
          </div>

          <div className="detail-copy">
            <Link
              to="/"
              search={{
                q: '',
                available: false,
                category: illustration.category,
              }}
              className="category-stamp"
            >
              {category.title}
            </Link>
            <h1>{illustration.title}</h1>
            <p>{illustration.alt}</p>

            <dl className="detail-specs">
              <div>
                <dt>Status</dt>
                <dd>
                  {illustration.available
                    ? 'Original available'
                    : 'Awaiting original'}
                </dd>
              </div>
              <div>
                <dt>Series</dt>
                <dd>{category.range}</dd>
              </div>
            </dl>

            <div className="detail-actions">
              {illustration.asset ? (
                <>
                  <a
                    href={illustration.asset.vector}
                    download
                    className="action action--primary"
                  >
                    <Download aria-hidden="true" /> Download SVG
                  </a>
                  <ColorizedSvgDownload illustration={illustration} />
                  <a
                    href={illustration.asset.original}
                    download
                    className="action action--secondary"
                  >
                    <Download aria-hidden="true" /> Source PNG
                  </a>
                </>
              ) : (
                <span className="action action--disabled" aria-disabled="true">
                  <Download aria-hidden="true" /> Original pending
                </span>
              )}
              <button
                type="button"
                className="action action--secondary"
                onClick={copyLink}
              >
                {copyState === 'copied' ? (
                  <Check aria-hidden="true" />
                ) : (
                  <Copy aria-hidden="true" />
                )}
                {copyState === 'copied'
                  ? 'Link copied'
                  : copyState === 'failed'
                    ? 'Copy unavailable'
                    : 'Copy link'}
              </button>
            </div>
            <p className="rights-note">
              Downloading does not grant reuse rights. Artwork remains all
              rights reserved.
            </p>
          </div>
        </article>

        <section className="prompt-panel" aria-labelledby="prompt-title">
          <div className="prompt-panel-intro">
            <span className="prompt-number">Your character recipe</span>
            <h2 id="prompt-title">Recreate this scene with your own photo.</h2>
            <p>
              Upload a clear portrait to ChatGPT Images, then paste this prompt.
              The scene stays consistent while the mascot takes on your
              identity.
            </p>
            <CopyPromptButton prompt={illustration.prompt} />
          </div>
          <div className="prompt-copy-wrap">
            <div className="prompt-copy-label">
              <span>Image prompt</span>
              <span>{colorAwarePrompt.length} characters</span>
            </div>
            <p className="prompt-copy">{colorAwarePrompt}</p>
          </div>
        </section>

        <nav className="proof-pagination" aria-label="Adjacent illustrations">
          {previous ? (
            <Link to="/illustrations/$slug" params={{ slug: previous.slug }}>
              <ArrowLeft aria-hidden="true" />
              <span>
                <small>Previous illustration</small>
                {previous.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to="/illustrations/$slug" params={{ slug: next.slug }}>
              <span>
                <small>Next illustration</small>
                {next.title}
              </span>
              <ArrowRight aria-hidden="true" />
            </Link>
          ) : (
            <span />
          )}
        </nav>

        <section className="related-section" aria-labelledby="related-title">
          <div className="section-heading">
            <span className="proof-kicker">More from {category.title}</span>
            <h2 id="related-title">
              Related {category.title.toLowerCase()} illustrations
            </h2>
          </div>
          <div className="related-grid">
            {related.map((item) => (
              <IllustrationCard key={item.id} illustration={item} />
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <Link to="/" search={{ q: '', available: false }}>
          Your Mascot Now
        </Link>
        <p>
          Artwork © {new Date().getFullYear()} Your Mascot Now. All rights
          reserved.
        </p>
      </footer>
    </div>
  )
}

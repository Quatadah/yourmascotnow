import { Search, SlidersHorizontal, X } from 'lucide-react'
import {
  Link,
  createFileRoute,
  stripSearchParams,
  useNavigate,
} from '@tanstack/react-router'
import { useEffect, useMemo, useRef } from 'react'
import { z } from 'zod'

import { IllustrationArtwork } from '#/components/IllustrationArtwork'
import { IllustrationCard } from '#/components/IllustrationCard'
import { CopyPromptButton } from '#/components/CopyPromptButton'
import { SiteHeader } from '#/components/SiteHeader'
import {
  categories,
  categoryIds,
  filterIllustrations,
  getCategory,
  illustrations,
} from '#/data/catalog'

const searchSchema = z.object({
  q: z.string().catch(''),
  category: z.enum(categoryIds).optional().catch(undefined),
  available: z.boolean().catch(false),
})

export const Route = createFileRoute('/')({
  validateSearch: searchSchema,
  search: {
    middlewares: [stripSearchParams({ q: '', available: false })],
  },
  head: () => ({
    meta: [
      { title: 'Your Mascot Now — 80 Hand-drawn Illustrations' },
      {
        name: 'description',
        content:
          'Search and explore a library of 80 black-and-white mascot illustrations.',
      },
    ],
  }),
  component: Home,
})

const categoryLeadIds = new Set([1, 17, 29, 47])

function Home() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const searchInputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(
    () => filterIllustrations(illustrations, search),
    [search],
  )
  const featured = filtered[0] ?? illustrations[0]
  const selectedCategory = search.category
    ? getCategory(search.category)
    : undefined
  const hasFilters = Boolean(search.q || search.category || search.available)

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (
        event.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', focusSearch)
    return () => window.removeEventListener('keydown', focusSearch)
  }, [])

  const clearFilters = () => {
    void navigate({
      search: { q: '', available: false },
      replace: true,
      resetScroll: false,
    })
  }

  return (
    <div className="site-shell home-page">
      <SiteHeader />
      <main id="main-content">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <span className="proof-kicker">
              80 illustrations · SVG + prompt
            </span>
            <h1 id="hero-title">
              Pick an illustration.
              <span>Make the mascot yours.</span>
            </h1>
            <p>
              Choose an illustration, attach it with your portrait, then paste
              its recipe prompt. Its composition and drawing style stay
              consistent while the mascot takes on your recognizable traits.
            </p>
            <ol className="hero-steps" aria-label="How it works">
              <li>
                <span>01</span> Choose an illustration
              </li>
              <li>
                <span>02</span> Attach scene + photo
              </li>
              <li>
                <span>03</span> Paste the prompt
              </li>
            </ol>
            <a href="#catalog" className="action action--primary hero-action">
              Browse illustrations <span aria-hidden="true">↓</span>
            </a>
          </div>

          <div
            className="hero-proof"
            aria-label={`Featured mascot recipe: ${featured.title}`}
          >
            <div className="hero-proof-meta">
              <span>Featured illustration</span>
            </div>
            <IllustrationArtwork illustration={featured} eager />
            <div className="hero-proof-caption">
              <div>
                <strong>{featured.title}</strong>
              </div>
              <CopyPromptButton prompt={featured.prompt} compact />
            </div>
          </div>
        </section>

        <section
          className="catalog-controls"
          id="catalog"
          aria-label="Catalog controls"
        >
          <div className="search-wrap">
            <Search aria-hidden="true" />
            <label htmlFor="catalog-search">Search all 80 illustrations</label>
            <input
              ref={searchInputRef}
              id="catalog-search"
              type="search"
              value={search.q}
              placeholder="Try “project”, “code”, or “logo”"
              onChange={(event) =>
                void navigate({
                  search: (previous) => ({
                    ...previous,
                    q: event.target.value,
                  }),
                  replace: true,
                  resetScroll: false,
                })
              }
            />
            <kbd>/</kbd>
          </div>

          <div className="category-rail" aria-label="Filter by category">
            <Link
              to="/"
              resetScroll={false}
              search={(previous) => ({
                q: previous.q ?? '',
                available: previous.available ?? false,
                category: undefined,
              })}
              className={!search.category ? 'is-active' : undefined}
            >
              All illustrations
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                to="/"
                resetScroll={false}
                search={(previous) => ({
                  q: previous.q ?? '',
                  available: previous.available ?? false,
                  category: category.id,
                })}
                className={
                  search.category === category.id ? 'is-active' : undefined
                }
              >
                {category.title}
              </Link>
            ))}
          </div>

          <div className="filter-summary">
            <div>
              <SlidersHorizontal aria-hidden="true" />
              <span aria-live="polite">
                <strong>{filtered.length}</strong>{' '}
                {filtered.length === 1 ? 'scene' : 'scenes'}
                {selectedCategory ? ` in ${selectedCategory.title}` : ''}
              </span>
            </div>
            <label className="availability-toggle">
              <input
                type="checkbox"
                checked={search.available}
                onChange={(event) =>
                  void navigate({
                    search: (previous) => ({
                      ...previous,
                      available: event.target.checked,
                    }),
                    replace: true,
                    resetScroll: false,
                  })
                }
              />
              <span aria-hidden="true" />
              Originals available
            </label>
            {hasFilters ? (
              <button
                type="button"
                className="clear-filter"
                onClick={clearFilters}
              >
                <X aria-hidden="true" /> Clear
              </button>
            ) : null}
          </div>
        </section>

        {filtered.length ? (
          <section className="catalog-grid" aria-label="Illustration catalog">
            {filtered.map((illustration) => (
              <IllustrationCard
                key={illustration.id}
                illustration={illustration}
                featured={categoryLeadIds.has(illustration.id)}
              />
            ))}
          </section>
        ) : (
          <section className="empty-results" aria-live="polite">
            <h2>No scene matches that search.</h2>
            <p>
              Try a broader phrase, another category, or include artwork still
              awaiting its original.
            </p>
            <button
              type="button"
              className="action action--primary"
              onClick={clearFilters}
            >
              Show all 80
            </button>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <div>
          <strong>Your Mascot Now</strong>
          <span>First edition · 80 illustrations</span>
        </div>
        <p>
          Artwork © {new Date().getFullYear()} Your Mascot Now. All rights
          reserved.
        </p>
      </footer>
    </div>
  )
}

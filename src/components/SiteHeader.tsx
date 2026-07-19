import { Link } from '@tanstack/react-router'

import { categories } from '#/data/catalog'

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link
        to="/"
        search={{ q: '', available: false }}
        className="wordmark"
        aria-label="Your Mascot Now home"
      >
        <span className="wordmark-mark" aria-hidden="true">
          YMN
        </span>
        <span>Your Mascot Now</span>
      </Link>
      <nav className="header-nav" aria-label="Catalog categories">
        {categories.map((category) => (
          <Link
            key={category.id}
            to="/"
            search={{ q: '', available: false, category: category.id }}
            activeOptions={{ exact: true, includeSearch: false }}
          >
            {category.title}
          </Link>
        ))}
      </nav>
      <Link
        to="/"
        search={{ q: '', available: false }}
        className="header-index"
      >
        Browse 001—080
      </Link>
    </header>
  )
}

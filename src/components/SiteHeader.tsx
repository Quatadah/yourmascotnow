import { Link } from '@tanstack/react-router'

import { categories } from '#/data/catalog'
import { MascotColorPicker } from './MascotColorPicker'
import { ThemeToggle } from './ThemeToggle'

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
      <div className="header-tools">
        <span className="header-index">80 scenes</span>
        <MascotColorPicker />
        <ThemeToggle />
      </div>
    </header>
  )
}

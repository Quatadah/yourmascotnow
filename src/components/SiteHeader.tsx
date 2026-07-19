import { Link } from '@tanstack/react-router'

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
      <div className="header-tools">
        <MascotColorPicker />
        <ThemeToggle />
      </div>
    </header>
  )
}

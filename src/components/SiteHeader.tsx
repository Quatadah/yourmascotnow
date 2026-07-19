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
        <img
          className="wordmark-mark"
          src="/brand/mascot-mark-64.png"
          width="64"
          height="64"
          alt=""
          aria-hidden="true"
        />
        <span>Your Mascot Now</span>
      </Link>
      <div className="header-tools">
        <MascotColorPicker />
        <ThemeToggle />
      </div>
    </header>
  )
}

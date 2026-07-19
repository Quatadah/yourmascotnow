import '@fontsource/knewave/latin-400.css'
import '@fontsource/atkinson-hyperlegible-next/latin-400.css'
import '@fontsource/atkinson-hyperlegible-next/latin-700.css'
import '@fontsource-variable/commissioner/wght.css'

import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'

import { SiteHeader } from '#/components/SiteHeader'
import appCss from '../styles.css?url'

const themeBootScript = `(function(){try{var t=localStorage.getItem('ymn-theme');var d=t==='dark'||t==='light'?t:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=d;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',d==='dark'?'#111613':'#eef1ec')}catch(e){document.documentElement.dataset.theme='light'}})()`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Your Mascot Now — Illustration Library' },
      {
        name: 'description',
        content:
          'Browse 80 hand-drawn mascot illustrations for identity, biography, portfolio, and development.',
      },
      { name: 'theme-color', content: '#e7ede6' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Your Mascot Now' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    ],
  }),
  notFoundComponent: NotFoundPage,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to catalog
        </a>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function NotFoundPage() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main id="main-content" className="not-found-page">
        <span className="proof-kicker">YM/ERR/404</span>
        <div className="not-found-mark" aria-hidden="true">
          ?
        </div>
        <h1>This proof is off the desk.</h1>
        <p>The page may have moved, or the catalog code was never assigned.</p>
        <Link
          to="/"
          search={{ q: '', available: false }}
          className="action action--primary"
        >
          Return to all 80
        </Link>
      </main>
    </div>
  )
}

import '@fontsource/atkinson-hyperlegible-next/latin-400.css'
import '@fontsource/atkinson-hyperlegible-next/latin-700.css'
import '@fontsource-variable/bricolage-grotesque/wght.css'
import '@fontsource-variable/commissioner/wght.css'

import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'

import { SiteHeader } from '#/components/SiteHeader'
import appCss from '../styles.css?url'

const themeBootScript = `(function(){try{var r=document.documentElement,t=localStorage.getItem('ymn-theme'),d=t==='dark'||t==='light'?t:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');r.dataset.theme=d;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',d==='dark'?'#111111':'#f2f2f2');var c=localStorage.getItem('ymn-mascot-color');if(/^#[0-9a-f]{6}$/i.test(c||'')){var n=parseInt(c.slice(1),16),x=(.2126*(n>>16&255)+.7152*(n>>8&255)+.0722*(n&255))/255;r.dataset.mascotColor='custom';r.style.setProperty('--mascot-ink-user',c);r.style.setProperty('--art-paper-user',x>.56?'#111111':'#ffffff')}}catch(e){document.documentElement.dataset.theme='light'}})()`

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
      { name: 'theme-color', content: '#f2f2f2' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Your Mascot Now' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'icon',
        href: '/brand/mascot-mark-64.png',
        type: 'image/png',
        sizes: '64x64',
      },
      {
        rel: 'apple-touch-icon',
        href: '/brand/apple-touch-icon.png',
        sizes: '180x180',
      },
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
        <div className="not-found-mark" aria-hidden="true">
          ?
        </div>
        <h1>Illustration not found.</h1>
        <p>The page may have moved or the address may be incorrect.</p>
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

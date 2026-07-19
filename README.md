# Your Mascot Now

A public, searchable proof desk for the first 80 hand-drawn Your Mascot Now illustrations. The collection covers identity, biography, portfolio, and software development, with a dedicated page and shareable URL for every proof.

## Stack

- TanStack Start and TanStack Router
- React 19 and TypeScript
- Vite with static prerendering
- Vitest, Playwright, and axe-core
- Self-hosted Knewave, Atkinson Hyperlegible Next, and Commissioner fonts

## Local development

```bash
pnpm install
pnpm dev
```

The app runs at `http://localhost:3000`.

## Illustration assets

The catalog contains all 80 illustrations recovered from the original ChatGPT image conversation. Items 001–010 are the individual 1254px exports. Later responses were delivered as contact sheets, so their original sheets are preserved in `assets/chatgpt-source/` and reproducibly separated into individual, title-free 960px PNGs by `scripts/extract-chatgpt-sheets.mjs`.

To rebuild the extracted set and responsive gallery assets:

```bash
pnpm assets:extract-chatgpt
pnpm assets:sync
```

The contact-sheet extractor uses reviewed, sheet-specific coordinates instead of directory order or image recognition. The embedded labels remain in the preserved source sheets; website titles come from the accessible catalog data.

For future illustration exports:

1. Put each exported PNG, JPEG, or WebP in `assets/incoming/`.
2. Give the file either a `001`–`080` numeric prefix or the exact title slug.
3. Run `pnpm assets:sync`.

Accepted examples:

```text
001-any-export-name.png
029_mascot-project-card.jpg
mascot-holding-a-code-window.webp
```

The synchronizer never maps by directory order. It rejects unknown names and duplicate mappings, preserves a canonically named original in `public/mascots/original/`, and generates 480px and 960px WebP previews in `public/mascots/preview/`. The generated manifest records intrinsic dimensions so the gallery can reserve image space before files load.

## Commands

```bash
pnpm assets:extract-chatgpt # Rebuild items 011–080 from preserved source sheets
pnpm assets:sync  # Import supplied artwork and generate responsive previews
pnpm typecheck    # TypeScript validation
pnpm lint         # ESLint
pnpm check        # Prettier verification
pnpm test:unit    # Catalog and asset-matching tests
pnpm test:e2e     # Chromium desktop/mobile and accessibility tests
pnpm test         # Full automated test suite
pnpm build        # Production build and static prerender
```

The production build prerenders the catalog and linked illustration detail routes. A canonical deployment origin and sitemap are intentionally omitted until a hosting destination is selected.

## Catalog maintenance

Canonical illustration titles live in `src/data/catalog.json`. IDs are permanent and ordered. Do not renumber an existing entry after artwork has been mapped; its proof code, asset filename, and public URL depend on that identity.

The first edition contains:

- Identity: 001–016
- Biography: 017–028
- Portfolio: 029–046
- Development: 047–080

## Rights

Artwork © Your Mascot Now. All rights reserved. Downloading an original does not grant permission to reproduce, redistribute, or adapt it. The public availability of this repository does not create an artwork license.

# Micuapi Docs Clone QA

Source: https://docs.micuapi.ai/
Date: 2026-06-17
Local build: http://127.0.0.1:3020/

## Scope

The clone is now driven from the live VitePress-rendered source HTML instead of hand-written summaries. The sync script captures 34 source routes, preserves the main article HTML/TOC/home sections, and downloads the referenced local image assets into `static/img`.

Primary implementation files:

- `scripts/sync-micu-vitepress.mjs`
- `src/data/micuPages.ts`
- `src/components/MicuDocPage/index.tsx`
- `src/theme/Root.tsx`
- `src/css/custom.css`
- `docusaurus.config.ts`
- generated `docs/*.mdx`
- downloaded `static/img/**`

## Verification

- `corepack pnpm typecheck`: passed
- `corepack pnpm build`: passed
- Local root request: `200`
- Local route scan: 34 routes, 0 bad routes
- Referenced image scan: 35 page image references, 0 bad assets

## Screenshot Evidence

All screenshots live in `validation-screenshots/micu-clone`.

Source truth:

- `source-home-desktop-light.png`
- `source-home-desktop-dark.png`
- `source-home-tablet-light.png`
- `source-home-tablet-dark.png`
- `source-home-mobile-light.png`
- `source-home-mobile-dark.png`
- `source-doc-claude-code-desktop-light.png`
- `source-doc-cc-switch-table-desktop-light.png`
- `source-mobile-menu.png`

Local implementation:

- `local-home-desktop-light.png`
- `local-home-desktop-dark.png`
- `local-home-tablet-light.png`
- `local-home-tablet-dark.png`
- `local-home-mobile-light.png`
- `local-home-mobile-dark.png`
- `local-doc-claude-code-desktop-light.png`
- `local-doc-cc-switch-table-desktop-light.png`
- `local-mobile-menu.png`
- `local-search-desktop-dark-filtered.png`

Comparison captures:

- `compare-home-desktop-light.png`
- `compare-home-desktop-dark.png`
- `compare-home-tablet-light.png`
- `compare-home-tablet-dark.png`
- `compare-home-mobile-light.png`
- `compare-home-mobile-dark.png`
- `compare-doc-claude-code-desktop-light.png`
- `compare-doc-cc-switch-table-desktop-light.png`

## Visual Diff Notes

Measured full-viewport home diffs:

- Desktop light: MAE 6.03, RMS 22.00
- Desktop dark: MAE 8.69, RMS 27.63
- Tablet light: MAE 16.87, RMS 44.41
- Tablet dark: MAE 20.62, RMS 49.03
- Mobile light: MAE 11.67, RMS 34.39
- Mobile dark: MAE 14.65, RMS 38.46

Measured representative doc diffs:

- `/claude-code` desktop light: MAE 8.51, RMS 25.67
- `/cc-switch` table section desktop light: MAE 8.10, RMS 23.19

Mobile menu final structural checks:

- Viewport: 390 x 844
- Document width: 390, no horizontal overflow
- Sidebar: full width, y=64, height=780
- Menu panel: x=51, width=288
- Appearance row: x=51, y=448, width=288, height=48
- Sidebar duplicate search: hidden
- Sidebar back panel: hidden
- Expanded hamburger: rendered as close `x`

## Known Residual Differences

- Search is a local overlay over the 34 synced pages, not the hosted Algolia/DocSearch backend. The source search modal did not open reliably in the controlled browser session, so this is implemented as equivalent local navigation behavior rather than a byte-for-byte DocSearch clone.
- The tablet top-nav intrinsic width differs slightly from source behavior. The source itself overflows around 913 px; local measures about 920 px in the same breakpoint family.
- The runtime is still Docusaurus under the hood, reshaped to VitePress visual structure with CSS and synced HTML. Visible layout, content hierarchy, theme states, sidebars, TOC, mobile drawer, home cards, docs typography, code blocks, tables, images, and navigation were matched, but framework DOM class names are not identical.

final result: passed

## Current Run - 2026-06-17 19:53 +08:00

Local URL: http://127.0.0.1:3020/

Additional implementation refinements in this run:

- Matched mobile navbar height/background and search button sizing.
- Matched mobile home horizontal spacing and hero wrapping.
- Restored mobile menu overlay stacking, opaque panel background, and Appearance row.
- Added reproducible Playwright QA script: `scripts/micu-qa.spec.ts`.

Verification:

- `corepack pnpm typecheck`: passed
- `corepack pnpm build`: passed
- `npx --package @playwright/test playwright test scripts/micu-qa.spec.ts --workers=1 --reporter=list`: passed, 2 tests
- Local root request: `200`

Current screenshots live in `validation-screenshots/current-run`:

- Home baselines: `source-home-{desktop,tablet,mobile}-{light,dark}.png`
- Local home: `local-home-{desktop,tablet,mobile}-{light,dark}.png`
- Search: `source-search-desktop-light.png`, `local-search-desktop-light.png`
- Mobile menu: `source-mobile-menu.png`, `local-mobile-menu.png`
- Representative docs: `source-doc-claude-code-desktop-light.png`, `local-doc-claude-code-desktop-light.png`, `source-doc-cc-switch-table-desktop-light.png`, `local-doc-cc-switch-table-desktop-light.png`

Final home screenshot diff metrics:

- Desktop light: MAE 6.69, RMS 32.02
- Desktop dark: MAE 7.97, RMS 34.12
- Tablet light: MAE 14.38, RMS 47.34
- Tablet dark: MAE 17.24, RMS 50.49
- Mobile light: MAE 11.67, RMS 39.43
- Mobile dark: MAE 17.22, RMS 43.30

Residual differences:

- Search uses a local in-site index over synced pages instead of the hosted VitePress local-search implementation; visual/open state is close, but shortcut footer/result styling is not byte-identical.
- The site still runs on Docusaurus, reshaped to VitePress visual structure. Visible content, layout, sidebars, TOC, theme states, mobile drawer, code blocks, tables, and images are matched closely, but framework DOM/classes are not identical.
- Small font rasterization and weight differences remain, especially in mobile menu Appearance text and tablet screenshots.

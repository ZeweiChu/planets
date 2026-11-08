# 站在别的星球上 (Standing on Other Worlds)

A weekend science project: an interactive site about the surfaces, atmospheres and gravity of the eight planets, with real spacecraft photos.

- Planet data: NASA NSSDC Planetary Fact Sheets
- Photos: NASA/JPL Photojournal, NASA NSSDC (Venera 13), NASA SVS (Blue Marble); each photo's credit and ID is shown on the page

The Mars field visit adds a small, walkable 3D environment with rocks, wind-shaped sand, three observations, and keyboard/touch controls. Both experiences support the existing ten languages.

## Local development

Install [Bun](https://bun.sh/) 1.3.11 or newer, then:

```sh
bun install --frozen-lockfile
bun run dev
```

- Planet explorer: http://127.0.0.1:5173/planets/
- Mars: http://127.0.0.1:5173/planets/mars/
- Add `?lang=en` or another supported locale to share a language selection.

Use the development server instead of opening `index.html` directly. Vite builds the JavaScript modules and serves static assets from `public/`.

## Checks

```sh
bun run test
bun run build
bun run test:e2e
```

The browser suite uses installed Chrome locally. To use Playwright's Chromium instead:

```sh
bun --bun playwright install chromium
PLAYWRIGHT_BUNDLED=1 bun run test:e2e
```

Playwright checks the production build on port 4173 in desktop and touch-device emulation. It covers walking, look-around, landmark visits, language persistence, all 80 planet/language combinations, reduced motion, and WebGL fallback/context loss. Physical-phone performance and native Safari are separate manual checks.

## GitHub Pages deployment

The application remains a **static site**. `bun run build` generates `dist/`; no backend or account is required. Three.js executes in the visitor's browser and is loaded only on the Mars page. The Vite base path is `/planets/`.

**Before merging the build-system migration:** change **Settings → Pages → Build and deployment → Source** from **Deploy from a branch** to **GitHub Actions**. Do this as part of the approved release, not while reviewing the feature branch. Serving the new source files directly from `main` would not work.

`.github/workflows/site.yml` runs unit tests, type checking, a production build, and desktop/mobile browser tests for pull requests. Only `main` can upload and deploy the Pages artifact, after checks pass. A feature PR does not publish anything.

After the approved merge, verify both `/planets/` and `/planets/mars/`, including a direct refresh of the Mars URL. Keep Pages on the Actions source for future releases.

## Design and architecture

- [Design direction](DESIGN.md)
- [Mars v1 architecture, scope, and sources](docs/mars-v1.md)

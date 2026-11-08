# Mars field visit v1

## Scope

A bounded 80 × 80 meter walking area at 1.65 m eye height, three discoverable landmarks, desktop/touch controls, ten languages, and a return to the Mars overview. There is no gravity experiment, backend, account system, whole-planet surface, or exact landing-site reconstruction.

## Structure

Vite builds two HTML entry points. The overview imports its original language dictionaries and shared planet data. The Mars page imports its own interface messages and dynamically loads its scene; the overview never requests the Three.js chunk.

| File | Responsibility |
| --- | --- |
| `index.html`, `src/overview/` | Existing planet explorer, extracted from inline script/styles; Mars entry link |
| `src/shared/planets.js` | Language-independent planet and photograph metadata |
| `src/shared/locale.ts` | Supported locales, browser matching, safe preference storage |
| `mars/index.html`, `src/mars/main.ts` | Accessible HTML interface, application state, locale selection, scene lifecycle |
| `src/mars/messages.ts` | Translated interface and observations |
| `src/mars/world.ts` | Deterministic ground height, movement bounds, obstacle solver, landmark locations |
| `src/mars/scene.ts` | Three.js environment, input, camera, navigation, rendering, resource disposal |
| `public/photos/` | Original photos, unchanged; Vite copies them to `dist/photos/` |

The scene owns frame-by-frame camera state. HTML owns panels, locale, quality selection and discovery text. Language changes do not recreate the renderer or move the camera.

## Rendering and movement

One meter is one scene unit. The dense inner terrain extends to ±52 m, beyond the ±40 m walking limits. Its edge blends to the coarse outer ground, while concentric terrain rings provide a horizon in every direction. Ground and rock details are deterministic procedural geometry, vertex colors and shaders; no large scene textures or models must download.

Large rocks use circular collision bounds. Movement is resolved in short substeps and slides along obstacles; it is not a full rigid-body simulation. The camera follows the same analytic height function used to generate the ground. Click-to-walk targets must be inside the field, within 25 m, and clear of a collision bound. Obstructed movement stops rather than inventing a path through rocks. Direct landmark travel places the visitor at a clear, predefined approach.

High detail caps pixel ratio at 1.6 and enables directional shadows. Light detail caps it at 1 and disables those shadows; touch devices start in Light mode. Instanced rocks keep draw calls low. Animation stops when the tab is hidden. Input resets on blur, panel opening and visibility changes. On page exit, listeners, animation, geometry, materials, textures, instances and shadow resources are disposed; a back/forward-cache restore initializes a fresh scene.

WebGL2 is required for the 3D scene. Initialization failure or context loss shows a real NASA panorama and all observations. A reload retries 3D. JavaScript-disabled visitors also get the panorama and a return link.

## Sources and provenance

- [NASA Mars facts](https://science.nasa.gov/mars/facts/): broad geology and surface context.
- [Sedimentary Signs of a Martian Lakebed](https://science.nasa.gov/resource/sedimentary-signs-of-a-martian-lakebed-2/): observed layering in real Mars rocks.
- [Wind at Work](https://science.nasa.gov/resource/wind-at-work/): wind, sand and ripples.
- [Mastcam-Z's First 360-Degree Panorama](https://science.nasa.gov/resource/mastcam-zs-first-360-degree-panorama/): existing fallback image, PIA24264, credited to NASA/JPL-Caltech/ASU/MSSS.

The generated environment is an illustration, not a photogrammetric reconstruction. The observations explain general features and explicitly avoid treating the invented rocks as evidence about a real location. Translations are provided in all ten existing locales; native-speaker review remains useful for publication-quality wording.

## Validation

Unit tests check movement limits, collision tunneling/sliding, height continuity, safe landmark approaches, locale matching and translation completeness. Playwright exercises the production bundle on desktop Chrome and a touch-device viewport, including the original eight planets in all ten languages. Browser coverage includes direct routes/refresh, controls, each landmark, locale changes without camera resets, returning home, reduced motion, quality switching, unavailable WebGL and context loss.

Visual checks cover desktop, phone portrait, Arabic layout, terrain close-ups and fallback. Phone emulation is not a measurement of physical-phone frame rate. Native Safari/iOS and low-end GPU performance should be checked on devices before claiming universal support. Vite reports a size warning for the isolated Three.js chunk (about 133 KB gzip); it does not load on the overview.

## Release

See the README for the Pages source migration. The feature branch and PR are for review only; merging and publication require a separate approval. Future extensions should build on feedback about this walking experience before adding a generic planet engine.

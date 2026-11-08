# Standing on Other Worlds

Mars is a quiet field visit: a landscape first, with optional observations. It should feel spacious and invite looking around. V1 has no scoring, survival tasks, gravity experiment, audio, or time-of-day controls.

## Visual direction

- Dusty ochre ground, mineral-brown rocks, cream text, charcoal translucent controls.
- Source Serif 4 for place names and headings; IBM Plex Sans for readable interface text; IBM Plex Mono for small field labels and navigation hints. System fonts cover scripts absent from these families.
- Arabic and Hindi labels use the body font stack instead of monospace fallbacks. Labels and headings retain normal letter spacing to preserve script shaping.
- Body and observation text is 16px. Small labels may be 10–14px; they supplement accessible control names and do not carry long explanations.
- The scene fills the viewport. Initial typography sits to one side so the horizon remains visible. Once walking begins, most introductory text disappears.
- Controls use restrained borders and 3–4px corners. The circular inset map is schematic, with a player arrow and three landmarks. It is not an orbital map or surveyed topography.
- HTML overlays remain independent of the renderer. Prefer contrast and legibility over glass effects.

## Interaction

- Drag to look, WASD to walk, arrow keys to move/turn. Click or tap nearby ground to walk toward it. Touch devices also have press-and-hold movement buttons.
- A landmark observation is offered nearby, never opened automatically. The places panel provides keyboard-accessible descriptions and direct jumps to each landmark.
- No head bob or automatic camera flight. Reduced-motion users move immediately when selecting ground; direct landmark travel is immediate for everyone.
- Every panel can be dismissed with Escape or its labeled close button. Movement pauses behind panels and when the page loses focus.
- Always retain an easy route back to the selected Mars overview.

## Scientific boundaries

The scene is a procedural artistic interpretation inspired by Mars imagery. Its precise rocks, terrain, distances between landmarks, illumination and sky colors are not measurements of a real site. Keep that disclosure discoverable from the main view. Distinguish the real NASA fallback panorama from the generated scene, and link observations to source material.

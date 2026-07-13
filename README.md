# Ashleigh Darnell — Portfolio Site

SvelteKit (Svelte 5) + Tailwind CSS v4. Currently in **dev mode**: structure, layout, and color are in place; bracketed `[placeholder]` copy marks everywhere real content will go.

## Run it

```bash
npm install
npm run dev
```

## Deploy (Cloudflare)

Configured with `@sveltejs/adapter-cloudflare` and `wrangler.jsonc`.

**Git integration (Cloudflare Pages / Workers):** connect this repo and use:
- Build command: `npm run build`
- Build output directory: `.svelte-kit/cloudflare`
- Compatibility flag: `nodejs_als` (already set in `wrangler.jsonc`)

**CLI:**

```bash
npm run deploy
```

## Structure

| Route | Purpose |
| --- | --- |
| `/` | Home — hero, credibility strip, doors into both portfolios, about teaser, contact CTA |
| `/photography` | Portfolio no. 1 — filterable masonry gallery, booking CTA |
| `/social` | Portfolio no. 2 — stats strip, phone-ratio content tiles, case study list |
| `/about` | Bio, fun facts grid |
| `/contact` | Contact info + form (not wired to a backend yet) |

## Dev-mode conventions

- **Design tokens** live in `src/app.css` under `@theme`:
  - Neutrals: `paper` (cool sage-white), `ink` (deep pine green), `muted`, `line`, `mist` — a cool pine-leaning base that lets the warm accents pop.
  - Vivid accents: `coral`, `marigold`, `teal`, `violet` — used for buttons, icons, underlines, and big CTA moments. Photography leans coral, social media leans teal, about leans marigold, contact leans violet.
  - Soft tints: `blush`, `butter`, `mint`, `lilac` — one per accent, used for section and card backgrounds.
  - Font stacks (`--font-display`, `--font-body`) are still placeholders.
- Wavy line work: `WavyEdge.svelte` (the header's undulating bottom edge), `Wave.svelte` (undulating section-edge dividers, fill = the tinted section's background; also gives the footer its wavy top), and `Squiggle.svelte` (small centered accent divider replacing straight hairlines). Nav and footer links carry bold always-on underlines in their destination's accent color.
- **`Placeholder.svelte`** renders crossed-out image frames with a label, aspect ratio, and optional `tint`; replace with real images later.
- **`Icon.svelte`** is a tiny inline SVG set (thin 1.5px strokes) — add names as needed, no icon library.
- Copy in `[brackets]` is intentionally unwritten.

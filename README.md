# Ashleigh Darnell — Portfolio Site

SvelteKit (Svelte 5) + Tailwind CSS v4. Currently in **dev mode**: structure, layout, and color are in place; bracketed `[placeholder]` copy marks everywhere real content will go.

## Run it

```bash
npm install
npm run dev
```

## Deploy (Cloudflare)

Configured with `@sveltejs/adapter-cloudflare` and `wrangler.jsonc`.

**Git integration (Cloudflare Pages):** connect this repo. `wrangler.jsonc` sets the output dir to `.svelte-kit/cloudflare` via `pages_build_output_dir`.

If you configure build settings in the dashboard instead:
- Build command: `npm run build`
- Build output directory: `.svelte-kit/cloudflare`

**CLI:**

```bash
npm run deploy
```

## Firebase setup

The site uses Firebase Authentication and Cloud Firestore. Before using the admin:

1. In the Firebase Console for `ashleighdarnell`, create a Firestore database.
2. Under Authentication → Sign-in method, enable Email/Password and Google.
3. Under Authentication → Users, create or sign in once with each administrator account and copy its UID.
4. In Firestore, create an `admins` collection with one document per administrator. The document ID must exactly match that user’s Authentication UID; add a descriptive `email` field.
5. Deploy the included Firestore security rules:

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules --project ashleighdarnell
```

On the first authenticated admin visit, an empty Firestore database is seeded from the site's current local/default content. After that, Firestore is authoritative. Public visitors can read published content and create newsletter subscriptions; all admin writes require authentication.

## Cloudflare Images setup

The Content → Image archive screen uses Cloudflare Images for bulk uploads, URL imports, image sets, and site-wide replacements. Add these variables in the Cloudflare Pages project for both production and preview:

- `CLOUDFLARE_IMAGES_API_TOKEN` — encrypted secret with Account → Cloudflare Images → Edit permission
- `CLOUDFLARE_ACCOUNT_ID` — the Cloudflare account ID
- `CLOUDFLARE_IMAGES_ACCOUNT_HASH` — the Images delivery hash

For local development, copy `.env.example` to `.env` and fill in the same values. Images uploaded by this site receive an `ashleighdarnell/` custom ID and `site: ashleighdarnell` metadata, so images belonging to other projects in the same Cloudflare account do not appear in this archive.

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

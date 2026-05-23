# Lost Endeavours — Technical Documentation

## Overview

The Lost Endeavours website is a **static single-page site** with no framework, no build step, and no backend. It runs entirely in the browser and is hosted for free on GitHub Pages.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Markup | Plain HTML5 | No dependencies, works everywhere |
| Styles | Plain CSS3 (custom properties) | No preprocessor needed, fast to edit |
| Logic | Vanilla JavaScript (ES2020) | No framework, no build step |
| Fonts | Google Fonts (CDN) | Bungee Inline, Creepster, Inter |
| Hosting | GitHub Pages | Free, reliable, deploys on git push |
| Content | JSON files | Editable without touching HTML or JS |

---

## File Structure

```
Website LE/
├── index.html          # All page sections (single page)
├── styles.css          # All visual styles and layout
├── script.js           # All interactivity and content rendering
├── concerts.json       # Show data — edit this to add/remove shows
├── translations.json   # All text strings in EN and DE
├── TECHNICAL.md        # This file
└── assets/
    ├── logo.jpg        # Band logo (used in nav + hero)
    ├── band-1.jpg      # Band photo (About section)
    ├── band-2.jpg      # Band photo (spare, not currently used)
    ├── andy.jpg        # Andy member photo
    ├── gigi.jpg        # Gigi member photo
    └── simon.jpg       # Simon member photo
```

---

## How Each File Works

### `index.html`
The entire site lives in one HTML file with six sections:
- `#hero` — full-screen landing with logo, tagline, and CTA buttons
- `#about` — bio text + band photo
- `#members` — three circular member photo cards
- `#shows` — concert list (populated by `script.js` from `concerts.json`)
- `#contact` — Instagram + booking email cards
- Footer — tagline, copyright year, Instagram icon

Text content is not hardcoded — elements carry a `data-i18n="key"` attribute and `script.js` fills them in from `translations.json`. This powers the EN/DE language toggle.

There is a small inline `<script>` in `<head>` that reads the saved theme from `localStorage` before the page renders. This prevents a flash of dark mode for returning light-mode users.

### `styles.css`
All visual rules in one file. Key design decisions:

- **CSS custom properties** (variables) define the colour palette at the top of the file under `:root`. Light mode overrides them under `:root[data-theme="light"]` — swapping themes is just toggling that attribute on `<html>`.
- **Mobile-first** layout — base styles target small screens, `@media` queries add desktop layout at 768 px and 1024 px.
- **Member photo cards** use `object-fit: cover` to fill a circular container. Per-member CSS variables (`--pos-x`, `--pos-y`, `--img-zoom`, `--img-shift-x`, `--img-shift-y`) control exactly how each photo is cropped without touching the stylesheet.
- **Motion** (star twinkle, glow pulses) is gated behind `@media (prefers-reduced-motion: no-preference)` so users with motion sensitivity are not affected.

### `script.js`
A single self-contained IIFE (no global variables). Responsibilities:

1. **Theme** — reads `localStorage` on load, applies `data-theme` to `<html>`, wires the toggle button.
2. **Language (i18n)** — fetches `translations.json`, detects initial language (`localStorage` → `navigator.language` → EN), walks all `[data-i18n]` elements and sets their text.
3. **Concerts** — fetches `concerts.json`, filters out past dates, sorts ascending, renders the list. Re-renders when language changes so dates format correctly (e.g. "15 Aug 2026" vs "15. Aug. 2026").
4. **Mobile nav** — hamburger menu toggle.
5. **Year** — sets the copyright year in the footer automatically.

### `concerts.json`
Array of show objects. Each entry:

```json
{
  "date": "2026-08-15",       ← required, ISO format YYYY-MM-DD
  "venue": "Sonic Ballroom",  ← required
  "city": "Köln",             ← required
  "country": "DE",            ← required
  "ticketUrl": "https://..."  ← optional; omit if no link
}
```

Past dates are hidden automatically — no cleanup needed after a show passes.

### `translations.json`
All visible text strings for both languages, keyed by dot-notation identifiers:

```json
{
  "en": { "nav.about": "About", "hero.cta_shows": "Upcoming Shows", ... },
  "de": { "nav.about": "Über uns", "hero.cta_shows": "Kommende Konzerte", ... }
}
```

Both `en` and `de` must always have the same set of keys, or missing keys will silently show blank text.

---

## Design System

### Colours

| Variable | Dark mode | Light mode | Usage |
|---|---|---|---|
| `--bg` | `#000000` | `#f5f3ed` | Page background |
| `--surface` | `#0d0d0d` | `#ffffff` | Cards, nav |
| `--accent` | `#39FF14` | `#1a8c10` | Headings, borders, CTAs |
| `--text` | `#e8e8e8` | `#1a1a1a` | Body text |
| `--muted` | `#888888` | `#555555` | Secondary text |

The neon green (`#39FF14`) is unreadable on light backgrounds, so light mode uses a darker forest green (`#1a8c10`) from the same family.

### Typography

| Role | Font | Source |
|---|---|---|
| Hero / section headings | Creepster | Google Fonts |
| Nav brand / subheadings | Bungee Inline | Google Fonts |
| Body / UI | Inter | Google Fonts |

### Breakpoints

| Name | Width | Layout change |
|---|---|---|
| Mobile | < 768 px | Single column, hamburger nav |
| Tablet | ≥ 768 px | Two columns (about section) |
| Desktop | ≥ 1024 px | Full multi-column layouts |

---

## Common Maintenance Tasks

### Add a show
Edit `concerts.json` on GitHub — add an object to the array:
```json
{ "date": "2026-11-01", "venue": "Club Name", "city": "City", "country": "DE" }
```

### Remove a show
Delete its entry from `concerts.json`. (Past shows disappear automatically — no action needed.)

### Update the bio
Edit `translations.json` — change `about.body` under `en` and `de`.

### Replace a member photo
Upload the new image to `assets/` with the same filename (e.g. `andy.jpg`). The site updates immediately.

### Adjust a member photo crop
In `index.html`, find the `<li class="member-card">` for that member and adjust the inline CSS variables:
- `--pos-x` / `--pos-y` — shift the crop point (percentage; only effective when the image overflows in that direction)
- `--img-zoom` — scale the image larger to create overflow in both directions
- `--img-shift-x` / `--img-shift-y` — translate the image within the circle after zoom

### Add a new language
1. Add a new key block to `translations.json` (copy the `en` block, translate all values)
2. Add the language code to `SUPPORTED` in `script.js`
3. Add a `<button>` to the language switcher in `index.html`

### Add a new page section
1. Add a `<section id="new-section">` in `index.html`
2. Add a nav link `<a href="#new-section">` in the `<ul id="nav-menu">`
3. Add translation keys to `translations.json` for any new text
4. Style the section in `styles.css`

---

## Deployment

**Host:** GitHub Pages
**Live URL:** https://lostendeavours.github.io/site/
**Repo:** https://github.com/lostendeavours/site

Deployments are automatic — any commit to the `main` branch triggers a rebuild. Changes are usually live within 60 seconds.

No CI pipeline, no build step, no dependencies to install.

---

## Known Constraints

- **No contact form** — the booking link is a `mailto:` that opens the visitor's email client. A form would require a backend or third-party service (e.g. Formspree).
- **No music embeds** — not yet added; a Spotify or Bandcamp embed can be dropped into a new section when ready.
- **JSON must be valid** — a syntax error in `concerts.json` or `translations.json` silently breaks that feature. Always verify the live site after editing.
- **Google Fonts requires internet** — the site loads fonts from Google's CDN. Offline or on very slow connections, it falls back to system fonts (acceptable).
- **No analytics** — visitor stats are not tracked. Google Analytics or Plausible can be added with one script tag if ever needed.

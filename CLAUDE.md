# Sifrifana Pro

Single-page portfolio site for Mariam Dikhaminjia (Sifrifana) — video editing / cinematic work.

## Stack

- Single `index.html` file (HTML + inline CSS + inline JS)
- No build tools, frameworks, or package manager — must be served via HTTP server (not `file://`) due to ES module imports
- Three.js v0.140.0 vendored locally (`three.module.js`) — no CDN at runtime
- Use Playwright (`node` + `require('playwright')`) to scrape external website content (e.g. sifrifana.pro) — WebFetch returns 403 for this domain
- Google Fonts loaded via CDN: Josefin Sans (weights 300, 400, 600)

## File structure

```
index.html              # Entire site: markup, styles (<style>), and scripts (<script type="module">)
bglines.js              # Scroll-reactive wavy background lines (based on Cuberto bglines, MIT)
three.module.js         # Three.js v0.140.0 (vendored, ES module)
7qt6d4q6-683x1024.jpg   # Hero portrait photo (used 3 times for chromatic aberration effect)
videos/                  # Local MP4 files (gitignored) downloaded via yt-dlp from sifrifana.pro YouTube embeds
CLAUDE.md               # This file
.gitignore              # Ignores videos/, .claude/, .DS_Store
```

## Design guidelines

- White background (`#ffffff`) with navy blue text/content throughout
- CSS custom properties defined in `:root`: `--navy` (#2D628C), `--navy-light` (#3a7db0), `--navy-dark` (#1e4460), `--heading`, `--body`
- Heading font: `var(--heading)` = Josefin Sans, weight 300, letter-spacing 0.3em, uppercase for the main title
- Body font: `var(--body)` = Century Gothic / Avenir fallback
- Preserve existing animations (`fadeIn`, `scrollBounce`, `ping` keyframes) — do not remove or alter them
- Hero section uses a two-column layout: photo on left, branding + CTA on right
- Hero photo uses a chromatic aberration effect: 3 stacked layers (cyan shifted 14px down-left, red/magenta shifted 10px up + 12px right, original on top) using `mix-blend-mode: multiply`
- The hero logo wrap (SVG icon + divider + title) must be kept intact
- Mobile breakpoint at 768px stacks hero columns vertically; additional breakpoints at 600px and 1024px for grids
- Custom thin scrollbar styling via `::-webkit-scrollbar`

## Video player

- Custom controls only: play/pause button + mute/unmute button (no native browser controls)
- Only one video can play at a time — starting a new video pauses the current one
- Videos auto-unmute on play; mute button toggles with speaker icon swap (inline SVGs)
- Overlay with play button shows when paused (light blur over video), hides when playing (mute button stays visible)
- All videos are local MP4 files in `videos/` directory (downloaded via yt-dlp from sifrifana.pro YouTube embeds)
- Videos use `preload="metadata"` and start muted

## Key sections (in DOM order)

1. **Background Lines** (`#bg-lines`) — Fixed full-viewport canvas with scroll-reactive wavy lines
2. **Header** — Fixed top nav with logo + navigation links; becomes translucent white with backdrop blur on scroll (`.scrolled` class)
3. **Scroll Progress** — Fixed right-side indicator: vertical bar fill + dot buttons for section navigation + scroll-to-top button (hidden on screens <= 1024px)
4. **Hero** (`#hero`) — Photo with chromatic aberration, SIFRIFANA branding, tagline, UpWork/LinkedIn CTA buttons
5. **Videos** (`#about`) — 6 portfolio videos in a 3-column grid (responsive: 2-col at 1024px, 1-col at 600px)
6. **Clients Talk About Me** — 3 client testimonial videos (Karl, David, Lucas) in a 3-column grid
7. **Shorts** — 3 vertical (9:16) short-form videos in a flex row
8. **Services** (`#services`) — Intro heading + 4 full-viewport service cards (Cinematic Touch, Fast & Reliable, Creative Storytelling, Premium Editing) with animated horizontal line reveal
9. **Stats** (`#stats`) — Animated counter stats (30+ Clients, 160+ Projects, 3,081+ Videos) with decorative globe rings/dots, platform links
10. **Testimonials** (`#testimonials`) — Dynamically generated from JS array (8 testimonials) in a 2-column grid
11. **Footer** — 3-column grid with nav links, CTA + contact, social icons (YouTube, Instagram, Behance); bottom bar with logo + copyright

## JavaScript architecture (inline `<script type="module">`)

All JS is in a single `<script type="module">` block at the end of `<body>`. Major systems:

### Background lines (`bglines.js`)
- 20 horizontal wavy lines rendered via Three.js WebGL (OrthographicCamera, custom vertex shader)
- Based on Cuberto bglines (MIT) — ported to BufferGeometry for Three.js v0.140+ compatibility
- Lines undulate gently over time using sinusoidal math in the vertex shader
- Scroll-reactive: `window.scrollY` drives wave phase shift with smooth lerp interpolation
- No cursor/touch interaction — purely scroll-driven
- Navy blue lines at low opacity on transparent canvas (`color: [0.176, 0.384, 0.549, 0.25]`)
- Canvas is `<canvas id="bg-lines">` with `position: fixed; z-index: 0; pointer-events: none`
- Vendored Three.js (`three.module.js`) imported locally — no CDN dependency at runtime

### Video player controls
- Event delegation via `querySelectorAll('.video-overlay')` — handles play/pause, mute, and click-to-pause
- `stopOthers()` pauses all other videos when a new one starts
- SVG icons swapped via `innerHTML` for muted/unmuted and play/pause states

### Scroll handling
- Header scroll state toggle (`.scrolled` class at 50px)
- Scroll progress bar fill percentage
- Active section dot detection (loops through `['hero','about','services','testimonials']`)

### Scroll reveal
- `IntersectionObserver` at 15% threshold adds `.visible` class to `.reveal` elements
- CSS transition: 2.2s opacity + translateY with cubic-bezier easing
- Staggered delays via `.reveal-delay-1` (0.3s), `.reveal-delay-2` (0.6s), `.reveal-delay-3` (0.9s)

### Counter animation
- Separate `IntersectionObserver` at 50% threshold for `.stat-number` elements
- Animates from 0 to `data-target` value over 2 seconds with ease-out cubic
- Numbers >= 1000 get `toLocaleString()` formatting; all get "+" suffix

### Testimonials
- Generated from `testimonials` array of `{q, n, c}` objects (quote, name, company)
- Each testimonial gets a numbered diamond marker, quote, and author attribution
- Observed by the same reveal observer after DOM insertion

### Mobile menu
- Hamburger button toggles `.open` class on `#nav`
- Nav links auto-close the menu on click

### Scroll dots & top button
- Each `.scroll-dot` scrolls to its `data-target` section smoothly
- `#scroll-top` scrolls to top

## Important conventions

- All styles are inline in `<style>` — no external CSS files
- All scripts are inline in `<script type="module">` — except `bglines.js` and `three.module.js` which are separate ES modules
- SVG icons are inline throughout (no icon library)
- Section IDs don't always match their visual names (e.g., `#about` is the Videos section, `#services` is the Services section)
- Videos are referenced by YouTube ID filenames (e.g., `videos/wla3GQNoP5Y.mp4`)
- The `videos/` directory is gitignored — video files must be downloaded separately via yt-dlp

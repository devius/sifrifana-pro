# Sifrifana Pro

Single-page portfolio site for Mariam Dikhaminjia (Sifrifana) — video editing / cinematic work.

## Stack

- Static site: `index.html` + external CSS (`assets/css/main.css`) + modular JS (`assets/js/`)
- Three.js (r128) loaded via CDN for WebGL background and 3D software cubes
- No build tools, frameworks, or package manager
- Use Playwright (`node` + `require('playwright')`) to scrape external website content (e.g. sifrifana.pro) — WebFetch returns 403 for this domain
- Google Fonts loaded via CDN: Josefin Sans (weights 300, 400, 600)

## File structure

```
index.html                          # Markup only (no inline styles or scripts)
assets/
  css/main.css                      # All styles
  js/
    app.js                          # Main entry point (imports config, three-bg, three-software)
    config.js                       # Exported constants: SVG icon strings, testimonials array
    three-bg.js                     # WebGL particle tunnel background (initBackground)
    three-software.js               # 3D interactive software cubes (initSoftwareCubes)
  img/
    sifrifana.png                   # Hero portrait photo (used 3 times for chromatic aberration effect)
    software/                       # Software logo textures (premiere.png, capcut.png, photoshop.png, lightroom.png)
videos/                             # Local MP4 files (gitignored) downloaded via yt-dlp from sifrifana.pro YouTube embeds
world.svg                           # World map SVG used in Stats section
CLAUDE.md                           # This file
.gitignore                          # Ignores videos/, .claude/, .DS_Store, node_modules/
```

## Design guidelines

- Dark theme: black background (`#000`) with light text throughout
- WebGL particle tunnel background (`canvas#webgl-bg`) — fixed fullscreen behind all content, neon pink/cyan/purple light-painting trails
- CSS custom properties defined in `:root`: `--navy` (#8fd3ff), `--navy-light` (#e0f4ff), `--navy-dark` (#ffffff), `--heading`, `--body`
- Heading font: `var(--heading)` = Josefin Sans, weight 300, letter-spacing 0.3em, uppercase for the main title
- Body font: `var(--body)` = Century Gothic / Avenir fallback
- Preserve existing animations (`fadeIn`, `scrollBounce`, `ping` keyframes) — do not remove or alter them
- Hero section uses a two-column layout: photo on left, branding + CTA on right
- Hero photo uses a chromatic aberration effect: 3 stacked layers (cyan shifted down-left, red/magenta shifted up-right, original on top) using `mix-blend-mode: multiply`
- The hero logo wrap (SVG icon + divider + title) must be kept intact
- Mobile breakpoint at 768px stacks hero columns vertically; additional breakpoints at 600px and 1024px for grids
- Custom thin scrollbar styling via `::-webkit-scrollbar`

## Video player

- Custom controls only: play/pause button + mute/unmute button (no native browser controls)
- Only one video can play at a time — starting a new video pauses the current one
- Videos auto-unmute on play; mute button toggles with speaker icon swap (SVG strings from `config.js`)
- Overlay with play button shows when paused, hides when playing (mute button stays visible)
- All videos are local MP4 files in `videos/` directory (downloaded via yt-dlp from sifrifana.pro YouTube embeds)
- Videos use `preload="metadata"` and start muted

## Key sections (in DOM order)

1. **Header** — Fixed top nav with logo + navigation links (Home, Client Reviews, Portfolio Videos, Testimonials); becomes translucent with backdrop blur on scroll (`.scrolled` class)
2. **Scroll Progress** — Fixed right-side indicator: vertical bar fill + dot buttons for section navigation + scroll-to-top button (hidden on screens <= 1024px)
3. **Hero** (`#hero`) — Photo with chromatic aberration, SIFRIFANA branding, tagline, UpWork/LinkedIn CTA buttons, scroll hint
4. **Clients Talk About Me** (`#about`) — 3 client testimonial videos (Karl, David, Lucas) in a 3-column grid
5. **Videos** (`#videos`) — 6 portfolio videos in a 3-column grid (responsive: 2-col at 1024px, 1-col at 600px) with subtitle text
6. **Shorts** — 3 vertical (9:16) short-form videos in a flex row
7. **Premium Editing Software** — 4 interactive 3D cubes (Premiere Pro, CapCut, Photoshop, Lightroom) rendered with Three.js; draggable with idle animation
8. **Stats** (`#stats`) — Animated counter stats (30+ Clients, 160+ Projects, 3,081+ Videos) with world map SVG background and decorative dots
9. **Testimonials** (`#testimonials`) — Dynamically generated from JS array (12 testimonials) in a 2-column grid
10. **Footer** — 3-column grid with nav links, CTA + contact, social icons (YouTube, Instagram, Behance); bottom bar with logo + copyright

## JavaScript architecture (modular ES modules)

JS is split across 4 files in `assets/js/`, loaded via `<script type="module" src="assets/js/app.js">`.

### app.js (main entry)
Imports from `config.js`, `three-bg.js`, `three-software.js`. Contains all DOM interaction logic:

### Video player controls
- Event delegation via `querySelectorAll('.video-overlay')` — handles play/pause, mute, and click-to-pause
- `stopOthers()` pauses all other videos when a new one starts
- SVG icons swapped via `innerHTML` using exported strings from `config.js`

### Scroll handling
- Header scroll state toggle (`.scrolled` class at 50px)
- Scroll progress bar fill percentage
- Active section dot detection (loops through `['hero','about','videos','testimonials']`)

### Scroll reveal
- `IntersectionObserver` at 15% threshold adds `.visible` class to `.reveal` elements; removes on exit
- Staggered delays via `.reveal-delay-1`, `.reveal-delay-2`, `.reveal-delay-3`
- Additional `.jump-reveal` class used for software cubes

### Counter animation
- Separate `IntersectionObserver` at 50% threshold for `.stat-number` elements
- Animates from 0 to `data-target` value over 2 seconds with ease-out cubic
- Numbers >= 1000 get `toLocaleString()` formatting; all get "+" suffix

### Testimonials
- Generated from `testimonials` array in `config.js` — 12 `{q, n, c}` objects (quote, name, company)
- Each testimonial gets a numbered marker, quote, and author attribution
- Observed by the same reveal observer after DOM insertion

### Mobile menu
- Hamburger button toggles `.open` class on `#nav`
- Nav links auto-close the menu on click

### config.js
- Exports `mutedSvg`, `unmutedSvg` (SVG markup strings for mute button states)
- Exports `testimonials` array

### three-bg.js — `initBackground()`
- Full-viewport WebGL particle tunnel using Three.js
- 40 "head" particles each with 45-point fading tails (light-painting effect)
- Neon color palette: pink (#ff0066), cyan (#00ccff), purple (#9900ff)
- Mouse parallax on camera rotation
- Scroll-reactive speed boost (warp effect)
- Deep navy fog (`FogExp2`)

### three-software.js — `initSoftwareCubes()`
- 4 independent Three.js scenes (Premiere Pro, CapCut, Photoshop, Lightroom)
- Each renders a textured `BoxGeometry` cube with the software logo
- Idle animation: gentle sinusoidal rotation
- Drag interaction: mouse/touch drag rotates the cube
- Responsive sizing (120px mobile, 160px desktop)

## Important conventions

- Styles in external `assets/css/main.css` — no inline styles (except minimal inline `style` attributes in HTML)
- Scripts in external `assets/js/` modules — no inline JS
- SVG icons are inline in HTML throughout (no icon library)
- Section IDs don't always match their visual names (e.g., `#about` is the "Clients Talk About Me" section)
- Videos are referenced by YouTube ID filenames (e.g., `videos/wla3GQNoP5Y.mp4`)
- The `videos/` directory is gitignored — video files must be downloaded separately via yt-dlp
- Three.js is loaded as a global via CDN `<script>` tag before the module scripts

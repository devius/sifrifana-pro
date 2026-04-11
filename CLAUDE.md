# Sifrifana Pro

Single-page portfolio site for Mariam Dikhaminjia (Sifrifana) — video editing / cinematic work.

## Stack

- Static site: `index.html` + external CSS (`assets/css/main.css`) + modular JS (`assets/js/`)
- Three.js (r128) loaded via CDN for WebGL background and 3D software cubes
- No build tools, frameworks, or package manager
- Local dev server: `npx http-server /Users/devi/Development/sifrifana-pro -p 8003 -c-1`
- Use Playwright (`node` + `require('playwright')`) to scrape external website content (e.g. sifrifana.pro) — WebFetch returns 403 for this domain
- Google Fonts loaded via CDN: Josefin Sans (weights 300, 400, 600)

## Hosting & deployment

- **Site**: Cloudflare Pages — project `sifrifana-pro` on account `4dc18a7d9c10a7bda303d781473a8cc2`
- **Domain**: `sifrifana.pro` (DNS on Cloudflare, custom domain on Pages), also available at `sifrifana-pro.pages.dev`
- **Videos**: Cloudflare R2 bucket `sifrifana-videos` — public access via `https://pub-6890b9cbc87c49a184b78dd8d6cd46cb.r2.dev/videos/`
- **CI/CD**: GitHub Actions (`.github/workflows/static.yml`) — auto-deploys to Cloudflare Pages on push to `main` using `cloudflare/wrangler-action@v3`
- **Secrets** (GitHub repo settings): `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

### Two-step deployment process

Deploying content changes is a two-step process because videos are hosted separately from the site:

1. **Upload video assets to R2** (manual, before pushing code):
   ```bash
   ./scripts/upload-video.sh <youtube-url-or-id>
   ```
   This downloads the video + thumbnail via yt-dlp, uploads both to R2, and prints the `src`/`poster` URLs to use in `index.html`. Prerequisites: `yt-dlp`, `wrangler` (authenticated), `curl`.

2. **Push code to deploy the site**: Update `index.html` with the R2 URLs, commit, and push to `main`. GitHub Actions auto-deploys to Cloudflare Pages.

Videos are NOT in the git repo (`videos/` is gitignored) — they live only on R2. The local `videos/` directory is a workspace for downloading/processing before upload.

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
    favicon.svg                     # SVG favicon (constellation icon from hero section)
    sifrifana.png                   # Hero portrait photo (used 3 times for chromatic aberration effect)
    software/                       # Software logo textures (premiere.png, capcut.png, photoshop.png, lightroom.png)
    logos/                          # Platform logos (linkedin.svg, upwork.svg)
    thumbnails/                     # YouTube video thumbnails (maxresdefault.jpg per video ID)
scripts/
  upload-video.sh                   # Downloads YouTube video + thumb, uploads to R2, prints URLs
videos/                             # Local MP4 files (gitignored) — canonical copies live on R2
world.svg                           # World map SVG used in Stats section
.github/workflows/static.yml        # Cloudflare Pages auto-deploy workflow
CLAUDE.md                           # This file
.gitignore                          # Ignores videos/, .claude/, .DS_Store, node_modules/, .wrangler/
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
- Videos and shorts have a subtle cyan/purple glow border (`box-shadow`)

## Video player

- Custom controls only: play/pause button + mute/unmute button + fullscreen button (no native browser controls)
- Fullscreen button (top-right, `.vid-fullscreen`): toggles CSS-based fullscreen (`.video-fullscreen-active` class on wrapper); icon swaps between expand/compress; always visible while playing (like mute button)
- Fullscreen uses `position: fixed; inset: 0` with `object-fit: contain` (black bars for aspect ratio mismatch)
- Exit fullscreen: scroll wheel, swipe up/down (40px threshold), or ESC key — all exit AND pause the video
- Fullscreen pauses the WebGL background; exiting resumes it (via `syncBackground`)
- Progress bar at bottom of each video: 10px tall (14px on hover), cyan-to-purple gradient fill, click/drag to seek
- Only one video can play at a time — starting a new video pauses the current one
- Videos auto-unmute on play; mute button toggles with speaker icon swap (SVG strings from `config.js`)
- Overlay with play button shows when paused, hides when playing (mute button stays visible)
- Videos served from Cloudflare R2 (full URLs in `src` attributes)
- YouTube thumbnails used as `poster` images, also hosted on R2 (`/thumbs/{ID}.jpg`)
- Videos use `preload="none"` and start muted — poster image provides the visual preview

## Key sections (in DOM order)

1. **Header** — Fixed top nav with logo + navigation links (Home, Testimonials, Portfolio Videos, Client Reviews); becomes translucent with backdrop blur on scroll (`.scrolled` class)
2. **Hero** (`#hero`) — Photo with chromatic aberration, SIFRIFANA branding, tagline, Upwork/LinkedIn styled buttons (`.btn-badge` with local SVG logos), scroll hint
3. **Testimonials** (`#about`) — 3 client testimonial videos (Karl, David, Lucas) in a 3-column grid; CSS class `.testimonials` with `.testimonial-item`, `.testimonial-name-label`
4. **Videos** (`#videos`) — 6 portfolio videos in a 3-column grid (responsive: 2-col at 1024px, 1-col at 600px) with subtitle text
5. **Shorts** — 6 vertical (9:16) short-form videos in a 3-column grid (responsive: 2-col at 768px, 1-col at 600px)
6. **Premium Editing Software** — 4 interactive 3D cubes (Premiere Pro, CapCut, Photoshop, Lightroom) rendered with Three.js; draggable with idle animation
7. **Stats** (`#stats`) — Animated counter stats (100+ Clients, 500+ Projects, 5,000+ Videos) with world map SVG background and decorative dots
8. **Clients Talk About Me** (`#testimonials`) — Dynamically generated from JS array (12 testimonials) in a 2-column grid; CSS class `.client-videos` with `.client-videos-bg`, `.client-videos-intro`, `.client-videos-grid`
9. **Footer** — 3-column grid with nav links, CTA + Upwork/LinkedIn buttons (stacked, LinkedIn first) + badge note, social icons (YouTube, Instagram, Behance); bottom bar with logo + copyright

## JavaScript architecture (modular ES modules)

JS is split across 4 files in `assets/js/`, loaded via `<script type="module" src="assets/js/app.js">`.

### app.js (main entry)
Imports from `config.js`, `three-bg.js`, `three-software.js`. Contains all DOM interaction logic:

### Video player controls
- Event delegation via `querySelectorAll('.video-overlay')` — handles play/pause, mute, and click-to-pause
- `stopOthers()` pauses all other videos when a new one starts
- `syncBackground()` pauses the WebGL background animation while any video is playing, resumes when all videos are paused/ended (calls `pauseBackground()` / `resumeBackground()` from `three-bg.js`)
- SVG icons swapped via `innerHTML` using exported strings from `config.js`
- Progress bar dynamically created per video: `timeupdate` updates fill, mousedown/touchstart enables seeking
- `IntersectionObserver` (threshold 0) auto-pauses any playing video when it exits the viewport — shows overlay, resets play button, and calls `syncBackground()`

### Scroll handling
- Header scroll state toggle (`.scrolled` class at 50px)

### Scroll reveal
- `IntersectionObserver` at 15% threshold adds `.visible` class to `.reveal` elements; removes on exit
- Staggered delays via `.reveal-delay-1` (0.3s), `.reveal-delay-2` (0.6s), `.reveal-delay-3` (0.9s)
- Grid sections (Videos, Shorts, Testimonials) use per-row sequential staggering: first item no delay, second `reveal-delay-1`, third `reveal-delay-2` — repeat pattern for each row
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

### three-bg.js — `initBackground()`, `pauseBackground()`, `resumeBackground()`
- Full-viewport WebGL particle tunnel using Three.js
- 40 "head" particles each with 45-point fading tails (light-painting effect)
- Neon color palette: pink (#ff0066), cyan (#00ccff), purple (#9900ff)
- Mouse parallax on camera rotation
- Scroll-reactive speed boost (warp effect)
- Deep navy fog (`FogExp2`)
- Exports `pauseBackground()` / `resumeBackground()` to stop/restart the animation loop — used by `app.js` to pause the background while any video is playing and resume when all videos are paused/ended

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
- Section IDs don't always match their visual names (e.g., `#about` is the "Testimonials" video section, `#testimonials` is the "Clients Talk About Me" text section)
- Videos are referenced by full R2 URLs (e.g., `https://pub-6890b9cbc87c49a184b78dd8d6cd46cb.r2.dev/videos/wla3GQNoP5Y.mp4`)
- The `videos/` directory is gitignored — canonical copies live on R2
- Three.js is loaded as a global via CDN `<script>` tag before the module scripts
- Platform buttons use `.btn-badge` class with `.btn-upwork` / `.btn-linkedin` variants and local SVG logos in `assets/img/logos/`

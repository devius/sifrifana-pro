# Sifrifana Pro

Single-page portfolio site for Mariam Dikhaminjia (Sifrifana) — video editing / cinematic work.

## Stack

- Single `index.html` file (HTML + inline CSS + inline JS)
- No build tools or frameworks
- Use Playwright (`node` + `require('playwright')`) to scrape external website content (e.g. sifrifana.pro) — WebFetch returns 403 for this domain

## Design guidelines

- Preserve the original typography: heading font uses `var(--heading)`, weight 300, letter-spacing 0.3em, uppercase for the main title
- Preserve existing animations (fadeIn, scrollBounce, ping keyframes) — do not remove or alter them
- Hero section uses a two-column layout: photo on left, branding + CTA on right
- Hero photo uses a TikTok-style RGB chromatic aberration effect: 3 stacked layers (cyan shifted 14px down-left, red/magenta shifted 10px up + 12px right, original on top) using mix-blend-mode: screen
- The hero logo wrap (SVG icon + divider + title) must be kept intact
- Deep blue background (`#0b1a2b`) with white/light text throughout
- Mobile breakpoint at 768px stacks hero columns vertically

## Video player

- Custom controls only: play/pause button + mute/unmute button (no native browser controls)
- Only one video can play at a time — starting a new video pauses the current one
- Videos auto-unmute on play; mute button toggles with speaker icon swap
- Overlay with play button shows when paused (light blur over video), hides when playing (mute button stays visible)
- All videos are local MP4 files in `videos/` directory (downloaded via yt-dlp from sifrifana.pro YouTube embeds)

## Key sections

- Hero: photo, SIFRIFANA branding, tagline, UpWork/LinkedIn links
- Videos: 6 local videos in a 3-column grid with custom player controls
- Clients Talk About Me: 3 client testimonial videos (Karl, David, Lucas)
- Shorts: 3 vertical (9:16) short-form videos
- Services
- Testimonials (dynamically generated from JS array)
- Footer

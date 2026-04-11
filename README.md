# Sifrifana Pro

Portfolio site for Mariam Dikhaminjia (Sifrifana) — video editing and cinematic work.

**Live:** [sifrifana.pro](https://sifrifana.pro)

## Stack

- Static HTML + CSS + vanilla JS (ES modules)
- Three.js for WebGL background and 3D software cubes
- No build tools or frameworks

## Deployment

The site uses a **two-step deployment** process:

### 1. Upload videos to Cloudflare R2

Videos are hosted on Cloudflare R2, not in the git repo. To add a new video:

```bash
./scripts/upload-video.sh <youtube-url-or-id>
```

This will:
- Download the video and thumbnail using yt-dlp
- Upload both to the R2 bucket
- Print the `src` and `poster` URLs to use in `index.html`

**Prerequisites:** [yt-dlp](https://github.com/yt-dlp/yt-dlp), [wrangler](https://developers.cloudflare.com/workers/wrangler/) (authenticated), curl

### 2. Push code to deploy the site

Update `index.html` with the R2 URLs, commit, and push to `main`. GitHub Actions automatically deploys to Cloudflare Pages.

## Project structure

```
index.html              Static markup
assets/
  css/main.css          All styles
  js/                   ES modules (app.js, config.js, three-bg.js, three-software.js)
  img/                  Images, software logos, platform logos
scripts/
  upload-video.sh       Video upload helper
videos/                 Local video workspace (gitignored)
```

## Infrastructure

| Service | Purpose |
|---------|---------|
| Cloudflare Pages | Site hosting (auto-deploy from `main`) |
| Cloudflare R2 | Video and thumbnail storage |
| GitHub Actions | CI/CD pipeline |

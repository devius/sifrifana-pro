#!/usr/bin/env bash
set -euo pipefail

# Upload a YouTube video + thumbnail to Cloudflare R2 and print the URLs
# to use in index.html.
#
# Usage:
#   ./scripts/upload-video.sh <youtube-url-or-id>
#
# Prerequisites: yt-dlp, wrangler (authenticated), curl

BUCKET="sifrifana-videos"
R2_PUBLIC="https://pub-6890b9cbc87c49a184b78dd8d6cd46cb.r2.dev"

# Extract video ID from URL or bare ID
input="${1:?Usage: $0 <youtube-url-or-id>}"
if [[ "$input" =~ ^[A-Za-z0-9_-]{11}$ ]]; then
  id="$input"
else
  id=$(echo "$input" | sed -n 's/.*[?&]v=\([A-Za-z0-9_-]\{11\}\).*/\1/p')
  if [[ -z "$id" ]]; then
    id=$(echo "$input" | sed -n 's|.*/\([A-Za-z0-9_-]\{11\}\).*|\1|p')
  fi
fi

if [[ -z "$id" ]]; then
  echo "Error: could not extract video ID from '$input'" >&2
  exit 1
fi

echo "Video ID: $id"

# --- Step 1: Download video ---
mkdir -p videos
video_path="videos/${id}.mp4"
if [[ -f "$video_path" ]]; then
  echo "Video already downloaded: $video_path"
else
  echo "Downloading video..."
  yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]" \
    --merge-output-format mp4 \
    -o "$video_path" \
    "https://www.youtube.com/watch?v=${id}"
fi

# --- Step 2: Download thumbnail ---
thumb_path="videos/${id}.jpg"
if [[ -f "$thumb_path" ]]; then
  echo "Thumbnail already downloaded: $thumb_path"
else
  echo "Downloading thumbnail..."
  curl -fsSL "https://img.youtube.com/vi/${id}/maxresdefault.jpg" -o "$thumb_path"
fi

# --- Step 3: Upload video to R2 ---
echo "Uploading video to R2..."
wrangler r2 object put "${BUCKET}/videos/${id}.mp4" \
  --file "$video_path" \
  --content-type video/mp4 \
  --remote

# --- Step 4: Upload thumbnail to R2 ---
echo "Uploading thumbnail to R2..."
wrangler r2 object put "${BUCKET}/thumbs/${id}.jpg" \
  --file "$thumb_path" \
  --content-type image/jpeg \
  --remote

echo ""
echo "Done! Use these in index.html:"
echo "  src=\"${R2_PUBLIC}/videos/${id}.mp4\""
echo "  poster=\"${R2_PUBLIC}/thumbs/${id}.jpg\""

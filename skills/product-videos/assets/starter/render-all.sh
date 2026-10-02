#!/usr/bin/env bash
# Renders videos into out/, normalises their loudness, writes captions, and adds thumbnails as cover art.
#   ./render-all.sh                 every video and cutdown (all compositions except scenes and thumbnails)
#   ./render-all.sh Example         just these compositions
# Output names are kebab-case: ExampleVertical -> out/example-vertical.mp4
# If the browser lacks system libraries (WSL without sudo), set CHROMIUM_LIBS to the extracted lib dir.
set -e
cd "$(dirname "$0")"
[ -n "$CHROMIUM_LIBS" ] && export LD_LIBRARY_PATH="$CHROMIUM_LIBS"
npx remotion bundle src/index.ts --out-dir=build >/dev/null 2>&1
comps="$*"
if [ -z "$comps" ]; then
  comps=$(npx remotion compositions build --quiet 2>/dev/null | tr ' ' '\n' | grep -v -- '-' | grep -v 'Thumbnail$' | tr '\n' ' ')
fi
kebab() { echo "$1" | sed -E 's/([a-z0-9])([A-Z])/\1-\2/g' | tr '[:upper:]' '[:lower:]'; }
for c in $comps; do
  out="out/$(kebab "$c").mp4"
  mkdir -p out
  echo "rendering $c -> $out"
  npx remotion render build "$c" "$out" --concurrency=4 >/dev/null 2>&1
  ./normalise.sh "$out"
  # A <Name>Thumbnail composition (for the base name, so cutdowns share it) becomes the cover art
  base_name="${c%Vertical}"
  if grep -q "\"${base_name}Thumbnail\"" src/Root.tsx; then
    thumb="out/$(kebab "$base_name")-thumbnail"
    if [ ! -f "$thumb-1280.jpg" ] || [ "$c" = "$base_name" ]; then
      npx remotion still build "${base_name}Thumbnail" "$thumb.png" --frame=239 >/dev/null 2>&1
      npx remotion still build "${base_name}Thumbnail" "$thumb-1280.jpg" --frame=239 --scale=0.6667 --image-format=jpeg --jpeg-quality=90 >/dev/null 2>&1
    fi
    npx remotion ffmpeg -hide_banner -loglevel error -y -i "$out" -i "$thumb-1280.jpg" -map 0:v:0 -map 0:a:0 -map 1 -c copy -disposition:v:1 attached_pic "${out%.mp4}.cover.mp4"
    mv "${out%.mp4}.cover.mp4" "$out"
  fi
done
npm run vtt --silent
# Cutdowns share their video's captions, shifted back if the full video opens on its thumbnail
for f in out/*-vertical.mp4; do
  [ -f "$f" ] || continue
  src="${f%-vertical.mp4}.vtt"
  [ -f "$src" ] || continue
  if grep -q "OPEN_ON_THUMBNAIL = true" src/Root.tsx; then
    node -e '
      const fs = require("fs"); const [src, dst] = process.argv.slice(1);
      const ms = (t) => { const [h, m, s] = t.split(":"); return ((+h * 60 + +m) * 60 + +s) * 1000; };
      const fmt = (v) => { v = Math.max(0, Math.round(v)); const p = (n, w = 2) => String(n).padStart(w, "0");
        return `${p(Math.floor(v / 3600000))}:${p(Math.floor(v / 60000) % 60)}:${p(Math.floor(v / 1000) % 60)}.${p(v % 1000, 3)}`; };
      const shift = 500; // 15 frames at 30 fps
      fs.writeFileSync(dst, fs.readFileSync(src, "utf8").replace(/(\d+:\d+:\d+\.\d+) --> (\d+:\d+:\d+\.\d+)/g, (_, a, b) => `${fmt(ms(a) - shift)} --> ${fmt(ms(b) - shift)}`));
    ' "$src" "${f%.mp4}.vtt"
  else
    cp "$src" "${f%.mp4}.vtt"
  fi
done

#!/usr/bin/env bash
# Half-size PNGs of single frames, to check a moment without rendering a whole video.
#   ./stills.sh <composition>:<frame>[,<frame>...] ...     e.g. ./stills.sh example-demo:60,130 ExampleVertical:200
# Bundles once, writes stills/<composition>-<frame>.png. Set CHROMIUM_LIBS as for render-all.sh if needed.
set -e
cd "$(dirname "$0")"
[ -n "$CHROMIUM_LIBS" ] && export LD_LIBRARY_PATH="$CHROMIUM_LIBS"
mkdir -p stills
npx remotion bundle src/index.ts --out-dir=build >/dev/null 2>&1
for spec in "$@"; do
  comp=${spec%%:*}
  frames=${spec#*:}
  for f in ${frames//,/ }; do
    npx remotion still build "$comp" "stills/$comp-$f.png" --frame="$f" --scale=0.5 >/dev/null 2>&1 || echo "failed $comp $f (run it without >/dev/null to see why)"
  done
done
echo done

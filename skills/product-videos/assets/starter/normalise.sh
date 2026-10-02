#!/usr/bin/env bash
# Brings a rendered video's audio to -16 LUFS (true peak -1.5 dB) in two loudnorm passes.
# The picture is copied untouched. Usage: ./normalise.sh out/platform.mp4 [...]
set -e
cd "$(dirname "$0")"
for f in "$@"; do
  m=$(npx remotion ffmpeg -hide_banner -nostats -i "$f" -vn -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
  get() { echo "$m" | grep "\"$1\"" | sed -E 's/.*: "([^"]+)".*/\1/'; }
  tmp="${f%.mp4}.norm.mp4"
  npx remotion ffmpeg -hide_banner -loglevel error -y -i "$f" -c:v copy \
    -af "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true" \
    -c:a aac -b:a 192k -ar 48000 "$tmp"
  mv "$tmp" "$f"
  echo "$f: $(get input_i) LUFS -> -16 LUFS"
done

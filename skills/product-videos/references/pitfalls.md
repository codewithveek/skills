# Pitfalls and fixes

Each of these happened. Check here before debugging from scratch.

## Rendering

| Symptom | Cause | Fix |
|---|---|---|
| `React is not defined` while bundling | Remotion's bundler uses the classic JSX transform here | `import React from "react"` at the top of every `.tsx` |
| Studio fails with `getRenderQueue is not a function` | `@remotion/cli@4.0.531` shipped an empty `dist/render-queue/queue.js` | Pin every Remotion package to `4.0.530` (`npm i --save-exact`), check `wc -c node_modules/@remotion/cli/dist/render-queue/queue.js` |
| Render fails: `inputRange must contain only finite numbers` | `Infinity` passed to `interpolate` (e.g. "show forever") | Use a large finite number (`1e6`) |
| Chromium won't start: missing `libnss3`, `libnspr4`, `libasound` (WSL without sudo) | System libraries absent | `apt-get download libnspr4 libnss3 libasound2t64`, `dpkg -x` each into a folder, set `CHROMIUM_LIBS` (the kit's scripts export it as `LD_LIBRARY_PATH`) |
| A still shows nothing inside `<Freeze frame={220}>` | Freezing past a one-frame `<Still>`'s duration renders nothing | Make thumbnails 240-frame compositions and render frame 239 |
| `transform` set twice warning, an animation ignored | Spreading `rise()` (which sets `transform`) and adding a `transform` on one element | Wrap: outer element gets `rise()`, inner element gets the scale |

## Camera, pointer, anchors

| Symptom | Cause | Fix |
|---|---|---|
| Camera and cursor aim at the screen centre in single stills, fine in full renders (or one frame late) | Anchors measure in layout effects before the root's ref is attached on first render; context value never changed | The kit bumps the store after mount and puts a version in the context value. Keep both. |
| Zoomed shots near the bottom are cut off | The window runs past the frame; the camera framed the whole window | The kit frames only the visible part (`visibleH`). If you change window sizes, keep that. |
| The left or right edge of a card is cut when zoomed | Zoom too tight for the card's width | Card width ÷ zoom must stay under the 1440 screen width: zoom ≤ ~1.25 for full-width cards |
| A scrolled page shows empty space at the bottom | Scrolling further than the real page could | Scroll only until the last element meets the bottom edge |
| Cursor covers the text being typed | Clicked the field's centre | Click at `fx: 0.25–0.4` and move down after the click |

## Audio

| Symptom | Cause | Fix |
|---|---|---|
| Voice analysis shows 40–50% energy above 6 kHz | Reading Kokoro's 32-bit float WAV as 16-bit | Read format 3 as float (`audio-report.mjs` does) |
| `loudnorm` measuring pass fails ("encoder not found") | The null output tries to encode video | Add `-vn` to the measuring pass |
| Bundled ffmpeg lacks `showspectrumpic`, `ebur128` output | Remotion's ffmpeg is a minimal build | Analyse in Node (`audio-report.mjs`); `loudnorm` and `volume` exist |
| Finished videos sound quiet next to others | Voice + music mix lands near -19 LUFS | `normalise.sh` to -16 LUFS |
| Music sounds boomy or like a rumble on laptops | Too much energy under 250 Hz | Lower the bass, raise pads and plucks; check the spectrum split |
| Name mispronounced | espeak phonemiser | Respell in `say`; check phonemes first (`scriptwriting.md`) |
| A scene suddenly holds still for seconds | Narration longer than the scene; the voice script grew it | Shorten the line, or give the scene more to do |

## Process

| Symptom | Cause | Fix |
|---|---|---|
| A "wait until done" loop never ends | `pgrep -f "render-all.sh"` matches the waiting loop's own command line | Wait on a PID, or run the job in the background and use its completion notice |
| Captions overlap at scene joins | Cues run into the next scene's crossfade | `vtt.mts` ends each cue where the next starts |
| The product's UI changed during the work | Another session or teammate committed UI changes | Check recent commits before final renders; re-verify labels |
| A video posted on X shows no thumbnail | X previews the opening frame and ignores MP4 cover art | Open on the thumbnail (`withPoster`, on by default); upload a custom thumbnail where the platform allows it |
| Kokoro install is slow | `onnxruntime-node` and the model are ~500 MB | Install once; the voice script caches clips by text |

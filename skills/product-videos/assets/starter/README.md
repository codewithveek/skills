# Product videos starter

Remotion project for product videos: launches, tutorials, explainers and vertical cutdowns, with
rebuilt app screens, a camera and cursor that aim at named elements, local voiceover, generated
music, click and whoosh effects, captions, loudness normalisation and thumbnails. Five visual
styles (`look` in a video's timeline): `studio` (the `example` video), `editorial`, `graphic` and
`showcase` (their own example videos) and `cinematic`. Motion can be timed with presets measured
from real launch videos (`src/kit/measured`).

```bash
npm install
npm i -D kokoro-js@1        # once, for voiceover (large: the ONNX runtime)
npm run music               # public/music/bed.wav and upbeat.wav
npm run voice               # narration.ts -> public/vo/ + voice.json (cached per line)
npm run studio              # preview and scrub in the browser
./stills.sh example-demo:60,160 ExampleVertical:290   # check single frames
./render-all.sh             # every video into out/: mp4, loudness -16 LUFS, captions, thumbnails as cover
                            # (REMOTION_BROWSER_EXECUTABLE=… to use an installed Chrome; RENDER_CONCURRENCY=… threads)
node scripts/audio-report.mjs out/example.mp4          # levels, spectrum and loudness timeline
```

| Where | What |
|---|---|
| `src/brand.ts` | Product name, tagline, logo glyph |
| `src/theme.ts`, `src/kit/tokens.ts` | Stage colours and the app's UI tokens: copy the product's real values |
| `src/videos/<id>/timeline.ts` | The look, scenes, base lengths, each scene's entrance transition, fallback captions |
| `src/videos/<id>/narration.ts` | Voiceover lines, the frame each aims for, respellings |
| `src/videos/<id>/scenes.tsx` | One component per scene |
| `src/Root.tsx` | Which videos, music, vertical cutdowns and thumbnails exist |
| `src/kit/` | Window and camera (`AppStage`), anchors, cursor, cards, captions, thumbnails, the app frame and controls |
| `src/kit/looks.ts`, `transitions.tsx`, `Motion.tsx`, `showcase.tsx`, `Backdrops.tsx` | The five looks, ten scene transitions, motion blocks (odometer, tilt, flip, stamp, cell grid, word slot, orbit, swirl, dot matrix, drop words, word swap, type-and-select, lift …) and each look's ground |
| `src/kit/measured/` | Motion measured frame by frame from real launch videos: `MOTION` presets by role, `measured()`, `easingOf()` |
| `scripts/` | voice, music, captions, audio report |
| `reference/capture.mjs` | Read-only screenshots of the real product, the source of truth for rebuilt screens |

Remotion is pinned to 4.0.530: 4.0.531 shipped an empty `@remotion/cli/dist/render-queue/queue.js`
that breaks the Studio. Remotion is free for individuals and companies of up to three people; larger
companies need a company license (remotion.dev/license).

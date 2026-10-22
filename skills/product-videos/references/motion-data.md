# Measured motion

The kit's easings used to be chosen by eye. This file is about motion **measured** from real launch
videos instead: every frame of a reference video analysed with optical flow (tracking how pixels move
from one frame to the next), each animation beat fitted to Remotion's own `Easing.bezier` or
`spring()`, and the fits checked by rendering them and measuring the render the same way. Four
reference launches have been measured so far. The data lives in `src/kit/measured/`, and the tooling
that produced it is `assets/motion-lab/`.

Read this when you want a video to move like a professional reference, when choosing the timing of
a showcase-look video, or when the user gives you a reference video to match.

## Contents

1. What was measured
2. What the numbers say (and what holds across all four references)
3. Presets by role
4. Using presets in a scene
5. The full library
6. Measuring a new reference video
7. Checking a render against a reference
8. Limits

---

## 1. What was measured

The first reference is a 108-second, 1080p, 60 fps launch video for an AI web app: a white canvas,
a blue-to-violet gradient on accent words, and eight features each shown as a headline followed by a
live UI demo, with an agent filling forms, cards lifting out of the screen and words dropping in.
The showcase look (`visual-styles.md`) is built from it.

| Part | Time | What happens |
|---|---|---|
| Problem | 0–7 s | A line types out and its last word is selected; task chips drift in; app icons orbit the problem statement |
| Pivot | 7–9 s | "But…" in corner brackets, then a one-line question in the same bracket |
| Brand | 9–15 s | The logo assembles from shards; the tagline drops in word by word; a full-frame gradient wipe |
| Features | 15–103 s | Eight times: a headline (words dropping in along curves, one gradient word) → a live demo in a browser (cursor, typing, an agent's side panel, a card lifting out of the page) |
| Close | 103–108 s | The app icon shatters into the wordmark; the tagline and URL |

All 6,479 frames were analysed. The motion was split into **beats**: one beat is one move of one
thing, ending where speed drops sharply. That gave 164 beats and 74 holds. 157 beats were long
enough to fit, and 115 fitted cleanly enough (quality ≥ 0.6, curve error ≤ 6%) to join the library.

Three shorter launches were measured the same way (30 fps; every frame analysed):

| Reference | Length | Look it informs | Beats fitted / in library | Library |
|---|---|---|---|---|
| A furniture brand's launch: lifestyle footage, an Instrument Serif italic "Introducing" beside a heavy wordmark, then each product cut out on a saturated full-bleed colour with its name in huge heavy capitals behind it | 27 s, 1080p | graphic, cinematic | 34 / 19 | `FURNITURE_LAUNCH` |
| A developer API launch: a light grid canvas with corner crosshairs, one loud orange, Inter Display headlines, pixel grids, floating and orbiting logos, a scrolling word list | 25 s, 720p | graphic | 25 / 11 | `API_LAUNCH` |
| A voice-dictation app launch: warm cream with soft pink and orange glows, EB Garamond headlines with coral italic accents, app UI cards, a gauge, device frames | 44 s, 720p | editorial | 49 / 31 | `VOICE_APP_LAUNCH` |

## 2. What the numbers say

The first reference in detail:

| Measure | Value | What it means when you build |
|---|---|---|
| Frames with motion | 77% | Something is almost always moving: a cursor, typing, a drift. Total stillness is rare |
| Holds (nothing moves) | median 250 ms; middle half 133–450 ms; longest 1.2 s | Stillness is short. Text stays readable for longer (scenes run 2–3 s) because other things keep moving around it |
| Beat length | median 417 ms; middle half 300–700 ms; 90% under 970 ms | At 30 fps: about 13 frames, usually 9–21. Longer than ~30 frames is the exception (big pans, line draws) |
| Where speed peaks | median 46% of the way through; 37% of beats peak in the first third, 44% in the middle, 19% in the last | Mostly in-out curves. The kit's `easeOut` (fast start, long settle) peaks at the very start: right for some entrances, wrong as the default here |
| Overshoot | 17% of beats, by 2–28% (typically 4–12%) | An accent for swaps, pops and resizes, not the default |
| Anticipation | 14% of beats pull back more than 2% before moving | Used on moves that should feel deliberate (a panel about to leave) |
| Spring vs bezier | bezier fitted better for 108 of 115 beats | The reference was keyframed with curves, not physics. Springs here are the clamped kind (no bounce) |
| Scene length | median 2.8 s; 0.65 s to 13.6 s | Headline scenes 1.5–3 s; live demos 5–14 s |

All four side by side. Lengths are over every fitted beat; curve shapes over the beats that fitted
cleanly (`analysis/summarize_reference.py` regenerates this table):

| Measure | AI web app | Furniture | Developer API | Voice app |
|---|---|---|---|---|
| Median beat | 417 ms | 500 ms | 733 ms | 667 ms |
| Middle half of beats | 300–700 ms | 408–942 ms | 400–1,167 ms | 433–900 ms |
| Where speed peaks (median) | 46% | 55% | 38% | 50% |
| Beats peaking in the first third | 37% | 16% | 27% | 23% |
| Overshoot | 17% | 21% | 18% | 6% |
| Anticipation | 14% | 11% | 9% | 23% |
| Springs among best fits | 7 of 115 | 0 of 19 | 0 of 11 | 0 of 31 |
| Frames with motion | 77% | 99% | 95% | 90% |
| Median hold | 250 ms | 67 ms | 83 ms | 167 ms |

What holds across all four, and so is safe to treat as a rule:

- **In-out curves, not ease-out.** Speed peaks 38–55% of the way through; at most a third of beats
  peak early. Default to an in-out curve (`MOTION.settle`, `screenPan`, `textRise`) and keep pure
  ease-out for entrances that should feel instant.
- **Something is always moving** (77–99% of frames), and holds are short (67–250 ms median). A scene
  reads as calm because its moves are slow, not because it stops.
- **Beats run about half a second or a little more** (417–733 ms median, 13–22 frames at 30 fps). The
  busy product demo is the quickest; the three brand-led launches run 500–733 ms.
- **Overshoot is an accent** (6–21% of beats). The calmest reference uses it least.
- **Keyframed curves, not physics.** Bezier fitted better than a spring for 169 of 176 clean beats.

## 3. Presets by role

`MOTION` in `src/kit/measured/index.ts` names the library's main shape clusters by the job they did
in the reference. A role's curve is the cluster's fitted easing; its duration is the cluster median.

| Role | Duration (30 fps) | Curve | Beats | Use for |
|---|---|---|---|---|
| `scrollStep` | 333 ms (10 f) | bezier(0.6, −0.04, 0.55, 0.97): tiny wind-up, firm stop | 11 | Scrolls and steps inside a live demo; a selection growing |
| `settle` | 767 ms (23 f) | bezier(0.42, −0.01, 0.2, 1.02): slow start, long soft landing | 8 | A logo, card or panel settling into place; a card lifting out |
| `screenPan` | 600 ms (18 f) | bezier(0.69, −0.01, 0.3, 0.99): symmetric, peak mid-way | 6 | Full-screen pans between views; the gradient wipe |
| `textRise` | 433 ms (13 f) | bezier(0.18, 0.01, 0.4, 0.96): quick start, strong deceleration | 5 | Lines of text moving up; the `rise` transition |
| `chainStep` | 217 ms (7 f) | bezier(0.5, 0.2, 0.51, 0.77): still moving at the end | 5 | One step of a chain that flows into the next; a word leaving a swap |
| `swapOvershoot` | 608 ms (18 f) | bezier(0.62, −0.05, 0.26, 1.1): ~10% overshoot | 4 | A word swapping in, a frame resizing, brackets landing |
| `wordSettle` | 683 ms (20 f) | clamped spring, damping 12.3 | 4 | Headline words arriving sideways along their path |
| `anticipate` | 517 ms (16 f) | bezier(0.78, −0.2, 0.55, 1.03): pulls back first | 4 | A deliberate move, an exit |
| `streak` | 1075 ms (32 f) | clamped spring, damping 9.35 | 2 | A long fast sweep across the frame |
| `longSettle` | 1100 ms (33 f) | bezier(0.2, 0, 0.02, 0.97): expo-like tail | 2 | A line drawing in; a panel arriving from far away |
| `panOvershoot` | 1267 ms (38 f) | bezier(0.4, −0.04, 0.04, 1.09) | 2 | A long pan that overshoots and comes back |
| `popScale` | 775 ms (23 f) | bezier(0.6, −0.16, 0.16, 1.47): strong overshoot | 2 | A dropdown or side panel popping in by scale |

The names are interpretations of where each cluster occurred. The curves and durations are the
measurements. Roles with only 2 beats are thinner evidence than those with 8–11.

## 4. Using presets in a scene

```tsx
import { easingOf, measured, MOTION } from "../../kit/measured";
import { progress } from "../../anim";

const frame = useCurrentFrame();
// 0 → 1 over the measured duration, starting at frame 20, with the reference's exact curve
const pan = measured(frame, 20, MOTION.screenPan);
<div style={{ transform: `translateX(${(1 - pan) * 1100}px)` }} />

// Same curve, your own length: stretch the beat to 30 frames
const slow = measured(frame, 20, MOTION.screenPan, { frames: 30 });

// Or use the curve with the kit's existing helpers
const t = progress(frame, 20, 44, easingOf(MOTION.settle.easing));
```

- Durations are stored in milliseconds and converted at the video's frame rate, so presets work at 30
  or 60 fps.
- `measured()` can go past 1 (overshoot) or below 0 (anticipation) mid-move, and always ends at
  exactly 1. Clamp it only for values that must not overshoot, such as opacity.
- Distances are yours to choose. The preset's `travel` records what moved in the reference, for scale.
- The showcase blocks (`DropWords`, `SwapWord`, `TypeSelect`, `Bracket`, `Lift`, `CurveLine`) and the
  `rise` and `wipe` transitions already use these roles.

## 5. The full libraries

`src/kit/measured/saas-launch.ts` exports `SAAS_LAUNCH`: all 54 shape clusters from the first
reference, generated by motion-lab, each with the beats it came from and its mean fit error.
`FURNITURE_LAUNCH` (13 clusters), `API_LAUNCH` (10) and `VOICE_APP_LAUNCH` (24) are the other three
references, from `furniture-launch.ts`, `api-launch.ts` and `voice-app-launch.ts`; all four export from
`src/kit/measured`. The smaller libraries are mostly one-beat clusters: use them to match one specific
move, and `MOTION` for everyday roles. Clusters with one
member are mostly unusual compound moves: use them only when you are reproducing a specific moment.
Each reference's `assets/motion-lab/data/<name>/presets/fit-report.md` lists every beat: frames, scene, channel, travel,
best curve, error, and the nearest named easing.

## 6. Measuring a new reference video

When the user gives a reference video ("make it move like this one"), measure it instead of
eyeballing it. From `assets/motion-lab/` (see its README):

```bash
npm install && pip install opencv-python numpy
ffprobe -v error -select_streams v:0 -show_entries frame=key_frame,best_effort_timestamp,best_effort_timestamp_time,pict_type -of csv=p=0 ref.mp4 > data/ref/pts.csv
python3 analysis/analyze_motion.py --video ref.mp4 --pts-csv data/ref/pts.csv --out-dir data/ref   # fps and time base read from the video; ~10 min per 2 min at 60 fps
python3 analysis/extract_beat_curves.py --motion-dir data/ref --out data/ref/beat-curves.json   # frame rate detected from the timestamps
npm run fit-presets -- --curves data/ref/beat-curves.json --out-dir data/ref/presets --source ref --export-name REF --runtime-import ./preset
cp data/ref/presets/motion-presets.ts <video project>/src/kit/measured/ref.ts
```

`python3 analysis/summarize_reference.py data/ref data/saas-launch` compares it with a measured
reference (section 2's table). Then read `fit-report.md`, find the big clusters, look at where their beats occur (frame ranges ×
16.7 ms at 60 fps, 33.3 ms at 30 fps), and use those curves in the video. Add roles to `MOTION` only if the user wants
the reference to become part of the kit.

**How accurate it is.** Known curves were rendered in Remotion and measured back with the same pipeline
(`assets/motion-lab/data/saas-launch/calibration.json`). Curve shape came back within 0.5% for
slides, scale and a bouncy spring; distance within ±1.5%; overshoot 0.375 against a true 0.371.

## 7. Checking a render against a reference

`analysis/score_render.py` measures a rendered clip the same way and scores it against a reference
beat, out of 100: 50 points for curve shape, 20 for duration, 15 for distance, 15 for direction.
Pass the frame range of the beat in your render (`--render-range 120:148`): you know it from the
timeline, and auto-detection misses sub-pixel motion at the very start or end of slow easings.

On the reference, fitted presets scored 97–99. The same moves with linear easing scored 50–80, and
with standard CSS easings (ease, ease-in-out, ease-out-cubic) 50–86. A score above about 90 means
the motion matches. Below about 80, the curve is the wrong shape.

## 8. Limits

- Beats where several elements move independently are measured as **timing only** (the `progress`
  channel): when and how fast, not which way.
- Rotation is not measured reliably; scale and translation are.
- One reference gives a style, not a rule. Section 2 lists what held across all four; anything
  else is one brand's taste. Measure two or three references of the kind the user wants before
  treating a new number as general.
- The three shorter references gave 11–31 clean beats each, so their libraries are mostly one-beat
  clusters. At 30 fps, beats shorter than 200 ms (6 frames) are counted but too short to fit. Their summary numbers (section 2) are sturdier than any single preset in them.

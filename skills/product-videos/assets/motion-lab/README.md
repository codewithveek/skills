# motion-lab

Measures how a reference video moves and turns it into **verified Remotion motion presets**. It also
scores any Remotion render against a reference. The starter kit's `src/kit/measured` presets were
made with it; `../../references/motion-data.md` explains the results and when to use them.

```
reference.mp4
  └─ analysis/analyze_motion.py       per-frame optical flow + pixel diff       → frames.csv, runs.csv, beats.csv
      └─ analysis/extract_beat_curves.py  one signed progress curve per beat      → beat-curves.json
          └─ npm run fit-presets       fit to Remotion spring() / Easing.bezier   → presets/ (library .ts, report)
              └─ analysis/verify_beats.py  render each preset, score vs reference → verification.csv
```

## Setup

```bash
npm install                       # Remotion renderer + bundler, React 18, TypeScript (strict)
pip install opencv-python numpy   # the analysis side
npm test                          # fitter tests (TS) + curve and score tests (Python)
```

Rendering uses Remotion's own Chrome download, or `REMOTION_BROWSER_EXECUTABLE` if set. This
project uses `@remotion/renderer` and `@remotion/bundler` only (not `@remotion/cli`), so it isn't
affected by the 4.0.531 Studio bug the starter pins around.

## Measure a reference

```bash
mkdir -p data/ref
ffprobe -v error -select_streams v:0 -show_entries frame=key_frame,best_effort_timestamp,best_effort_timestamp_time,pict_type -of csv=p=0 ref.mp4 > data/ref/pts.csv
python3 analysis/analyze_motion.py --video ref.mp4 --pts-csv data/ref/pts.csv --out-dir data/ref [--storyboard data/ref/storyboard.json]
python3 analysis/extract_beat_curves.py --motion-dir data/ref --out data/ref/beat-curves.json
npm run fit-presets -- --curves data/ref/beat-curves.json --out-dir data/ref/presets --source ref --export-name REF --runtime-import ./preset
```

- Frame rate and time base are read from the video (`--fps` / `--time-base` override them). Hold, beat
  and scene-snap thresholds are in milliseconds, so 24, 30 and 60 fps references are cut the same way.
- `python3 analysis/summarize_reference.py data/ref [data/other …]` prints beat lengths, where speed
  peaks, overshoot, anticipation, motion share and holds, for comparing references.
- Analysis takes about 10 minutes per 2 minutes of 60 fps 1080p on two cores.
- `--storyboard` (optional) is a JSON list of `{ "start_s", "label" }` approximate scene starts;
  each start is moved to the calmest nearby frame. Without it the video is one scene.
- `--from-frames-csv data/ref/frames.csv` rebuilds scenes, runs and beats without decoding again.
- Copy `data/ref/presets/motion-presets.ts` into a video project as `src/kit/measured/ref.ts`.

## Check presets and renders

| Step | Command | Output |
|---|---|---|
| Render one preset | `npm run render-check -- --fitted data/ref/presets/fitted-beats.json --beat-id 94 --easing best --out renders/b94.mp4` | mp4 + `.truth.json` (the exact curve played) |
| Score a render | `python3 analysis/score_render.py --render r.mp4 --reference-curves data/ref/beat-curves.json --beat-id 94 [--render-range 120:148]` | 0–100 + breakdown |
| Verify in batch | `python3 analysis/verify_beats.py --fitted … --reference-curves … --top 8 --easings best,linear` | `verification.csv` |
| Calibrate | `python3 analysis/calibrate_measurement.py renders/cal-*.mp4` | measured vs true curves |

`--easing` takes `best`, `spring`, `bezier`, `linear` or `named:<name>` (`named:css-ease-in-out` …).
The scorer's render window comes from `--render-range`, then the render's `.truth.json`, then
auto-detection (which misses sub-pixel motion at the very start and end of slow easings).

## How motion is measured

- **Beats.** A frame is moving when more than 0.05% of pixels change (luma delta above 8). Pauses
  shorter than 4 frames are merged into the motion around them. Each motion run is then split where
  speed drops below 35% of the peaks on both sides; beats are at least 6 frames long.
- **Channel per beat.** `translate_x`, `translate_y` or `scale` when one of them moves consistently in
  one direction (net travel at least 60% of the path), otherwise `speed`: timing only.
- **Core flow.** Movement is the mean optical flow of the dominant element's core pixels, meaning those
  moving at least half as fast as the fastest 5%. A plain mean over every moving pixel included the
  halo optical flow spreads around objects and under-read distance by 12–39%.
- **Scale** is fitted as a transform over core pixels, and per-frame rates are compounded.
- **Progress curve** = cumulative velocity ÷ travel, 0 → 1, overshoot above 1.

**Calibration** (`data/saas-launch/calibration.json`): known easings rendered in Remotion and measured
back. Shape error ≤ 0.46% RMSE across ease-out-cubic, ease-in, ease-in-out-cubic, linear, expo-out
(vertical), a bouncy spring and a scale; travel within ±1.5% after a fixed gain (translate ÷0.948,
scale ÷0.915); overshoot 0.375 measured vs 0.371 true.

## Fitting

- **Spring.** Remotion's `spring()` with `durationInFrames` set to the beat length. Once the length
  is fixed, only the damping ratio changes the shape, so the fitter searches damping (stiffness 100,
  mass 1), with and without `overshootClamping`.
- **Bezier.** Remotion's `Easing.bezier`: 12 named easings and a 0.2 grid, then coordinate descent
  down to 0.01. Y values may go outside 0–1 to allow back and anticipation curves.
- **Choosing.** The lower error wins; a spring is preferred within 0.003.
- **Library.** Beats with quality ≥ 0.6 and curve error ≤ 0.06 are grouped by shape (RMSE < 0.05).

## Scoring

Out of 100: 50 for shape (progress-curve RMSE on normalised time; 0.15 or worse scores 0), 20 for
duration and 15 for travel (log ratio; 2× or ½× scores 0), and 15 for direction.

## Included data: `data/saas-launch/`

A 108-second, 60 fps launch video for an AI web app, the source of the kit's `MOTION` presets.
Frames and video aren't included; the measurements are.

| File | What it is |
|---|---|
| `storyboard.json`, `scenes.csv` | 29 scenes |
| `runs.csv`, `beats.csv` | 147 hold/motion runs; 164 motion beats and 74 holds |
| `beat-curves.json` | 157 beat curves (channel, travel, per-frame velocity and progress) |
| `presets/` | `fitted-beats.json`, `preset-library.json` (54 clusters), `motion-presets.ts`, `fit-report.md` |
| `verification.csv`, `verification-vs-named.csv` | Fitted presets 97.3–99.3 vs linear 49.8–80.5 and stock CSS easings 49.8–85.7 |
| `calibration.json` | The calibration results above |

## Included data: three shorter references

Measured the same way at 30 fps (`summarize_reference.py` gives the comparison table in
`references/motion-data.md`):

| Folder | Reference | Beats fitted / in library | Presets |
|---|---|---|---|
| `data/furniture-launch/` | 27 s furniture brand launch, 1080p | 34 / 19 | 13 clusters |
| `data/api-launch/` | 25 s developer API launch, 720p | 25 / 11 | 10 clusters |
| `data/voice-app-launch/` | 44 s voice-dictation app launch, 720p | 49 / 31 | 24 clusters |

Each holds `scenes.csv`, `runs.csv`, `beats.csv`, `beat-curves.json` and `presets/`; frames and video
aren't included.

## Limits

- Scale and rotation need a single dominant element; rotation is not measured reliably.
- `speed` beats give timing only and replay as a horizontal move.

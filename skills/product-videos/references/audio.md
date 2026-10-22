# Audio: voice, music, sound effects

Remotion mixes audio itself: `<Audio>` elements inside sequences play at their frames, with a
`volume` that can be a function of the frame. The starter's `makeVideo` already places narration,
music (ducked under the voice), a whoosh on each transition, and the cursor's click sounds.

## Contents

1. Choosing tools (and their licences)
2. Voiceover
3. Music
4. Sound effects
5. Levels and loudness
6. Checking audio you cannot hear
7. ElevenLabs through MCP

---

## 1. Choosing tools

| Need | Option | Cost / licence | Notes |
|---|---|---|---|
| Voice, free, local | **Kokoro-82M** via `kokoro-js` (in the kit) | Apache-2.0; commercial use allowed | Runs on CPU at ~1.4× real time; clear, slightly flat. Best voice: `af_heart` (grade A), then `af_bella`. 28 English voices. |
| Voice, best quality | **ElevenLabs** | Free tier forbids commercial use and needs attribution; Starter ($6/mo) and up allow commercial use | Most natural; also gives timestamps. Hosted MCP for Claude Code. |
| Voice, other APIs | OpenAI, Google, Azure TTS | Per-character pricing; check each provider's disclosure rules for AI voices | Fine alternatives; same pipeline. |
| Music, free, no licence | **The kit's synthesiser** (`npm run music`) | Original, no third party | Upbeat pop-house (128 BPM) or a calm modern beat (100 BPM), mixed to match measured launch tracks (section 3). Fine to ship; a licensed or AI track adds a melody people remember. |
| Music, AI | **ElevenLabs Music** | Commercial from Starter; free requires "Eleven Music" credit | Prompt for mood, tempo, length. |
| Music, local AI | Stable Audio Open Small | Stability Community Licence: free under $1M annual revenue | Needs a Hugging Face account and Python; heavy on CPU. |
| Music, library | Pixabay Music, YouTube Audio Library | Free commercial use | Pixabay tracks can trigger YouTube Content ID claims; its licence certificate clears them. |
| Avoid for commercial work | MusicGen weights | CC-BY-NC | Non-commercial only. |
| Sound effects | **The kit's synthesiser** (`npm run sfx`): click, whoosh, pop | Original, no third party | Section 4. |
| Other sound effects | freesound.org CC0, `@remotion/sfx` (CC0 subset) | CC0: no attribution | For a ding or a page turn. Most of `@remotion/sfx` is memes. |

Tell the user which licences apply to what you delivered, and that AI voices are AI-generated.

## 2. Voiceover

The kit's pipeline (`scripts/voice.mts`):

1. Each video's `narration.ts` lists lines per scene: `{ at, text, say? }`. `at` is the frame the
   line aims to start on; `say` is the respelt version for the voice.
2. `npm run voice` generates each line as its own clip (cached by text, voice and speed, so only
   changed lines regenerate), normalises each to -1 dBFS peak, places them (a line starts at `at`,
   or after the previous line plus a 6-frame gap), and writes `voice.json` with every line's frames
   and each scene's `minFrames` (the end of its last line + a short tail + the crossfade).
3. `makeVideo` lengthens scenes to `minFrames`, plays each clip at its frame, and ducks the music.
4. Scenes can read `voice.json` (`lineAt(VOICE, scene, n)`) to time on-screen words to the voice —
   essential for kinetic text.

Generating per line gives exact sentence timings for captions without a speech-to-text pass.

Switching to ElevenLabs or another API: replace `speak()` in `scripts/voice.mts` with an API call
that writes a WAV (or MP3) and returns its duration; keep the rest. Put API keys in an environment
variable or a git-ignored `.env`, never in the code.

## 3. Music

`npm run music` writes two tracks into `public/music/` (about 25 s):

| Track | Tempo | What's in it | Use for |
|---|---|---|---|
| `upbeat.wav` | 128 BPM, E minor | Four-on-the-floor kick with sidechained bass, claps on 2 and 4, offbeat hats and a shaker, syncopated supersaw chord stabs, a bell arpeggio in the lift sections, a riser and impact into every new section | Launches: showcase, graphic, studio |
| `bed.wav` | 100 BPM, C major | A soft kick, claps and swung hats, electric-piano chords, a sub, sparse bells | Tutorials, editorial, cinematic |

The upbeat track is built in sections (4-bar intro, then 8 bars groove, 6 lift, 2 break, repeating),
so energy rises and falls. A bar is 4 × 60 / BPM seconds: 1.875 s (56 frames at 30 fps) at 128 BPM,
2.4 s (72 frames) at 100 BPM. Cutting scenes on bars makes a music-led video feel edited to the track.
`MUSIC_BPM` changes the upbeat tempo and `MUSIC_SECONDS` the length (default 90 s; the end fades).

**How it was tuned.** Four professional launch videos were measured (spectrum, tempo, the share of
energy in transients, stereo width), and the mix was fitted to them stem by stem:

| | Tempo | Under 60 Hz | 60–250 Hz | 250 Hz–2 kHz | Above 2 kHz | Centroid | Transient share | Width |
|---|---|---|---|---|---|---|---|---|
| AI web app launch | 132 | 27% | 49% | 16% | 8% | 3.0 kHz | 0.34 | 0.32 |
| Furniture launch | 99 | 7% | 65% | 26% | 2% | 1.4 kHz | 0.19 | 0.00 |
| Developer API launch | 120 | 41% | 45% | 12% | 2% | 1.9 kHz | 0.14 | 0.32 |
| Voice app launch (piano-led) | 110 | 2% | 38% | 56% | 4% | 1.9 kHz | 0.29 | 0.03 |
| **Kit `upbeat.wav`** | 128 | 26% | 55% | 15% | 4% | 3.2 kHz | 0.20 | 0.23 |
| **Kit `bed.wav`** | 100 | 9% | 55% | 31% | 5% | 1.5 kHz | 0.22 | 0.23 |
| Previous kit synth (for comparison) | 92–103 | 0–4% | 18–31% | 59–81% | 1–6% | 0.8–2.4 kHz | 0.01–0.11 | 0.27–0.29 |

Transient share is the fraction of energy in percussive hits (harmonic–percussive separation). The old
synth sat in the low mids with almost no transients, which is what made it sound muffled and flat.

- **Levels.** Both tracks are normalised to −13 LUFS integrated, true peak ≤ −1 dBTP, so the
  per-video levels in `Root.tsx` hold whichever track (or tempo) you use: about 0.5–0.6 alone and
  0.16 under the voice for launches, 0.3 and 0.11 for tutorials. The duck ramps over 8 frames.
- One track under the whole video, longer than the video, faded in over 20 frames and out over the
  last 50.
- **Swapping.** Drop a file at `public/music/bed.wav` or `upbeat.wav`, or point the video's entry in
  `Root.tsx` at another file. Normalise it near −13 LUFS too, or adjust the levels.
- **Re-fitting the mix** (after changing an instrument): `MUSIC_STEMS=<dir> npm run music` writes each
  track's stems unlevelled; fit the stem gains (`UPBEAT_MIX`, `BED_MIX` in `scripts/audio/tracks.mts`)
  so the bands and transient share land inside the reference ranges above, then render and measure
  the real mix. Summed stem measurements are only an estimate for the transient share.

## 4. Sound effects

`npm run sfx` writes three effects into `public/sfx/`, synthesised (`scripts/audio/effects.mts`):

| Sound | What it is | Plays | Level |
|---|---|---|---|
| `mouse-click.wav` | A crisp trackpad click: a 4.2 kHz tick with a light knock, then a softer release 45 ms later (120 ms) | Every `Cursor` click, 1 frame early | 0.38 |
| `whoosh.wav` | Airy band-passed noise whose pitch rises with its loudness, travelling left to right, a low thump under the peak (0.62 s, peak at 0.3 s) | Every scene transition, 3 frames before the crossfade, so it peaks mid-transition | the look's `whoosh` (0.1–0.2) |
| `pop.wav` | A sine gliding 380 → 1,100 Hz in about 30 ms with a tiny transient (0.2 s) | `<Sfx name="pop" at={frame} />` on the landing frame | 0.3 |

`Sfx` (`src/kit/sfx.tsx`) plays any of them at a frame. Fewer is better: a pop on the one element a
scene is about (the badge, the number, the word that lands), not on every chip; no sound for typing;
no meme sounds. Optionally one soft ding for a success state, once per video at most.

## 5. Levels and loudness

- Voice clips peak at -1 dBFS (normalised at generation).
- After rendering, `normalise.sh` runs two-pass `loudnorm` to **-16 LUFS integrated, -1.5 dBTP**,
  copying the video stream untouched. -16 LUFS sits well on YouTube, social feeds and laptops.
  Without it, a voice-and-music mix lands around -19 LUFS and sounds quiet next to other videos.

## 6. Checking audio you cannot hear

`node scripts/audio-report.mjs <file.mp4|file.wav>` prints the peak, RMS, the spectrum split and a
loudness timeline (`#` voice-level, `+` music or effects, `.` quiet, space silent, one character per
0.1 s). Use it to confirm:

- The voice is present where the narration should be, with music between lines (alternating `#`
  and `+`), not silence.
- Nothing clips (peak below 0 dBFS; after normalising, about -1.5).
- Music has weight and a top. The three beat-driven launch tracks measured 72–86% of energy under
  250 Hz (kick and bass) and a centroid of 1.4–3 kHz; a track with most of its energy between 250 Hz and 2 kHz and a centroid
  under 1 kHz sounds boxy and muffled, unless it's a piano or acoustic piece.
- Speech looks like speech: most energy under 1 kHz, a little above 4 kHz.

Read 32-bit float WAVs as float (Kokoro writes them): reading them as 16-bit gives nonsense numbers
that look like hiss.

## 7. ElevenLabs through MCP

ElevenLabs hosts an MCP server for Claude Code (text-to-speech, music, sound effects, voice design):

```bash
claude mcp add --transport http elevenlabs https://api.elevenlabs.io/v1/mcp
# then /mcp in an interactive session to sign in with OAuth
```

The older self-hosted `elevenlabs-mcp` package is archived. Sign-in needs an interactive session;
if the current one isn't, ask the user to run it. MCP is handy for auditioning voices and music;
for repeatable builds, a script calling the API with a key from the environment is easier to re-run.

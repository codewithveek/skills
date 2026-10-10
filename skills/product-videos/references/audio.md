# Audio: voice, music, sound effects

Remotion mixes audio itself: `<Audio>` elements inside sequences play at their frames, with a
`volume` that can be a function of the frame. The starter's `makeVideo` already places narration,
music (ducked under the voice), a sound for each transition, the cursor's click sounds, and the
sounds the motion blocks make (a stamp landing, a card dealt, an odometer ticking).

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
| Voice and music, through Claude | **Higgsfield's Claude connector** | Per Higgsfield's plan | Used for the voiceover and music of the Taeillo ad (October 2026). Check the connector directory; if it isn't connected, the user adds it in their claude.ai connector settings. |
| Voice, other APIs | OpenAI, Google, Azure TTS | Per-character pricing; check each provider's disclosure rules for AI voices | Fine alternatives; same pipeline. |
| Music, free, no licence | **The kit's synthesiser** (`npm run music`) | Original, no third party | Five presets: one per look plus a calm bed; `MUSIC_SEED` for variations. Serviceable, not memorable: flag it as a placeholder for a launch. |
| Music, recorded, CC0 | OpenGameArt (filter: Music, CC0), Free Music Archive (filter: CC0) | CC0, but check each track's page | Fetch with `npm run fetch-music` (below). Much of OpenGameArt is game music (chiptune, battle themes): search for "loop", "ambient", "lo-fi", "corporate". FreePD (freepd.com) has closed. |
| Music, AI | **ElevenLabs Music** | Commercial from Starter; free requires "Eleven Music" credit | Prompt for mood, tempo, length. |
| Music, local AI | Stable Audio Open Small | Stability Community Licence: free under $1M annual revenue | Needs a Hugging Face account and Python; heavy on CPU. |
| Music, library | Pixabay Music, YouTube Audio Library | Free commercial use in a video; no redistribution | Pixabay tracks can trigger YouTube Content ID claims; its licence certificate clears them. Fine to fetch for a user's video; never commit. |
| Music, attribution | Incompetech (Kevin MacLeod), ccMixter | CC-BY: credit required in the video or its description | Tell the user the exact credit line to publish. |
| Avoid for commercial work | MusicGen weights | CC-BY-NC | Non-commercial only. |
| Sound effects, in the kit | `public/sfx/`: 15 sounds from Kenney's CC0 packs, `@remotion/sfx`'s CC0 subset and the kit's synth (`npm run sfx`) | CC0 or original: ship freely, no attribution | Listed with sources in `public/sfx/CREDITS.md`. Covers clicks, transitions and every motion block. |
| More sound effects, CC0 | Kenney packs (kenney.nl/assets: Interface, UI Audio, Impact, Digital Audio …), freesound.org with the CC0 filter, OpenGameArt with the CC0 filter | CC0 | Kenney is consistent and clean; Freesound needs an account to download; check the licence of every Freesound/OpenGameArt file, it varies per file. |
| Sound effects for one video only | Pixabay, Mixkit, YouTube Audio Library | Free to use in a video, **not** to redistribute | Fine for a user's own video; never commit them into the kit or a shared repo. |

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

### Matching a reference voice

When the user points at a video and says "a voice like that", measure it, because you can't listen:

1. Isolate the speech: Whisper (`faster-whisper`, `small.en`) gives the words with timings; the gaps
   are music.
2. Measure on the speech only: **pace** (words per minute while speaking), **pitch** (median and the
   10–90% range in Hz; `librosa.pyin`), **range** in semitones (expressiveness), and pauses.
3. Generate the same script in candidate voices, measure them the same way, and pick the nearest;
   then make a file that plays the original line followed by the candidates, for the user to judge.

The Taeillo ad's voice (an excited, punchy read) measured: about 180 wpm while speaking, median
pitch 135–150 Hz, range about 120–235 Hz (11 semitones). Kokoro voices measured on the same script
at speed 1.15:

| Kokoro voice | Median pitch | 10–90% | Range | Read |
|---|---|---|---|---|
| `am_fenrir` | 129 Hz | 91–192 Hz | 12.8 st | The closest to an energetic male ad read |
| `bm_george` | 139 Hz | 114–161 Hz | 6.0 st | Right pitch, much flatter (British) |
| `am_eric` | 156 Hz | 111–195 Hz | 9.8 st | Brighter, fast |
| `am_puck` | 106 Hz | 87–173 Hz | 11.9 st | Lower, lively |
| `am_michael` | 108 Hz | 67–139 Hz | 12.8 st | Low, calm narrator |
| `af_heart` | 199 Hz | 164–248 Hz | 7.2 st | The kit's default: warm, even female narrator |
| `af_bella` | 198 Hz | 172–248 Hz | 6.4 st | Similar to af_heart, slightly flatter |

Kokoro reads evenly: it can't really shout "OMG!" or sound surprised. For hype reads, accents
(for example a Nigerian or Indian English voice for a market the product serves) and acted emotion,
use ElevenLabs (its voice library and emotion tags) or Higgsfield's connector, and say which.

## 3. Music

- One track under the whole video, looping or longer than the video, faded in over 20 frames and out
  over the last 50.
- Level: about 0.3 alone, 0.11 under the voice for tutorials; 0.5 alone, 0.16 under the voice for
  launches; 0.6 alone for music-led videos (`Root.tsx` per video). The duck ramps over 8 frames.

**The kit's presets** (`npm run music`, all original, all levelled to -14 LUFS so swapping one for
another doesn't change the mix):

| Preset | Tempo | Sound | Default for |
|---|---|---|---|
| `bed` | 92 | Pads, plucked arpeggio, bass; no drums | Tutorials under a voice |
| `upbeat` | 104 | The bed with a light kick and hats | The Studio look |
| `editorial` | 88 | Bright major chords on electric piano, bell plucks, soft kick and hats | The Editorial look |
| `graphic` | 120 | Four-on-the-floor kick, clap, 16th hats, saw arpeggio, pumping pads | The Graphic look |
| `cinematic` | 68 | Long wide pads, a low drone, sparse bells; no drums | The Cinematic look |

- A video uses its look's preset unless its entry in `Root.tsx` names a file.
- `MUSIC_SEED=<n> npm run music` makes a variation (another key, chord order and arpeggio), so two
  videos in a series don't sound identical. Note the seed in the delivery report.
- Each preset writes `<preset>.beats.json`. Cut on the beat with `src/kit/beats.ts`: `bars(2, BPM.graphic)`
  for a scene length that lands on the downbeat, `onBeat(frame, bpm, 4)` to snap a stamp or a slab to
  the nearest bar line. Graphic videos especially should cut on bars.
- The synth is serviceable, not memorable. For a launch, offer a real track.

**A real track, fetched for one video** (never committed into the kit):

```bash
NODE_USE_ENV_PROXY=1 npm run fetch-music -- <audio file URL or path> --name launch \
  --licence "CC0" --credit "Artist – Title" --source <the track's page> --bpm 100
```

It writes `public/music/launch.wav` (levelled like the presets), `launch.beats.json` if `--bpm` is
given, and a row in `public/music/CREDITS.md`; then name `"music/launch.wav"` in `Root.tsx`. It
refuses to run without a licence and credit: read the licence on the track's page first. CC0 and
public domain need nothing; CC-BY needs the credit published with the video; library licences
(Pixabay, YouTube Audio Library) allow use in the video but not redistribution, so the file stays in
the video project. Tell the user which applies.

## 4. Sound effects

The kit's effects live in `public/sfx/` and are listed, with a length and a default level, in
`src/kit/Sfx.tsx`. Most are played for you:

| Moment | Sound | Who plays it | Level |
|---|---|---|---|
| Every cursor click | `click` (mouse-click.wav), 1 frame before the click | `Cursor` | 0.38 |
| Crossfade | `whoosh`, 3 frames before | `makeVideo`, from the look | 0.2 |
| Focus pull | `air`, a soft swell | `makeVideo` | 0.32 |
| Circle reveal, zoom-through | `riser`, ending as the new scene covers the old | `makeVideo` | 0.3 |
| Colour slab | `thump`, as the slab covers the frame | `makeVideo` | 0.3 |
| Panel grow | `open` | `makeVideo` | 0.16 |
| Push | `swish` | `makeVideo` | 0.3 |
| Hard cut | none: the cut is the sound | — | — |
| A card dealt | `swish` as it flies, `land` as it lands | `Dealt` | 0.3 |
| A stamp | `stamp`, 2 frames after it starts | `Stamp` | 0.42 |
| A card flip | `swish`, then a softer `land` | `Flip` | 0.3 |
| A number rolling | a `tick` per step when it changes 15 times or fewer; else one tick as it lands | `Odometer` | 0.22 |
| A limit hit | `alert` when the rule turns red | `RuleLabel hot` | 0.2 |
| A list stepping | a `tick` per step | `WordSlot` | 0.22 |
| Tiles swirling, items orbiting | one `swish` at the start | `Swirl`, `Orbit` | 0.3 |
| Pixels appearing / collapsing | `glitch` ×3, then once on collapse | `DotMatrix` | 0.18 |
| A name landing in a grid cell | `blip` | `GridCell` | 0.16 |
| A good, resolved state (Ready, Passed, Saved) | `confirm`, once per scene at most | you: `<Sfx name="confirm" at={…} />` | 0.24 |
| A light switching on (the dark-room hook) | `switch` | `LightSwitch` | 0.45 |
| A short line typing out (a headline, a URL) | a key per character, four varied keys | `Typewriter`, `UrlPill` | 0.16 |
| A word slamming in ("But", "THIS?") | a soft `thump` | `Punch` | 0.21 |
| Cards shooting in, dropping into a box; the lid shutting | `whoosh`, `swish`, `land`; `thump` | `CardDeck`, `Crate` | as above |

Each look has a **sound palette** (`sfx` in `src/kit/looks.ts`): which sound each transition makes,
swaps (Graphic turns `land` into `pop`; Editorial turns `blip` into `pop`) and an overall level
(Cinematic plays at half level and drops ticks, pops and blips). Scenes don't change between looks;
the palette does.

- Place one-off sounds with `<Sfx name="confirm" at={96} />` inside a scene; `endAt` aligns the end
  instead (a riser that must peak on a cut). Every motion block takes `sound={false}` to stay quiet.
- **Fewer is better.** One confirm per scene at most, typing sounds only for short typed lines (a
  headline, a URL; never a paragraph), no effects under footage (just the music), no sound
  on every pop-in, no meme sounds. A dozen effects in a 40-second video is plenty; the kit's defaults
  are set for that.
- **Under a voice,** effects must not cover words. The music ducks under narration, but effects
  don't: keep stamps and thumps off narrated lines, or pass `volume={0.5}`.
- **Small speakers.** A hit with nothing above 250 Hz is silent on a phone. Every kit sound has mid
  or high content; check new ones with the band test in section 6.
- **Adding a sound:** only CC0 or your own (`scripts/sfx.mts` shows how to synthesise one).
  Convert to 48 kHz mono WAV, normalise (`loudnorm=I=-16:TP=-1`), add it to `SFX` with its length in
  frames and a level, and list it in `public/sfx/CREDITS.md`.

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
- Music isn't all bass: a bed with more than ~70% of its energy under 250 Hz will sound boomy.
- Speech looks like speech: most energy under 1 kHz, a little above 4 kHz.

**Hearing the effects on their own.** Effects are short and sit under the music, so the report of a
whole mix barely changes when they are added. To check them, render once with effects off (set the
look's `sfx.level` to 0) and once with them on, then subtract:

```bash
ffmpeg -i out/with.mp4 -i out/without.mp4 -filter_complex \
  "[0:a][1:a]amerge=inputs=2,pan=mono|c0=0.5*c0+0.5*c1-0.5*c2-0.5*c3" fx-only.wav
node scripts/audio-report.mjs fx-only.wav
```

The timeline then shows only the effects: each should appear where its moment is. Normalise neither
file first (or match their gains), or the difference will contain music. A stamp or a land should
reach the music's level; transition sounds sit 3–8 dB under it; ticks are transients and cut through
regardless.

**Band test** (is there anything a laptop can play?):
`ffmpeg -i s.wav -af highpass=f=250,astats -f null - 2>&1 | grep "RMS level" | tail -1`, compared
with the same without the high-pass. More than ~15 dB lower means it will vanish on small speakers.

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

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
| Music, free, no licence | **The kit's synthesiser** (`npm run music`) | Original, no third party | Calm bed or upbeat; serviceable, not memorable. Flag as a placeholder. |
| Music, AI | **ElevenLabs Music** | Commercial from Starter; free requires "Eleven Music" credit | Prompt for mood, tempo, length. |
| Music, local AI | Stable Audio Open Small | Stability Community Licence: free under $1M annual revenue | Needs a Hugging Face account and Python; heavy on CPU. |
| Music, library | Pixabay Music, YouTube Audio Library | Free commercial use | Pixabay tracks can trigger YouTube Content ID claims; its licence certificate clears them. |
| Avoid for commercial work | MusicGen weights | CC-BY-NC | Non-commercial only. |
| Sound effects | `@remotion/sfx` (CC0 subset), freesound.org CC0 | CC0: no attribution | Most of `@remotion/sfx` is memes; use mouse-click, whoosh, page-turn, ding. |

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

- One track under the whole video, looping or longer than the video, faded in over 20 frames and out
  over the last 50.
- Level: about 0.3 alone, 0.11 under the voice for tutorials; 0.5 alone, 0.16 under the voice for
  launches (`Root.tsx` per video). The duck ramps over 8 frames.
- Calm for tutorials (no drums), upbeat for launches and cutdowns (a light kick and hats).
- To swap, drop a file at `public/music/bed.wav` or `upbeat.wav` (or point the video's entry in
  `Root.tsx` at another file). The mix code doesn't change.
- The kit's synth makes music that is warm and dark (most energy under 1 kHz). That sits well under a
  voice; alone, it can feel muffled. Say so, and suggest a real track for a launch.

## 4. Sound effects

| Moment | Sound | Level |
|---|---|---|
| Every cursor click | `mouse-click.wav`, starting 1 frame before the click | 0.38 |
| Every scene transition | `whoosh.wav`, 3 frames before the crossfade | 0.2 |
| Optional: success state | a soft ding, once per video at most | 0.25 |

Fewer is better. No sound for typing (it gets tiring), no sound on every pop-in, no meme sounds.

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

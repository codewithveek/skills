# Scriptwriting

The script is three layers that run together: **headlines** on screen, **narration** spoken, and
**captions** (the narration, written down). Write them together, scene by scene.

## Contents

1. Working from the user's script
2. The word budget
3. Headlines
4. Narration
5. The claim audit
6. Pronunciation
7. Captions
8. Names and taglines
9. A worked example

---

## 1. Working from the user's script

Users often bring a script or a rough idea ("open with 'want to run an affiliate program?', then
'Introducing X'"). Treat it as intent, not final copy:

- Keep their structure and voice; tighten wording, and say what you changed and why in a line each.
- Check every claim against the product (section 5). If a line promises something the product
  doesn't do ("globally" when it pays out in eight currencies), propose an accurate version and
  explain the gap. Never quietly ship an overclaim.
- If a line would not fit its scene (section 2), offer a shorter version rather than stretching the
  scene.

When you need a script from them, ask for it in this shape (any of it is optional):

```
Audience: who watches, and what they should do after
Problem: the pain, in their words
Promise: the one sentence the product delivers
Moments: the 3–5 things to show, in order
Close: the call to action, a URL or date
Tone: e.g. confident and plain / playful / technical
Must say / must not say: names, phrases, legal lines
```

## 2. The word budget

Narration runs at about **2.5 words per second** (150 wpm) with a good TTS voice. At 30 fps:

| Scene | Seconds | Words of narration |
|---|---|---|
| Title / introducing | 3 | 3–6 |
| Problem line | 3 | 6–8 |
| Product moment | 6–8 | 10–16 |
| End card | 4–5 | 5–10 |

Leave about half a second of silence before each scene's crossfade. If a line is over budget,
shorten it; the voice script will otherwise lengthen the scene and the visuals will hold still.

## 3. Headlines

The on-screen line above the app window. It says what the step achieves, not what the button says.

- 4–9 words, one line at 1920 wide (about 50 characters at 50 px). Shorter in 9:16.
- An eyebrow names the section: "Step 3 · Tracking and signup", "Verify", "Pay".
- Concrete beats clever: "Decide when commissions become payable." not "Payday, your way."
- No full stop on fragments that read as labels; a full stop on sentences. Pick one per video.
- Never contradict the screen: the headline and the UI must agree on names.

## 4. Narration

- Say what the screen is showing, as it shows it. Pin each line to the frame of its action with
  `at`, so the voice lands on the click, not after it.
- One idea per sentence. Short sentences survive TTS better than long ones.
- Plain words; no jargon the audience wouldn't use. Spell numbers as the voice should say them in
  `say` ("twenty-one day hold window") and as people read them in `text` ("21-day hold window").
- Don't read the headline verbatim; complement it. The headline names the step; the voice adds the
  why or the detail.
- Avoid filler openers ("So,", "Now let's"). Start with the verb or the noun.
- The problem section can be punchier; product moments should be calm and exact.

## 5. The claim audit

Before recording, list every claim the script makes and where in the product it is true:

| Claim | Evidence |
|---|---|
| "Paying affiliates across borders" | Payout currencies: NGN, KES, GHS, UGX, TZS, ZAR, XOF, USD (onboarding form) |
| "Stop fraud before it's paid" | Conversions are scored before a commission is written (README; fraud engine) |
| "Nobody is paid twice" | One idempotency key per affiliate per cycle; confirm dialog says so |

Words that usually overclaim: globally, anywhere, instantly, real-time, any, all, never, always,
automatic, effortless, secure (unqualified). Use the precise version: "across borders", "in eight
currencies", "within the hold window".

## 6. Pronunciation

TTS voices misread names, currencies and acronyms. Kokoro phonemises with espeak (the `phonemizer` package comes with kokoro-js); check a word's
phonemes before generating:

```bash
node -e 'import("phonemizer").then(async ({phonemize}) => console.log(await phonemize("Afriex", "en-us")))'
```

Respell in `say` until the phonemes match, and keep `text` correct for captions. Examples that
worked: "Afri-ex" (Afriex), "Nyra" (naira), "Oh-kah-for" (Okafor), "C S V" (CSV). Some names can't
be fixed (espeak inserts "em" before "Mw…"); rephrase to avoid them. Avoid speaking codes and
identifiers (kb-2240, HMAC-SHA256) at all; show them, say what they are.

## 7. Captions

With a voiceover, the captions are the narration, one cue per sentence, timed to the spoken line
(`scripts/vtt.mts` does this). Without one, the timeline's cues describe the on-screen text and
action in brackets: `[The link is created and copied]`. Keep a cue to two lines of about 42
characters. Burn captions into vertical cutdowns (`social.md`).

## 8. Names and taglines

If the product has no name yet, offer three to five with a reason each and a recommendation, and
note that you haven't checked trademarks or domains. A good tagline names the job and the
difference: "Affiliate payouts, across borders." Put both in `src/brand.ts`.

## 9. A worked example (a 55 s launch)

| Scene | Headline / on screen | Narration |
|---|---|---|
| Problem | "Running an affiliate program is easy." / "Paying affiliates across borders isn't." (cities roll) / "And money paid out to fraud never comes back." | the same three lines |
| Intro | "Introducing Corridor" | "Introducing Corridor." |
| Pitch | Three cards: Track every referral · Stop fraud before it's paid · Pay in their own currency | "Track every referral, stop fraud before it's paid, and pay affiliates in their own currency." |
| Share | "A link for every channel." | "Affiliates make a link for every channel." |
| Track | "Every click, conversion and dollar, at a glance." | "Every click, conversion and dollar, tracked in one place." |
| Verify | "Suspicious sales wait for a reviewer." | "Anything suspicious waits for a reviewer, with a reason for every decision." |
| Pay | "Settled in each affiliate's own currency." | "Then payouts settle through Afri-ex, in each affiliate's own currency." |
| Close | "Track. Verify. Pay across borders." → Corridor · Affiliate payouts, across borders. | "Track. Verify. Pay across borders." … "Corridor." |

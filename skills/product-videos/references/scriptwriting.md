# Scriptwriting

The script is three layers that run together: **headlines** on screen, **narration** spoken, and
**captions** (the narration, written down). Write them together, scene by scene.

## Contents

0. Story first: hook, pain, solution, CTA
1. Working from the user's script
2. The word budget
3. Headlines
4. Narration
5. The claim audit
6. Pronunciation
7. Captions
8. Names and taglines
9. A worked example
10. On-screen words without a voice: reading time and rhythm

---

## 0. Story first: hook, pain, solution, CTA

The prompt is the small part of a good video; the story, the storyboard, the assets and taste are
the rest. Settle the story before any scene is drawn. Every product video has four parts:

| Part | Job | Typical length | Example (Box, a multi-vertical business platform) |
|---|---|---|---|
| **Hook** | Make the right viewer stop: recognise themselves | 5–10 s | "Your business has never been one thing." The creator who runs a blog → sells digital products → consults; the salon that takes appointments → sells haircare products; the padel club that rents out courts → has a café → sells apparel and kits |
| **Pain** | Name the cost of today's way, in their words | 5–8 s | "But most tools are built for just one flow. So you either shrink to fit, or juggle multiple tools." |
| **Solution** | The turn, the name, then the product doing the job | 15–25 s | "What if you didn't have to?" → "Introducing Box." → tell Box how you sell, add what you sell, collect payments, pick a look and go live, see every sale land |
| **CTA** | One thing to do now | 3–6 s | "Now live." + the URL typed into a search bar |

**Angles** (pick one; mixing two is fine, as Box mixes problem → solution with a "what if" turn):

1. **Problem → solution**: the pain, then the fix. The default for launches.
2. **Before / after**: the same job, the old way and the new way.
3. **What if**: imagine the job without the pain, then show it's real.
4. **A day in the life**: one person's day, the product at the moments it helps.
5. **Fast feature tour**: five or six features, one beat each, on a strong rhythm.
6. **Teaser**: the problem and a name, no product shown; a date.

**Drafting the story with the user.** Ask one question at a time (who it's for, what they do today,
what hurts, what the product does about it, what they should do after), and play back your
understanding before writing. Then propose **three angles with three hooks each**, each hook with the
picture that carries it, and let them pick. Write the story as numbered lines, marked hook / pain /
solution / CTA, and wait for approval before the storyboard. Draft pain and solution from what the
user and the product say; don't invent claims to make the story land.

The storyboard then turns each line into scenes: time range, what's on screen, the exact words, the
sound (or "no sound effects, just the music"), and the transition. Check the total length and cut
before building: if it runs over a minute, the scenes are trying to say too much.

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

## 10. On-screen words without a voice: reading time and rhythm

Music-led videos (Editorial, Graphic, Footage, Poster) have no narration: the words on screen are
the script, so they must stay up long enough to read.

- **Reading speed:** 160–180 words a minute (the BBC subtitle guideline), about **a third of a second
  per word**, plus half a second to find the line. Five words need about two seconds. The kit's
  `readFrames(text)` (`src/kit/beats.ts`) returns the frames a line needs; a scene or phrase must hold
  at least that long after its last word lands.
- **Change something every 2–4 seconds** (a new phrase, a cut, a move): a pattern interrupt keeps
  attention. But **vary the lengths** (1 s, 4 s, 2 s, 3 s), or the rhythm turns monotonous.
- **Never leave the screen empty** while waiting for the next thing; hold the resolved state.
- **Length:** launches, updates and ads run 30–60 s (Box: 43 s, Taeillo: 27 s).
- **One idea per line, five to eight words.** Long sentences get split across phrases (Box's
  "But most tools are built for / just one flow.").
- With a voiceover, on-screen words are fewer than spoken words: one or two words per beat, landing
  with the voice (Taeillo shows "walk into your home", "and ask", "OMG!", "THIS?" as it's said).


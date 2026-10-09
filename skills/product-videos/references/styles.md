# Video types

Proven structures. Pick one, adapt the beats to the product, and show the user a storyboard before
building. The type sets the structure; the **visual style** (Studio, Editorial, Graphic, Cinematic)
sets how it looks and moves, and each type has a recommended one: see `visual-styles.md`. Lengths assume narration at about 2.5 words per second (150 wpm).

## Contents

1. Launch video
2. Feature drop / "what's new"
3. Tutorial / walkthrough
4. Explainer ("how it works")
5. Kinetic-type teaser
6. Dashboard / metrics reveal
7. Developer integration
8. Onboarding welcome
9. Before / after
10. Social cutdown
11. Pacing, transitions and camera language

---

## 1. Launch video

For: announcing a product. 40–60 s, 16:9 first. Upbeat music, voiceover, the most polish.

| Beat | Length | What happens |
|---|---|---|
| Problem | 6–10 s | Two or three short lines that build tension. "Running an affiliate program is easy." → "Paying affiliates across borders isn't." → "And money paid out to fraud never comes back." Kinetic words timed to the voice. |
| Introducing | 3 s | "Introducing [Name]": the mark springs in, the name slides out. |
| Pitch | 5–7 s | One sentence, three parts, each landing as said (three cards with icons). |
| Product moments | 4 × 6–8 s | The core verbs of the product (Share / Track / Verify / Pay). Each: a short headline, one real screen, one visible action or change. |
| Close | 5 s | The verbs as beats ("Track. Verify. Pay across borders."), then the mark, name, tagline, and a call to action pill. |

Rules: the problem must be specific to what makes this product different; vague problems ("want to
run a program?") create no tension. Every claim in the pitch must be visible later. The product
moments should be the strongest real screens: a chart drawing in, a status flipping to Settled, a
confirmation appearing.

## 2. Feature drop / "what's new"

For: one new feature to existing users. 20–40 s. "New: [feature]" title, the old way in one line,
the feature in two or three moments, where to find it. Minimal problem section; users already
care.

## 3. Tutorial / walkthrough

For: teaching a job, step by step. 45–75 s per job; split longer jobs into a series. Calm music bed,
voiceover.

| Beat | What happens |
|---|---|
| Title card | Audience eyebrow ("For program owners"), the job as the title, one sub-line |
| Steps | "Step N · Name" eyebrow + a one-line headline; one screen; the cursor does the real action (type, choose, click Save); show the real feedback ("Policy saved.") |
| End card | What they can do now, and "Next: [the next video]" |

Rules: one action per step, named the way the UI names it. Show the confirmation the app really
shows; if it shows none, show the resulting state instead. Use the app's real defaults and
placeholders in fields. A series reads best when videos share a data story (the same example
company, people and numbers flow from one video to the next).

## 4. Explainer ("how it works")

For: a flow or a model (how money moves, how scoring works). 45–60 s. Diagram-led, at full frame
size, not inside an app window.

Building blocks: a stage rail (1 · Click, 2 · Sale …) showing where we are; panels; notes with icons;
code cards; a meter with thresholds; a table of cases; small real UI snippets (a ledger row, a
badge) scaled up so the diagram connects to the product. One idea per scene. Every statement must be
traceable to the code or docs — explainers tempt you to generalise beyond what the system does.

## 5. Kinetic-type teaser

For: a pre-launch tease or the opening of a launch. 10–20 s. Big words only, rising in, one line at
a time, timed to music beats or the voice. A rolling word slot (cities, use cases) adds motion.
Colour one phrase (the problem in red, the promise in the brand colour).

## 6. Dashboard / metrics reveal

For: analytics products, "track" moments. 6–10 s inside a longer video. KPI cards count up to their
real values, a chart line draws in left to right against a dashed previous period, bars grow, one is
highlighted. Camera: KPIs, then the chart, then pull back. Never animate a live ticker the product
doesn't have.

## 7. Developer integration

For: API products. 40–50 s. Real settings screen for keys or secrets (shown once, copied), then code
cards: the request (signed, with the real endpoint and headers), the response (`202 { … }`), the
error cases, then the result landing in the product's UI. Turn off font ligatures in code
(`=>` must not render as ⇒). Never show a real secret.

## 8. Onboarding welcome

For: new users after sign-up. 30–45 s, warm, slower. "Welcome to [Name]" → the three things to do
first, each a real screen → where to get help.

## 9. Before / after

For: a redesign or an improvement. Split screen or a wipe between the old and new screen, both real
(old from a previous screenshot or git version). Label each side plainly.

## 10. Social cutdown

For: Reels, TikTok, Shorts, LinkedIn, X. 15–30 s, 9:16 (or 1:1). Built from the same scenes as the
16:9 video. Captions burned in. A hook in the first second. See `social.md`.

## 11. Pacing, transitions and camera language

- **Scene length**: 5–8 s for a product moment; 3 s for a title; 4–6 s for an end card.
- **Transitions**: each look has a default (Studio: a 12-frame crossfade with a soft whoosh;
  Editorial: a focus pull; Graphic: a colour slab; Cinematic: a slow focus pull). Use the special ones
  for a reason: a circle of brand colour for the brand moment, a panel growing into a detail, a hard
  cut on a music hit, a zoom through squares into the close. Avoid spins and novelty wipes; they date
  fast and fight the UI.
- **Camera**: start wide (orient), zoom to the action (1.3–1.8×), pull back to show the result.
  One move per beat; hold still while something is happening on screen; let the eye land before the
  next move. Ease in and out on every move.
- **Cursor**: arrive, pause a beat, click (dip + ring + click sound), move away so the result is
  visible. Never park the cursor on the thing that just changed.
- **Typing**: 12–24 characters per second; a caret that is solid while typing and blinks at rest.
- **Entrances**: words rise and unblur one by one, 3 frames apart. Cards pop with a spring.
- **Highlights**: a ring or glow around a real element, briefly; never an invented UI element.
- **Holding**: end each scene on its resolved state for at least half a second before the fade.

# Visual styles

A video has a **type** and a **visual style**. The type (launch, tutorial, explainer … in `styles.md`)
decides the structure: which beats, how long. The visual style decides how it looks and moves: the
ground, the type, the colour, the transitions, the pace. In the kit a style is called a `look`, and it
is one line in the timeline (`look: "editorial"`).

There are five looks. Each one has a default for each video type, but the user chooses. Always
show them the options, your recommendation, and why (see "Recommend, then let them choose").

## Contents

1. Choosing a look
2. Recommend, then let them choose
3. Studio
4. Editorial
5. Graphic
6. Cinematic
7. Showcase
8. Motion rules that apply to every look
9. Building a look in the kit

---

## 1. Choosing a look

Start from the video type, then adjust for the product and the audience.

| Video type | Default look | Why | Good alternative |
|---|---|---|---|
| Launch: a product with real UI to show | **Editorial** | Launches sell an outcome. One number or claim per scene, then a few real UI moments on floating cards, reads fast and works muted in a feed | Studio when the UI itself is the hero; Cinematic for a premium brand |
| Launch: an AI, agent or automation product (the product does the work on screen) | **Showcase** | The story is "watch it work": headline, then the product filling a form or finding results live, a card lifting out with the result. White and gradient read as modern and light | Studio when the viewer must learn each click |
| Launch: API, infrastructure, data (little UI) | **Graphic** | With no screens to show, a strong graphic system (grid, pixels, one loud colour) carries the story | Editorial with code cards |
| Feature drop / what's new | **Editorial** | One number or one before/after claim, then the feature on a card | Studio when the feature is an interaction (drag, type, click); Showcase when it's a live, multi-step action |
| Tutorial / walkthrough | **Studio** | People need to see the whole real screen, where the cursor goes and what changes. Stylised looks slow learning | none: keep tutorials in Studio |
| Explainer (how it works) | **Editorial** | Diagrams on paper, cards and connector lines read like a clear explanation | Graphic for data flows and pipelines |
| Kinetic-type teaser | **Graphic** | Big type, motifs and slabs on the beat; no UI needed | Cinematic for a slower, moodier tease |
| Dashboard / metrics reveal | **Editorial** | Odometers, heatmaps and meters are the editorial look's native moves | Studio when the real dashboard must be shown whole |
| Developer integration | **Graphic** | Code cards on a blueprint grid, endpoints and payloads as graphic objects | Studio for a settings-screen walkthrough |
| Onboarding welcome | **Studio** | New users must recognise the screens they are about to use | Cinematic for a warm brand welcome |
| Before / after | **Studio** | Both real screens, the same frame, a wipe between them | Editorial with two floating cards |
| Social cutdown | **Same look as its parent video** | A cutdown is the same story, shorter; changing look breaks the series | Editorial or Graphic make good muted-feed cutdowns of a Studio video, because they are text-led |

Then adjust:

- **The product's own brand.** A dark, premium brand → Cinematic. One loud brand colour (orange,
  electric blue) and a geometric identity → Graphic. A light, neutral or friendly brand → Editorial.
  A bright, gradient-led SaaS brand (blue to violet, white UI) → Showcase.
  The look borrows the brand's accent colour (`c.brand`) in every case.
- **Where it will be watched.** LinkedIn and X autoplay muted: Editorial and Graphic carry the story in
  on-screen words and work without sound. YouTube, docs and sales calls are watched with sound: Studio
  with a voiceover is fine.
- **Voiceover or not.** Studio and Cinematic suit narration. Editorial and Graphic are usually
  music-led: the words on screen *are* the script (both reference launches had no voiceover).
- **How much real UI there is.** Many real screens → Studio or Editorial. Hardly any → Graphic.

## 2. Recommend, then let them choose

Ask about the look in the first batch of questions (with type, length and shape). Give one
recommendation with a reason tied to *their* video, and the other three in one line each. Example:

> **Visual style.** I recommend **Editorial** for this launch: you have a strong number to lead with
> (payouts in 40+ currencies), two or three screens that look great as floating cards, and LinkedIn
> will autoplay it muted, so text-led scenes carry it.
> Other options:
> - **Studio**: dark stage, the full app window, camera and cursor. Best if you want people to see the
>   whole product working.
> - **Graphic**: white grid, one loud brand colour, pixel motifs, colour slabs. Best for API or infra
>   products with little UI.
> - **Cinematic**: near-black, soft glow, large light type, slow. Best for a premium, quiet brand.
> - **Showcase**: white, gradient accent words, the product working live in a browser, cards lifting
>   out. Best for AI and automation products whose demo is the pitch.
>
> Say which, or I'll go with Editorial.

If they don't choose, use the recommendation and say so in one line. If the request names a reference
("like Linear's launch video", "like the Firecrawl one"), map it to the nearest look and say which.
Show the look in the storyboard: name it at the top, and name each scene's transition.

## 3. Studio

The kit's original look. A near-black stage with a soft coloured glow and a faint grid; the app in a
floating window; a camera that zooms to anchors and a cursor that clicks and types.

- **Feel:** a guided tour of the real product.
- **Use for:** tutorials, walkthroughs, onboarding, before/after, launches where the UI is the hero.
- **Ground:** `Backdrop` (dark, glow from below, drifting grid). **Type:** Inter Display, bold (700)
  headlines with an uppercase eyebrow in the brand colour.
- **Transitions:** 12-frame crossfade with a soft whoosh; `push` between steps of a series.
- **Pace:** 5–8 s per product moment; camera wide → zoom to the action → pull back.
- **Sound:** voiceover first, music ducked under it.
- **Kit:** `Step`, `AppWindow`, `Anchor`, `Cursor`, `TitleCard`, `EndCard` (see `kit.md`).

## 4. Editorial

Learned from a 39-second LinkedIn launch for an account-rental product. Calm, confident, numbers-led.
Warm paper instead of a dark stage, one idea per scene, the UI as floating cards, and the brand colour
saved for the brand moments.

**What the reference did, scene by scene:**

| Time | What happened | How it moved |
|---|---|---|
| 0–4 s | "INVITES SENT THIS WEEK" over a hairline rule; a huge number counts 96 → 100; "100 invites a week. *That's it.*" | Each digit rolls vertically like an odometer, one step at a time, decelerating; at 100 the number and the rule turn red and "weekly limit" appears at the rule's end |
| 4–8 s | 20 small dot-grids labelled WK 1 … WK 20 fill blue one after another; a week counter top-right; "1 account = *5 months*" | The grid fills like a progress bar; the counter rolls with it |
| 8–11 s | Three person cards fly in and land askew; a red RESTRICTED stamp lands on each; "Restricted in *days*" | Cards dealt from off-frame with a spin; stamps slam in big then settle |
| 11–15 s | A blue dot appears, grows into a full-frame circle; the logo assembles from pieces; "1,200+ accounts ready" counts up; the logo shrinks to the top | Circle reveal from a point; the logo's parts fly together; odometer count |
| 15–20 s | The app's "Rent accounts" screen swings in tilted and blurred, settles flat; a cursor clicks US, UK, France, drags a slider; rows appear; a dark pill bottom-left: "Pick your *market*" | 3D tilt-in with blur → sharp; the camera pushes in; caption pill with one blue word |
| 20–25 s | A calendar grid fills in blue shades week by week beside a card whose % rolls 15 → 100 and turns to "Ready for you"; "Warmed for *4 weeks*" | Heatmap fill + odometer + state change on the card |
| 25–28 s | A person card at the top, lines curve down to two option cards: "Take the login" / "Our sequencer", whose steps tick blue; "Your tool or *ours*" | A branching diagram drawn in; steps complete in order |
| 28–31 s | "Down?" A card shows "Account down" in red, flips over to a new person: "Replacement ready · FREE"; "Down? Replaced *free.*" | A 3D card flip |
| 31–35 s | A blue circle wipes in; "Starting from $39 /mo per account", a "+ $19 …" pill, the logo and URL | Circle reveal; price counts; elements rise in |
| 35–39 s | Back on paper: 10 sender rows with bars filling to 100, a big total rolling 21 → 1,000; "10 senders. *No ceiling.*" | Bars grow in a cascade; the total rolls with them |

**The rules it follows:**

- **Ground:** warm off-white paper (`#efeee9`) with a soft vignette. No window chrome; UI sits on
  white cards with soft, warm shadows. The brand colour fills the whole frame only at brand moments
  (introduction, price), entered with a circle reveal.
- **One idea per scene.** One big number or one diagram, plus one short line under it.
- **Type:** the reference used a rounded geometric sans. The kit now sets editorial in **EB Garamond**
  (a Garamond book serif), medium (500), with the coloured phrase in its **italic**, learned from a
  second editorial reference (below): it reads warmer and more considered than a sans. Numbers very
  large (200–260 px at 1080p) in the same serif; the line under them about 44 px; labels, cards and
  meters small, in Inter (`look.textFont`). For the original sans feel, set `font` to the sans stack.
- **Colour has meaning.** Each line has one coloured phrase: the problem in red ("*That's it.*",
  "*days*"), the promise in the brand colour ("*4 weeks*", "*ours*", "*free.*"). Never both in one
  line.
- **Numbers roll** like an odometer and slow down into their final value. A limit is shown by the
  number and its rule turning red, not by an added warning.
- **Words rise out of a mask**, one by one, a few frames apart, instead of fading in.
- **Real UI, briefly.** One or two product screens, tilted in and settled, with a real cursor
  interaction and a dark caption pill naming the action.
- **Transitions:** a focus pull (old scene blurs and drifts, the new one sharpens) between beats of
  the story; a circle of brand colour for brand moments; a rounded panel growing to full frame when
  moving into a detail.
- **Pace:** 3–5 s per scene, about ten scenes in 40 s. Music only; no voiceover.
- **Close:** the offer on brand colour (price, URL, mark), then optionally one last proof scene.

**A second reference: a 44-second voice-dictation app launch**, measured frame by frame
(`motion-data.md`). Warm cream with soft pink and orange glows; serif headlines top-left with one
coral italic word ("The *slowest* part of you", "Texts like *you.*"); the app's real UI as white
cards (a chat, an email), a keyboard, a gauge counting words per minute, the app on four devices.
Its motion is the calmest of the four references: beats median 667 ms, overshoot on only 6% of them.
For an editorial video, lengthen moves rather than adding bounce.

**Kit:** `Paper`, `Slab dots`, `RuleLabel`, `Odometer`, `AccentLine`, `Caption`, `PersonCard`,
`dealt()`, `Stamp`, `Flip`, `Tilt`, `CellGrid`, `Meter`; transitions `focus`, `circle`, `panel`.
Example: `src/videos/editorial/`.

## 5. Graphic

Learned from a 25-second launch for a web-data API. Fast, flat, systematic: a white grid, one loud
brand colour, a pixel motif that keeps transforming, and full-bleed colour slabs. Built for products
whose value is not a screen.

**What the reference did:**

| Time | What happened | How it moved |
|---|---|---|
| 0–2 s | A tiny cluster of orange squares flickers, grows into a field of squares filling the frame, an ellipse clears in the middle for "Introducing" | A dot matrix revealed outwards from the centre; squares flicker between three strengths |
| 2–4 s | The name lands in a white cell; hairlines run from the cell to the frame's edges; the cell becomes four squares, then a 4×4, which becomes the pattern again | A grid cell drawn from the centre; the motif transforms rather than cutting |
| 4–8 s | Dozens of tiles (logos, file icons, orange squares) spiral out of the centre and scatter, drifting and rotating; "Get data from *anywhere on the web*" | A spiral burst, then slow drift |
| 8–12 s | Provider logos sit around faint concentric rings; "plus popular providers" | Logos pop in around an orbit and drift slowly |
| 12–14 s | Cut to a black grid: a portrait rendered as orange pixel squares, a data card beside it, orange squares popping around as accents | An inverted scene for the "power" moment |
| 14–18 s | "In every format you need": a list (Markdown, JSON, Screenshots, Links, Video …) steps through a slot, the icon changing with each | Word slot: the current item bold in the middle, neighbours faded |
| 18–20 s | A full-bleed orange slab: "All with one / endpoint." huge and left-aligned, the second line fading in | Slab wipe; type at 150 px |
| 20–25 s | Concentric squares zoom through to the close: orange with a flame outline watermark; the name, then "is live now", the logo small at the bottom | Zoom through squares; text swap |

**The rules it follows:**

- **Ground:** near-white (`#fafafa`) with a fine square grid fading out from the centre. One scene
  inverts to black for contrast. The brand colour is used flat and full-strength: squares, slabs,
  the close.
- **One motif, reused.** The square is everything: pixels, grid cells, tiles, the zoom-through. A
  motif that keeps transforming makes a short video feel designed, not assembled.
- **Type:** Inter Display (Inter's optical-size cut, which the reference itself uses), semi-bold (600),
  strongly negative tracking. Statements 50–64 px centred; slab statements 150 px left-aligned.
- **Measured** (`motion-data.md`, `API_LAUNCH`): 25 beats, median 733 ms, motion on 95% of frames,
  holds of about 80 ms. It cuts fast but each move is unhurried.
- **Transitions:** colour slabs, hard cuts on the beat, push for lists, a zoom through concentric
  squares into the close.
- **Pace:** 2–4 s per scene, cut to the music. Music only.
- **Close:** "[Name] is live now" on the brand colour, with the mark as an outlined watermark.

**A second graphic reference: a 27-second furniture brand launch** (`FURNITURE_LAUNCH`). After a short
lifestyle shot, each product sits cut out on a saturated full-bleed colour (red, green, blue), its name
in huge heavy capitals behind it, a small italic serif caption in the corner; then a kinetic list with
small product images set inline between the words. The same system as above (one motif, flat colour,
big type) for a physical product. Motion on 99% of frames; holds under 70 ms.

**Kit:** `Blueprint` (and `Blueprint dark`), `Slab watermark`, `DotMatrix`, `GridCell`, `Swirl` + `Tile`,
`Orbit` + `Chip`, `WordSlot`, `AccentLine`; transitions `slab`, `cut`, `push`, `zoom`.
Example: `src/videos/graphic/`.

## 6. Cinematic

For premium, quiet brands and teasers ("a video like Linear's"). Near-black, a soft glow, large light
type, slow focus pulls.

- **Ground:** `Backdrop` with a lower glow; lots of empty space.
- **Type:** Inter Display, medium (500), large (90–120 px), light on dark; one accent phrase per line,
  set in **Instrument Serif italic** (a condensed display serif) about 14% larger to match its x-height.
  The furniture reference pairs the two the same way ("*Introducing* taeillo").
- **Motion:** slower than every other look: 20-frame focus pulls, words rising 6–8 frames apart, long
  holds. UI appears in the Studio window but with fewer, slower camera moves.
- **Sound:** a calm bed or a slow voiceover; no whooshes, or very quiet ones.
- **Pace:** 5–8 s per scene; fewer scenes.

## 7. Showcase

Learned from a 108-second launch for an AI web app, measured frame by frame (`motion-data.md`).
Bright and busy in a controlled way: white space, one gradient word per headline, and the product
visibly *doing the work* in a browser, as an agent fills a form or finds results while the viewer watches.

**What the reference did:**

| Time | What happened | How it moved |
|---|---|---|
| 0–3 s | A line about the problem types out ("… has always been"); its last word, "broken", is selected like text in an editor | Typewriter with caret; a selection box with handles grows across the word |
| 3–7 s | Task chips (each a manual chore with its app and status: "Overdue", "No reply") drift in, blurred; app icons orbit the problem line | Depth blur, then concentric rings rotating and shrinking (accelerating into the cut) |
| 7–9 s | "But…" in corner brackets; the bracket resizes around "What if you only needed one app" | Brackets land with a small overshoot |
| 9–14 s | The logo assembles from shards; the tagline drops in word by word, then its verb phrase swaps for a second one | Words fall along a curved path from above-right and swing into place; one word in the gradient |
| 14–15 s | A full-frame pink → violet → blue gradient sweeps across | Gradient wipe into the first feature |
| 15–29 s | A web form in a browser; the extension's agent panel lists its steps (reading the page, filling in saved details …) while the form fills itself; Submit | Short scroll steps (~333 ms, firm stops), fields filling one after another, the cursor leading |
| 29–36 s | The application becomes a card that lifts out of the page; it joins a board of applications | Card lift with growing shadow; zoom out into the board |
| 36–103 s | Six more features, each: headline (one gradient word, sometimes swapped in place: "track every *application*" → "*task*") → live demo | Same vocabulary throughout: drop-in words, scroll steps, lifts, side panels popping in by scale |
| 103–108 s | The app icon on a lavender sky shatters into the wordmark; the one-line promise and the URL | Shards fly out; wordmark slides in with motion blur |

**The rules it follows:**

- **Ground:** white, with faint gradient blooms in the corners (`Glow`). UI sits in light browser
  windows or white cards with soft violet-tinted shadows.
- **One gradient word per headline**, the brand colour into violet. The rest of the line is dark ink.
- **Headlines are short and medium-weight** (Inter Display about 500, 48–64 px at 1080p), centred,
  with plenty of space. They hold for 1.5–3 s while their words settle.
- **Words drop in along curves**, one by one, a few frames apart; a swapped word changes in place.
- **The demo is the proof.** Each feature is shown working, live: the agent's panel narrates its steps
  on screen, the cursor leads, results appear. Rebuild it from the real product (`accuracy.md`).
- **Something always moves.** 77% of frames have motion; holds average a quarter of a second.
- **Timing is measured, not guessed:** in-out curves peaking mid-move, 300–700 ms beats, overshoot
  only on swaps and pops (`src/kit/measured`, `motion-data.md`).
- **Transitions:** `rise` (the old scene lifts away, the new one rises in) between beats; `wipe` (a
  gradient wash) into the brand and the close.
- **Pace:** headline 1.5–3 s, demo 5–14 s. Music-led, often with an upbeat track; voiceover optional.

**Kit:** `Glow`, `DropWords`, `SwapWord`, `TypeSelect`, `Bracket`, `Lift`, `CurveLine`,
`GradientText` (`src/kit/showcase.tsx`); `Step` and `AppWindow` for the demos; `MOTION` presets;
transitions `rise`, `wipe`. Example: `src/videos/showcase/`.

## 8. Motion rules that apply to every look

Learned from the references and true in all five looks:

- **Hold the resolved state.** After a number lands or a status changes, hold it at least 0.5 s
  before the transition starts.
- **Decelerate into values.** Counts and camera moves settle softly; nothing stops abruptly. Moves
  themselves are mostly in-out (speed peaking mid-move), in all four measured references.
- **One coloured phrase per line**, and colour means something (problem or promise).
- **Text enters from a mask**, word by word, rather than fading as a block.
- **Let objects carry over.** When the same element (a card, a logo, a square) appears in two
  scenes, move it rather than cutting it. Reuse one motif.
- **Text-led looks are muted-first.** If there is no voiceover, every claim must be readable on screen
  for at least 1.5 s.
- **Accuracy still applies.** Numbers that roll must roll to the real value; cards and diagrams show
  real states, real options and real prices (`accuracy.md`).
- **Time it like the references did.** Measured from four professional launches: beats of about half
  a second or a little more (median 417–733 ms, 13–22 frames at 30 fps), speed peaking 38–55% of the
  way through, overshoot on 6–21% of beats, something moving on 77–99% of frames.
  `src/kit/measured` has the curves (`motion-data.md`).

## 9. Building a look in the kit

- Set `look` in the timeline: `{ id, title, look: "editorial", crossfade: 14, scenes: [...] }`.
  `makeVideo` provides it to every scene; components read it with `useLook()` (font, canvas, ink,
  accent, alarm, card shadow, default transition, pace).
- Choose a scene's entrance with `in` (`fade`, `focus`, `circle`, `panel`, `slab`, `zoom`, `push`,
  `cut`, `rise`, `wipe`) and, for `circle` and `panel`, `origin: [x, y]` as fractions of the frame. Left out, a scene
  uses the look's default transition.
- Set `crossfade` to the look's pace: Studio 12, Graphic 12, Showcase 12, Editorial 14, Cinematic 20.
- `<Stage />` draws the current look's ground, so Studio-style `Step` scenes also work in other looks
  (a light window shadow replaces the dark glow).
- A scene can override the look for itself by wrapping in `<LookContext.Provider value={LOOKS.graphic}>`
  (a mixed-style showcase), but keep one look per video unless there is a reason.
- Type per look: `font` sets headlines and big numbers, `textFont` the small text around the product
  (labels, card names, meters, chips), and `accentFont` how `*starred*` words are set (editorial: the
  Garamond italic; cinematic: Instrument Serif italic). Without `accentFont`, accent words change colour
  only, or take the gradient in showcase. The fonts are bundled from npm in `src/kit/fonts.ts`
  (Inter, EB Garamond, Instrument Serif, JetBrains Mono; all SIL Open Font License), so renders need
  no network.
- A new look is an entry in `LOOKS` in `src/kit/looks.ts`. Derive it from the brand (its font, its
  background, its accent) and give it a default transition and pace. A brand font goes in
  `src/kit/fonts.ts`: install its `@fontsource` package, import the `.woff2`, add it to `FILES`.
- Music: Editorial and Cinematic suit `bed.wav`; Graphic, Showcase and Studio launches suit `upbeat.wav`. For
  music-led videos raise the music's `alone` level (0.6) since nothing ducks it.

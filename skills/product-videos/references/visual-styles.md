# Visual styles

A video has a **type** and a **visual style**. The type (launch, tutorial, explainer … in `styles.md`)
decides the structure: which beats, how long. The visual style decides how it looks and moves: the
ground, the type, the colour, the transitions, the pace. In the kit a style is called a `look`, and it
is one line in the timeline (`look: "editorial"`).

There are four looks. Each one has a default for each video type, but the user chooses. Always
show them the options, your recommendation, and why (see "Recommend, then let them choose").

## Contents

1. Choosing a look
2. Recommend, then let them choose
3. Studio
4. Editorial
5. Graphic
6. Cinematic
7. Motion rules that apply to every look
8. Building a look in the kit

---

## 1. Choosing a look

Start from the video type, then adjust for the product and the audience.

| Video type | Default look | Why | Good alternative |
|---|---|---|---|
| Launch: a product with real UI to show | **Editorial** | Launches sell an outcome. One number or claim per scene, then a few real UI moments on floating cards, reads fast and works muted in a feed | Studio when the UI itself is the hero; Cinematic for a premium brand |
| Launch: API, infrastructure, data (little UI) | **Graphic** | With no screens to show, a strong graphic system (grid, pixels, one loud colour) carries the story | Editorial with code cards |
| Feature drop / what's new | **Editorial** | One number or one before/after claim, then the feature on a card | Studio when the feature is an interaction (drag, type, click) |
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
- **Ground:** `Backdrop` (dark, glow from below, drifting grid). **Type:** Inter, heavy (800) headlines
  with an uppercase eyebrow in the brand colour.
- **Transitions:** 12-frame crossfade with a soft whoosh; `push` between steps of a series.
- **Pace:** 5–8 s per product moment; camera wide → zoom to the action → pull back.
- **Sound:** voiceover first, music ducked under it. Effects: a click per cursor click, a whoosh per
  transition, little else.
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
- **Type:** a rounded geometric sans (Plus Jakarta Sans in the kit), bold, tight tracking. Numbers
  very large (200–260 px at 1080p); the line under them about 44 px; labels small, uppercase, spaced.
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
- **Sound palette:** paper and cards. Soft air under focus pulls, a riser into each circle of brand
  colour, a swish and a wooden knock as cards are dealt, a punchy stamp, ticks while a slow number
  rolls, one confirm when something resolves.
- **Close:** the offer on brand colour (price, URL, mark), then optionally one last proof scene.

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
- **Type:** a tight neo-grotesk (Inter Tight in the kit), medium weight, strongly negative tracking.
  Statements 50–64 px centred; slab statements 150 px left-aligned.
- **Transitions:** colour slabs, hard cuts on the beat, push for lists, a zoom through concentric
  squares into the close.
- **Pace:** 2–4 s per scene, cut to the music. Music only.
- **Sound palette:** crisp and digital. A thump as each slab lands, glitches as pixels appear, pops
  instead of knocks, a blip as the name lands, ticks as a list steps, a riser into the zoom-through.
- **Close:** "[Name] is live now" on the brand colour, with the mark as an outlined watermark.

**Kit:** `Blueprint` (and `Blueprint dark`), `Slab watermark`, `DotMatrix`, `GridCell`, `Swirl` + `Tile`,
`Orbit` + `Chip`, `WordSlot`, `AccentLine`; transitions `slab`, `cut`, `push`, `zoom`.
Example: `src/videos/graphic/`.

## 6. Cinematic

For premium, quiet brands and teasers ("a video like Linear's"). Near-black, a soft glow, large light
type, slow focus pulls.

- **Ground:** `Backdrop` with a lower glow; lots of empty space.
- **Type:** Geist, semi-bold, large (90–120 px), light on dark; one accent phrase per line.
- **Motion:** slower than every other look: 20-frame focus pulls, words rising 6–8 frames apart, long
  holds. UI appears in the Studio window but with fewer, slower camera moves.
- **Sound:** a calm bed or a slow voiceover. Effects at half level: soft air on transitions, stamps
  and confirms only; no ticks, pops or blips.
- **Pace:** 5–8 s per scene; fewer scenes.

## 7. Motion rules that apply to every look

Learned from both references and true in all four looks:

- **Hold the resolved state.** After a number lands or a status changes, hold it at least 0.5 s
  before the transition starts.
- **Decelerate into values.** Counts, camera moves and entrances ease out; nothing stops abruptly.
- **One coloured phrase per line**, and colour means something (problem or promise).
- **Text enters from a mask**, word by word, rather than fading as a block.
- **Let objects carry over.** When the same element (a card, a logo, a square) appears in two
  scenes, move it rather than cutting it. Reuse one motif.
- **Text-led looks are muted-first.** If there is no voiceover, every claim must be readable on screen
  for at least 1.5 s.
- **Accuracy still applies.** Numbers that roll must roll to the real value; cards and diagrams show
  real states, real options and real prices (`accuracy.md`).

## 8. Building a look in the kit

- Set `look` in the timeline: `{ id, title, look: "editorial", crossfade: 14, scenes: [...] }`.
  `makeVideo` provides it to every scene; components read it with `useLook()` (font, canvas, ink,
  accent, alarm, card shadow, default transition, pace).
- Choose a scene's entrance with `in` (`fade`, `focus`, `circle`, `panel`, `slab`, `zoom`, `push`,
  `cut`) and, for `circle` and `panel`, `origin: [x, y]` as fractions of the frame. Left out, a scene
  uses the look's default transition.
- Set `crossfade` to the look's pace: Studio 12, Graphic 12, Editorial 14, Cinematic 20.
- `<Stage />` draws the current look's ground, so Studio-style `Step` scenes also work in other looks
  (a light window shadow replaces the dark glow).
- A scene can override the look for itself by wrapping in `<LookContext.Provider value={LOOKS.graphic}>`
  (a mixed-style showcase), but keep one look per video unless there is a reason.
- A new look is an entry in `LOOKS` in `src/kit/looks.ts`. Derive it from the brand (its font, its
  background, its accent) and give it a default transition and pace.
- Sound: each look's `sfx` palette sets the transition sounds, swaps and level (`audio.md` section 4).
  A new look should set one too.
- Music: Editorial and Cinematic suit `bed.wav`; Graphic and Studio launches suit `upbeat.wav`. For
  music-led videos raise the music's `alone` level (0.6) since nothing ducks it.

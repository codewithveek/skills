# Visual styles

A video has a **type** and a **visual style**. The type (launch, tutorial, explainer … in `styles.md`)
decides the structure: which beats, how long. The visual style decides how it looks and moves: the
ground, the type, the colour, the transitions, the pace. In the kit a style is called a `look`, and it
is one line in the timeline (`look: "editorial"`).

There are six looks. Each one has a default for each video type, but the user chooses. Always
show them the options, your recommendation, and why (see "Recommend, then let them choose").

## Contents

1. Choosing a look
2. Recommend, then let them choose
3. Studio
4. Editorial
5. Graphic
6. Cinematic
6a. Footage
6b. Poster
7. Motion rules that apply to every look
8. Building a look in the kit
9. Studying a reference video

---

## 1. Choosing a look

Start from the video type, then adjust for the product and the audience.

| Video type | Default look | Why | Good alternative |
|---|---|---|---|
| Launch: a product with real UI to show | **Editorial** | Launches sell an outcome. One number or claim per scene, then a few real UI moments on floating cards, reads fast and works muted in a feed | Studio when the UI itself is the hero; Cinematic for a premium brand |
| Launch: a product for real-world businesses or people (shops, salons, clubs, creators) | **Footage** | A human hook on footage ("the salon that takes appointments … sells haircare products") makes the right viewer recognise themselves before any UI; then cards, colour and the real screens | Footage over public-domain photos when there's no footage budget (`footage.md`, stills); otherwise Editorial |
| Launch or ad: a physical product, e-commerce, a catalogue | **Poster** | The products are the stars: huge names behind cut-out photos, one colour per product, punchy words | Footage for lifestyle scenes; Graphic for a single hero product |
| Launch: API, infrastructure, data (little UI) | **Graphic** | With no screens to show, a strong graphic system (grid, pixels, one loud colour) carries the story | Editorial with code cards |
| Feature drop / what's new | **Editorial** | One number or one before/after claim, then the feature on a card | Studio when the feature is an interaction (drag, type, click) |
| Tutorial / walkthrough | **Studio** | People need to see the whole real screen, where the cursor goes and what changes. Stylised looks slow learning | none: keep tutorials in Studio |
| Explainer (how it works) | **Editorial** | Diagrams on paper, cards and connector lines read like a clear explanation | Graphic for data flows and pipelines |
| Kinetic-type teaser | **Graphic** | Big type, motifs and slabs on the beat; no UI needed | Poster for bold, colourful type; Cinematic for a slower, moodier tease |
| No codebase or app yet (only designs or a description) | **Poster** or **Graphic** | Type, colour and motifs carry the story without UI (`accuracy.md`, sources of truth) | Footage, if the story is about the people it serves |
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
- **How much real UI there is.** Many real screens → Studio or Editorial. Hardly any → Graphic or
  Poster. None yet → Poster, Graphic or Footage, and label any UI as illustrative.
- **Who it's for.** If the audience runs a physical business or the product lives in the real world
  (bookings, retail, food, sport, furniture), footage of their world is the strongest hook → Footage.

## 2. Recommend, then let them choose

Ask about the look in the first batch of questions (with type, length and shape). Give one
recommendation with a reason tied to *their* video, and the other five in one line each. Example:

> **Visual style.** I recommend **Editorial** for this launch: you have a strong number to lead with
> (payouts in 40+ currencies), two or three screens that look great as floating cards, and LinkedIn
> will autoplay it muted, so text-led scenes carry it.
> Other options:
> - **Studio**: dark stage, the full app window, camera and cursor. Best if you want people to see the
>   whole product working.
> - **Graphic**: white grid, one loud brand colour, pixel motifs, colour slabs. Best for API or infra
>   products with little UI.
> - **Cinematic**: near-black, soft glow, large light type, slow. Best for a premium, quiet brand.
> - **Footage**: real or generated B-roll of your customers' world with kinetic captions, then the
>   product. Best when your users run physical businesses.
> - **Poster**: huge type, one bold colour per product, cut-out product photos. Best for physical
>   products and e-commerce.
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

## 6a. Footage

Learned from Box's 43-second launch (an all-in-one platform for businesses that sell several ways),
made with Claude, Remotion and generated footage (October 2026). Music-led, no voice.

| Time | What happened | How it moved | Sound |
|---|---|---|---|
| 0–3 s | A dark Pilates studio; a bulb switches on; "YOUR BUSINESS HAS NEVER BEEN ONE THING" types out in small caps | Brightness jumps with the click; a block caret | Light-switch click, then keyboard typing |
| 3–10 s | A creator at her laptop, a stylist with a client, a padel club's courts → café → shop | A small lead ("The salon that") over a big bold line with a blue underline bar; the line blurs from phrase to phrase ("takes appointments" → "sells haircare products") | None: just the music |
| 10–15 s | Near-black screen: a huge "But", then "But most tools are built for just one flow." word by word; eight coloured product cards shoot in from the top and bottom | Words blur in one by one; cards in two tilted rows | A hit on the cut; a soft whoosh for the cards |
| 15–18 s | The screen floods cobalt; "So you either shrink to fit" ("shrink" arrives big and blurred), "or juggle multiple tools" | The cards stack into a fan, then shuffle | Soft ticks |
| 18–23 s | The cards drop into a 3D box; the lid shuts; "What if you didn't have to?"; a blue line becomes the logo; "Introducing BOX" | Box floats, lid hinged; text rises | A soft thud as the lid shuts |
| 23–36 s | Six steps: "Tell Box how you sell." "Add what you sell." "Pick a look. Go live." "Collect payments online or in person." "See every sale land." "Connect the tools you already use." | A small numbered label ("01 — ONBOARDING") and a two-line title on the left, the real screen on the right; light and dark steps alternate; a revenue figure counts up | Soft cursor clicks |
| 36–39 s | Pixel blocks wipe to cobalt: "Everything you need to run your business all in one place." | Block wipe | Light ticks |
| 39–43 s | The logo, "Now live.", "boxspace.io" types into a blue pill and is clicked | — | Typing, then a click |

**The rules it follows:**

- **Footage for the hook, real UI for the solution.** People and places first, product second.
- **Type over footage is two-tier and exact:** a small lead line and a big line, with a brand-colour bar
  under the big one; every word set in Remotion (video models misspell text).
- **Hard cuts on the music** between footage shots; the look's default transition is `cut`.
- **Colour floods mark the turn:** dark for the pain, the brand colour for the shift, light for the
  product.
- **Sound only on key moments:** the switch, typing, the whoosh, the thud, clicks. Footage scenes get
  none. Soft and low (the original sits 7–15 dB above its music).
- **Stills work too.** Photos with a slow push-in, cut on the beat, read as shots: an "overlay
  video" (type over pictures) needs no clips at all. `Montage` cuts several photos under one
  PhraseSwap, a phrase per picture.
- **Kit:** `Footage` (clips or photos), `Montage`, `LightSwitch`, `Typewriter`, `PhraseSwap`, `Punch`
  (with `settle` for the "But" that becomes the sentence's first word), `CardDeck` (rows → fan →
  stack → gather), `Crate`, `StepLabel`, `UrlPill`; transitions `cut`, `slab`, `pixels`. Example:
  `src/videos/footage/`. Footage and photo sources, prompts: `footage.md`.

## 6b. Poster

Learned from Taeillo's 27-second ad for a furniture brand, made with Claude (voice and music through
Higgsfield's Claude connector, October 2026).

| Time | What happened | How it moved |
|---|---|---|
| 0–2 s | Black; "WHEN LAST" decodes out of scrambled letters | Characters cycle through random glyphs and resolve left to right |
| 2–6 s | A bedroom; the voice says the line and the words follow it one or two at a time: "walk into your home", "and ask", "OMG!", "did you", "THIS?" | Light and heavy weights alternate; "OMG!" and "THIS?" slam in, "THIS?" huge, orange, glitching |
| 6–9 s | Cream: "Introducing" in an italic serif + the wordmark | A circle wipes to the first product colour |
| 9–20 s | One poster per product: WAFFLE (bed, lavender), BLESSING (sofa, red), BIMBO (chair, teal), ZEBRA (stool, orange), BUBBLE (pink chair, green), SEUN (table, black), DERIN (sofa, yellow), CHINWE (chair, blue) | The name huge behind a cut-out product photo; letters scramble, drop or tumble in; a small italic caption ("Waffle bed"); pixel-block and diagonal-slash wipes between colours |
| 20–25 s | A stack of lines builds upward with product icons inline: "YOUR ONE-STOP SHOP / FOR FURNITURE / PEOPLE KEEP TALKING / ABOUT LONG AFTER / THEY LEAVE YOUR HOME." | Lines slide up |
| 25–27 s | The wordmark; "taeillo.com" decodes in; "Shop now on taeillo.com" spoken | — |

**The rules it follows:**

- **The product is the poster.** One product, one flat colour, one huge word per beat; 1–1.5 s each,
  cut fast on the music.
- **Two typefaces:** a heavy grotesk for names and punch words (Archivo Black in the kit) and an italic
  serif for small words ("Introducing", captions; Instrument Serif).
- **Type that arrives with character:** decoding, dropping, tumbling, glitching. Pick two or three and
  reuse them, not a different trick per word.
- **With a voice, the words follow it:** one or two words on screen at a time, the punch words big.
- **Kit:** `PosterName`, `Scramble`, `Punch` (`glitch`), `AccentLine`; transitions `pixels`, `slash`,
  `circle`. Products are cut-out PNGs (`<Img>`) the user supplies. Example: `src/videos/poster/`.

## 7. Motion rules that apply to every look

Learned from the references and true in every look:

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
  `cut`, `pixels`, `slash`) and, for `circle` and `panel`, `origin: [x, y]` as fractions of the frame. Left out, a scene
  uses the look's default transition.
- Set `crossfade` to the look's pace: Studio 12, Graphic 12, Editorial 14, Cinematic 20, Footage 8,
  Poster 10.
- `<Stage />` draws the current look's ground, so Studio-style `Step` scenes also work in other looks
  (a light window shadow replaces the dark glow).
- A scene can override the look for itself by wrapping in `<LookContext.Provider value={LOOKS.graphic}>`
  (a mixed-style showcase), but keep one look per video unless there is a reason.
- A new look is an entry in `LOOKS` in `src/kit/looks.ts`. Derive it from the brand (its font, its
  background, its accent) and give it a default transition and pace.
- Sound: each look's `sfx` palette sets the transition sounds, swaps and level (`audio.md` section 4).
  A new look should set one too.
- Music: each look has its own preset (`editorial`, `graphic`, `cinematic`; Footage uses `graphic`,
  Poster and Studio use `upbeat`, and
  `bed` under a tutorial's voice). For music-led videos raise the music's `alone` level (0.6) since
  nothing ducks it. Cut Graphic scenes on bars (`bars(n, BPM.graphic)` from `src/kit/beats.ts`).

## 9. Studying a reference video

When the user sends a video and says "like this", break it down before choosing a look. Every
section of this file was learned this way.

1. **Frames:** a contact sheet at 2 fps (`ffmpeg -i ref.mp4 -vf "fps=2,scale=400:-1,tile=6x4" sheet_%02d.jpg`)
   and the scene cuts (`-vf "select='gt(scene,0.25)',metadata=print"`). Then denser sheets (10 fps) of
   each transition, because a transition only exists between frames.
2. **Sound:** extract the audio and run `reference/sound-cues.py ref.wav --offbeat --clips cues/`. It
   finds the music's tempo and lists every hit that falls off the beat (the effects), with a short
   clip of each. Grab a frame at each cue time to see what it accompanies.
3. **Voice:** `reference/voice-profile.py ref.wav` gives the words with timings, pace and pitch
   (`audio.md`, matching a reference voice).
4. **Write it down** as a table (time, what's on screen, how it moved, sound), then the rules it
   follows, then which kit blocks rebuild each move and which are missing.
5. **Recreate techniques, not the work:** use the moves in the user's brand, story and assets, never
   their footage, copy, logos or sound files. Extracted sounds are for timing and analysis only;
   find CC0 equivalents or synthesise similar ones (`audio.md`, adding a sound).


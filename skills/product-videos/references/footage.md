# Footage (B-roll)

Real-world footage (people at work, a shop, a court, a kitchen) makes a hook land: viewers recognise
themselves before they see any UI. Box's launch opens on a dark Pilates studio where a light switches
on, then a creator at her laptop, a stylist with a client, a padel club's courts, café and shop, each
with one line of kinetic type. The **Footage** look is built around this (`visual-styles.md`).

Claude can't make photorealistic footage in code. Get it from a library or a video model, then do all
the type, timing and sound in Remotion.

## Contents

1. Where footage comes from
2. Generating it: prompts and rules
3. Putting it in the kit
4. Accuracy and disclosure

---

## 1. Where footage comes from

| Source | Licence / cost | Notes |
|---|---|---|
| **Pexels Videos** (pexels.com/videos) | Free, commercial use, no attribution; don't resell or redistribute the clips as they are | Large, good quality; search by scene ("salon stylist", "padel court") |
| **Pixabay Videos** | Free under the Pixabay Content License; same no-redistribution limit | Good for generic places and textures |
| **Mixkit** | Free under the Mixkit licence | Smaller, well-shot |
| **The user's own footage** | Theirs | Best when it exists: real customers, real premises |
| **Video models** (below) | Paid per clip | When the exact scene doesn't exist, or the people and places must match the brand's market |

Footage is fetched into the user's video project, never committed into the kit.

Video models and approximate costs for an **8-second clip**, as reported in October 2026 (prices
change; check before quoting them):

| Model | Best for | Approx. cost |
|---|---|---|
| Veo 3.1 Fast (Google Flow) | Background footage, cheap tests | 20 credits, about $0.40 |
| Veo 3.1 Quality (Flow) | Close-ups and key shots | 100 credits, about $2 |
| Gemini Omni Flash (Flow) | Keeping one person or product consistent across clips, from reference images | 25 credits, about $0.50 |
| Seedance 2.0 (Higgsfield, Dreamina) | Continuous shots up to 15 s | about $1.30–1.75 |
| Kling 3.0 (Higgsfield) | Camera movement, tracking shots | about $1 |
| Runway Gen-4.5 | Animating a still product photo | 96 credits, about $1.85 |

Higgsfield and Runway have Claude connectors (check the connector directory); Flow has none, so its
prompts are copied by hand. Free Flow accounts get a small daily credit allowance, enough for tests.

## 2. Generating it: prompts and rules

- **Never ask the model for text.** Video models misspell overlaid text. Generate clean plates; every
  word is added in Remotion, where it's exact and animatable.
- **One clip per beat, 5–8 s, a single idea.** Cut it to 2–4 s in the edit.
- **Write each prompt as a shot list line:** subject and action, setting, light, lens and camera
  move, mood, and what must *not* appear. For example:
  `A stylist braids a client's hair in a bright neighbourhood salon, shelves of haircare products
  behind them, soft window light, 35 mm, slow push-in, warm and calm. No text, no logos, no visible
  screens, 16:9, 1080p.`
- **Match the audience.** People, places and details should be the ones the product serves (Box's
  clips are recognisably Lagos businesses). Generic stock people make a generic video.
- **Keep people consistent** across clips with a reference-image model (Omni Flash) when the same
  person recurs.
- **Leave room for type:** ask for negative space where the caption goes (sky, a wall, a dim
  foreground), or plan to darken that part.
- **Check the frames** before using a clip: hands, faces, text-like garbage on signs, physics.
  Regenerate rather than hide a flaw under a caption.

## 3. Putting it in the kit

1. Put clips in `public/footage/` (trimmed, 30 fps, muted, H.264):
   `npx remotion ffmpeg -i in.mp4 -ss 1.2 -t 4 -r 30 -an -c:v libx264 -crf 18 public/footage/salon.mp4`
2. Use `<Footage src="footage/salon.mp4">` as the scene's ground; it covers the frame, pushes in
   slowly and darkens the bottom for type. Without `src` it draws a labelled placeholder, so the
   storyboard can be built and timed before footage exists.
3. Type over footage: `PhraseSwap` (a small lead over a big line that blurs from phrase to phrase),
   `Typewriter` (caps headline with key sounds), `LightSwitch` around the opening shot.
4. Sound: footage stays muted. On footage, **no effects, just the music** (Box's storyboard says so in
   as many words); keep effects for the light switch, typing and the turn.
5. Cut on the music: footage scenes are `bars(1, bpm)` or `beats(n, bpm)` long, hard cuts (`in: "cut"`).

## 4. Accuracy and disclosure

- Footage shows the world the product serves, not the product. A phone or laptop screen in a clip
  must not show a fake version of the app; blur it, angle it away, or cut to the real rebuilt screen.
- People in AI footage are not real customers; don't caption them as such ("Ada, owner of …").
- Say in the delivery note which clips are stock (with their source) and which are AI-generated, and
  which model made them. Some platforms ask for AI-generated content to be labelled; tell the user.

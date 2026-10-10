# Footage (B-roll)

Real-world footage (people at work, a shop, a court, a kitchen) makes a hook land: viewers recognise
themselves before they see any UI. Box's launch opens on a dark Pilates studio where a light switches
on, then a creator at her laptop, a stylist with a client, a padel club's courts, café and shop, each
with one line of kinetic type. The **Footage** look is built around this (`visual-styles.md`).

Claude can't make photorealistic footage in code. Get it from a library or a video model, or use
public-domain photos (section 3), then do all the type, timing and sound in Remotion.

## Contents

1. Where footage comes from
2. Generating it: prompts and rules
3. Photos instead of clips
4. Putting it in the kit
5. Accuracy and disclosure

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

## 3. Photos instead of clips

Still photos with a slow push-in, cut on the beat, read as shots. They suit an overlay video (type
over pictures) when there's no footage or no budget for a video model, or when the user asks for free
or public images. Prefer CC0 or public-domain photos: no permission, no attribution, edits allowed.

| Source | Licence | Notes |
|---|---|---|
| **Openverse** (`api.openverse.org/v1/images/`) | Filter `license=cc0,pdm` | One search over the sources below: `q`, `source=wordpress` (or `wikimedia`, `rawpixel`, `stocksnap`), `aspect_ratio=wide`, `page_size=20`. Fetch with curl: Python's default user agent gets 403 |
| **WordPress Photo Directory** (wordpress.org/photos) | CC0 | The best fit for 1080p: results link a 2048 px copy, and the same URL without its `-2048x1536` suffix is the 4000–6000 px original. Mostly places, food and objects |
| **Wikimedia Commons** | Some CC0 or public domain; most are CC BY-SA (credit required, check each) | Send a descriptive User-Agent, fetch one file at a time (bursts get 429), and ask for thumbnails only at standard widths (500 px works; arbitrary widths are refused) |
| **Rawpixel** public domain | CC0 | Free copies stop at 1300 px wide: soft at 1080p, fine for small insets |
| **StockSnap** | CC0 | API results link 960 px thumbnails; full size only through the site |
| **Pexels, Unsplash** | Their own free licences (not CC0) | Good people shots; their APIs need a key |

- **Resolution:** at least 2048 px wide for a 1920 frame (a 1.1 push-in shows about 2100 px of it).
  Resize larger originals to about 2560 px wide so renders stay quick.
- **Choose for the caption:** a calm area where the type sits (floor, sky, a wall). Busy shelves and
  markets need `darken` 0.7–0.8 or a scrim behind the line.
- **Logos, signs and faces:** a brand in shot reads as an endorsement. Crop it out with `origin` and
  `from` (start zoomed in towards the clean side), or blur it with a feathered mask (soft edges; a
  hard-edged box draws the eye). CC0 allows the edit; note it in the credits.
- **Move every still:** `from` → `zoom` (1 → 1.1) pushes in towards `origin`; `pan={[x, y]}` drifts.
  Vary the origin from shot to shot so the moves don't repeat.
- **One caption, several pictures:** `<Montage at={4} every={60} shots={[…]}>` with a `PhraseSwap` at
  the same `at` and `every` puts each phrase on its own photo, cut on the bar.
- **Credits:** list each file's title, creator, source page and licence in
  `public/footage/CREDITS.md`. CC0 needs no on-screen credit; CC BY does (an end card line).

## 4. Putting it in the kit

1. Put clips in `public/footage/` (trimmed, 30 fps, muted, H.264):
   `npx remotion ffmpeg -i in.mp4 -ss 1.2 -t 4 -r 30 -an -c:v libx264 -crf 18 public/footage/salon.mp4`
2. Use `<Footage src="footage/salon.mp4">` (or a photo, `footage/salon.jpg`) as the scene's ground;
   it covers the frame, pushes in slowly and darkens the bottom for type. Without `src` it draws a labelled placeholder, so the
   storyboard can be built and timed before footage exists.
3. Type over footage: `PhraseSwap` (a small lead over a big line that blurs from phrase to phrase),
   `Typewriter` (caps headline with key sounds), `LightSwitch` around the opening shot.
4. Sound: footage stays muted. On footage, **no effects, just the music** (Box's storyboard says so in
   as many words); keep effects for the light switch, typing and the turn.
5. Cut on the music with hard cuts (`in: "cut"`). A cut lands in the middle of its crossfade, so give
   each scene `beats(n, bpm) + crossfade` frames (the first and last scenes `+ crossfade / 2`). A
   scene's first frame on screen is then frame `crossfade / 2`, and its beats fall on
   `crossfade / 2 + k × beats(1, bpm)`: put hits (the switch, a punch, the lid) there.

## 5. Accuracy and disclosure

- Footage shows the world the product serves, not the product. A phone or laptop screen in a clip
  must not show a fake version of the app; blur it, angle it away, or cut to the real rebuilt screen.
- People in AI footage are not real customers; don't caption them as such ("Ada, owner of …").
- Say in the delivery note which clips and photos are stock (with their source and licence) and which
  are AI-generated, and which model made them. Some platforms ask for AI-generated content to be labelled; tell the user.

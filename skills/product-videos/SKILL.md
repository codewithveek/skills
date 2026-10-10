---
name: product-videos
description: "Make motion videos of a software or physical product with Remotion: launch videos, feature walkthroughs and tutorials, explainers, ads and 9:16 social cutdowns, in six visual styles (studio app window, editorial, graphic, cinematic, footage-led B-roll, type posters) with a recommended style per video type. Works from a codebase, a running app, screenshots, designs or just a description. Covers the story (hook, pain, solution, CTA) and storyboard, rebuilt app screens, camera and cursor, kinetic text, B-roll, voiceover, music, sound effects, captions, loudness and thumbnails. Use it whenever someone asks for a product, launch, demo or promo video, an explainer, walkthrough or tutorial video, motion graphics for an app, a video like a reference video or like Linear, Raycast or Vercel launches, a voiceover, music or sound effects for a video, captions, thumbnails, or a Reels, TikTok or Shorts version, even if they only say 'make a video of my app'. Also to change, re-time, re-voice or re-render such videos."
license: MIT
metadata:
  author: CodewithVeek
  version: "1.2.0"
  homepage: "https://github.com/CodewithVeek/skills"
---

# Product videos

Videos of a software product, made in code with [Remotion](https://www.remotion.dev): every frame is
React, rendered to MP4. The product's screens are **rebuilt** as components from the real app's
code and screenshots, so numbers can count up, text can be typed, and the camera can zoom without
blur. A starter project with all the machinery is in `assets/starter/`.

Three things make these videos good, and most of this skill serves them:

1. **Everything shown is real.** Every screen, label, status, button and behaviour exists in the
   product. Motion is free (zooms, a cursor, numbers counting up to their real value); invention is
   not (a button the app doesn't have, a toast it never shows, a live update it doesn't do). A
   video that demos fake UI misleads the people it is meant to convince. Read
   `references/accuracy.md` before building any screen.
2. **The words carry it.** A clear problem, one promise, short headlines, narration that says what
   the screen shows. Read `references/scriptwriting.md` before drafting.
3. **Sound finishes it.** Voice timed to the action, music ducked under it, a click on every click,
   a sound on each transition and motion moment (a stamp lands, a card is dealt, a number ticks) from
   the look's sound palette, one loudness for every file. All bundled effects are CC0 or made by the
   kit. Read `references/audio.md` before adding sound.

You cannot watch or listen to what you make. Check pictures as still frames (`stills.sh`) and sound
as numbers (`scripts/audio-report.mjs`), then tell the user plainly what they still need to judge
by eye and ear — usually pacing and music.

## Start: ask, then plan

Before building, settle these with the user. Ask only what the conversation hasn't answered, in one
batch, and offer a recommended default for each:

| Question | Why it matters | Default if they don't care |
|---|---|---|
| What product, and what can I learn it from? Code, a running app or URL (and a demo login), screenshots or a recording, designs, or only a description | Screens are rebuilt from the strongest real source (`references/accuracy.md`, sources of truth) | — must know; no codebase is fine |
| Brand assets: logo (SVG), colours (hex), fonts; product photos for physical products | Without them the video looks generic | Taken from the live site, or asked for once |
| Who is it for, and what should they do after? | Sets the style, script and call to action | Prospective users; "try it" |
| Which kind of video? (`references/styles.md`) | Structure, length, pacing | Launch for a new product, tutorial for a feature |
| Which visual style? Studio, Editorial, Graphic or Cinematic | How it looks and moves | The recommended look for the type (below); always say why |
| Length and shape: 16:9, 9:16, 1:1? | Layout and camera | 30–60 s, 16:9, plus a 9:16 cutdown on request |
| Script: will they write it, or should you? | If they bring one, check every claim against the product | You draft, they approve |
| Product name and brand: logo, colours, font | Title cards and the app frame | The app's own tokens; ask before inventing a name |
| Voiceover? Which voice? | Timing is driven by the narration | Yes, local Kokoro `af_heart`; ElevenLabs if they have a paid plan |
| Music: a real track they have or choose, AI-generated, or the kit's synth? | Licensing | The look's synth preset (`npm run music`), flagged as a placeholder; offer a CC0 or library track for a launch (`audio.md`) |
| Where should the output go? | Delivery | `out/` in the video project, outside their repo |

If they say "you choose", choose, say what you chose in one line each, and go.

**The visual style is always offered, with a recommendation and a reason.** Each video type has a
default look (`references/visual-styles.md` has the table): Editorial for most launches, feature drops
and explainers; Graphic for API and infrastructure products with little UI; Studio for tutorials,
onboarding and anything where the whole real screen matters; Cinematic for premium, quiet brands.
Adjust for the product's brand and where it will be watched (muted feeds favour the text-led
Editorial and Graphic). Tell the user which you recommend and why, in terms of *their* video, list
the other three in one line each, and go with the recommendation if they don't choose. If they point
at a reference video, name the closest look and what you will borrow from it.

**Story before storyboard.** Unless the user brings a story, draft one with them first
(`references/scriptwriting.md`, section 0): ask one question at a time, play back your understanding,
offer three angles with three hooks each, then write numbered lines marked hook, pain, solution and
CTA. Wait for approval.

Then show a **storyboard before building**: the look at the top, then scene by scene what is on
screen, the headline, the narration line (or on-screen words, for music-led looks), the transition
into it, and roughly how long. It is cheap to change words and order now and expensive later.
`references/styles.md` has proven structures to start from.

## Build

1. **Learn the product from the strongest source you have** (code and the running app, else the app
   alone, screenshots, designs; `references/accuracy.md`). From code: routes, page components, the exact
   button labels, status names and their colours, what happens after each action (a message? a
   redirect? nothing?), empty states, defaults. Grep for the strings you plan to show.
2. **Capture references.** Screenshot every screen and state the video will show from the running
   app (`assets/starter/reference/capture.mjs`, read-only: open dialogs, never confirm). These are
   the source of truth while rebuilding. Store them with the video project, not in the user's repo.
3. **Set up the project** by copying `assets/starter/` (next to this file) to the output location (outside the product's
   repo unless asked), then `npm install`. Copy the product's theme into `src/theme.ts` and
   `src/kit/tokens.ts` value for value, and set the name, tagline and mark in `src/brand.ts`.
4. **Write the cut list and narration** per video: `src/videos/<id>/timeline.ts` (the `look`, scenes,
   base lengths, each scene's `in` transition) and `narration.ts` (lines, the frame each aims for, respellings). Register the video in
   `src/Root.tsx`.
5. **Build scenes one at a time, with approval** (`scenes.tsx`) in the look's vocabulary. For a new
   look or a complex scene, show a still of the first scene before building the rest: mistakes
   compound when every scene is built at once. Then: `src/videos/editorial/` and
   `src/videos/graphic/` are working examples of the two text-led looks, `src/videos/example/` of
   Studio. Rebuild each screen from its reference screenshot with the kit's
   controls and an app frame shaped like the product's. Wrap anything the cursor or camera must
   reach in `<Anchor name="…">` and aim at names, never at hand-measured coordinates.
   `references/kit.md` explains the camera, pointer, anchors, scene reuse and the vertical layout.
6. **Generate sound**: `npm run voice` (scenes grow to fit their narration), `npm run music`.
   Effects come with the motion blocks and transitions; add `<Sfx name="confirm" at={…} />` for the
   one moment per scene that resolves, and nothing more.
7. **Check stills** at the moments that matter — every click, every typed value, every zoom, the
   last frame of each scene — and fix framing, overlaps and clipped text before rendering. Most
   problems are camera framing; widen the zoom or aim at a different anchor.
8. **Render** with `./render-all.sh`: MP4s, loudness at -16 LUFS, captions, thumbnails (as cover art,
   and as the opening frame, which is what X and most feeds show as the preview).
   Pull 2–3 frames from the finished files and run the audio report.
9. **Deliver.** Before re-rendering anything the user has already seen, copy the old files aside
   (`<name>-v2.mp4`); they may want to compare. Report what was made and how long each is, what is
   placeholder (music, data, hostnames, the product name), and anything you could not verify.

## Rules that save hours

- **Aim at anchors, not pixels.** Coordinates drift whenever layout changes; anchors follow.
- **Narration drives timing.** Write lines with an `at` frame next to the action they describe;
  the voice script places them and lengthens scenes that need room. Don't hand-time audio.
- **One name, one place.** Product name, tagline and mark live in `src/brand.ts`, so a rename is a
  one-line change and a re-render.
- **Reuse scenes across videos** (a launch video's product moments can be the tutorials' scenes) with
  `StepCopy` to change their headline. One verified screen, many videos.
- **Placeholder data is fine; placeholder features are not.** Example names, amounts and a
  `payouts.example.com` host are data. Say which data is illustrative when you deliver.
- **Stills before renders.** A full render takes minutes; a still takes seconds.
- **Don't trust a pipeline you haven't checked.** After the first render of a new setup, read the
  audio report and look at frames from the actual MP4, not only the stills.

`references/pitfalls.md` lists the specific bugs this process has hit, with fixes. Skim it when
something renders blank, off-centre, silent or wrong only in the final file.

## References

Read the one you need, when you need it:

| File | Read it when |
|---|---|
| `references/styles.md` | Choosing a video type; you need a structure, length and pacing |
| `references/visual-styles.md` | Choosing and recommending a look; building Editorial, Graphic, Cinematic, Footage or Poster scenes; studying a reference video |
| `references/footage.md` | B-roll: stock sources, AI video models and costs, prompts, putting clips in the kit, disclosure |
| `references/scriptwriting.md` | The story (hook, pain, solution, CTA; six angles), the script, headlines, narration, captions, reading time for on-screen words, or working from a user's script |
| `references/audio.md` | Voiceover, music, sound effects and each look's sound palette, levels, licensing, finding more CC0 sounds, ElevenLabs or other AI audio tools |
| `references/accuracy.md` | Before rebuilding any screen; deciding what may be shown |
| `references/kit.md` | Working in the starter project: looks, transitions, motion blocks, camera, cursor, anchors, scenes, vertical, thumbnails |
| `references/social.md` | 9:16 or 1:1 cutdowns, burned-in captions, platform specs, thumbnails |
| `references/pitfalls.md` | Something renders wrong, blank, silent or slowly |

## Delivering

End with a short report the user can act on:

- Each file: path, length, aspect, the look, and what it contains (video, captions `.vtt`, thumbnail).
- What is real and what is placeholder: illustrative data, a placeholder name or hostname, the
  music source, the voice (and that it is AI-generated if it is).
- What you checked (stills, frames from the MP4, audio report) and what they must judge themselves:
  watching it in motion and listening to it.
- How to change it: edit narration and re-run voice; edit `brand.ts`; `./render-all.sh`.
- Licences: Remotion is free for individuals and companies of up to three people; larger companies
  need a company licence. Music and voice licences per `references/audio.md`.

// The example video's cut list: scene ids, base lengths (30 fps) and fallback captions.
// Narration (narration.ts → npm run voice → voice.json) lengthens scenes that need more room,
// and once a video has a voice its captions are the narration.

export const VIDEO = {
  id: "example",
  title: "Example",
  crossfade: 12,
  scenes: [
    { id: "problem", frames: 150, cues: [{ from: 6, to: 150, text: "Setting things up shouldn't take a week." }] },
    { id: "title", frames: 100, cues: [{ from: 4, to: 100, text: "Introducing Acme." }] },
    { id: "demo", frames: 220, cues: [{ from: 4, to: 220, text: "Name it, save it, done." }] },
    { id: "outro", frames: 110, cues: [{ from: 4, to: 110, text: "Acme. The one-line promise, said plainly." }] },
  ],
};

// A graphic-look launch for a product with little UI: pixels → name, sources, formats, one big
// statement on a slab, the close. Fast cuts on the music; no narration, so the cues are the captions.

export const VIDEO = {
  id: "graphic",
  title: "Graphic",
  look: "graphic" as const,
  crossfade: 12,
  scenes: [
    { id: "intro", frames: 110, cues: [{ from: 6, to: 110, text: "Introducing Acme." }] },
    { id: "anywhere", frames: 90, in: "cut" as const, cues: [{ from: 4, to: 90, text: "Get data from anywhere," }] },
    { id: "sources", frames: 90, in: "fade" as const, cues: [{ from: 4, to: 90, text: "plus the tools you already use," }] },
    { id: "formats", frames: 140, in: "push" as const, cues: [{ from: 4, to: 140, text: "in every format you need." }] },
    { id: "statement", frames: 80, cues: [{ from: 4, to: 80, text: "All with one endpoint." }] },
    { id: "live", frames: 110, in: "zoom" as const, cues: [{ from: 4, to: 110, text: "Acme is live now." }] },
  ],
};

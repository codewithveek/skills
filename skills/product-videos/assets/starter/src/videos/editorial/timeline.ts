// An editorial-look launch: a number, the people it hurts, the brand on a circle of colour, two
// product moments, the offer. Music-led (no narration), so the cues are the captions.
// `in` picks how each scene arrives; the look's default (focus) is used where it's left out.

export const VIDEO = {
  id: "editorial",
  title: "Editorial",
  look: "editorial" as const,
  crossfade: 14,
  scenes: [
    { id: "stat", frames: 120, cues: [{ from: 6, to: 120, text: "Fourteen minutes. Every push." }] },
    { id: "waiting", frames: 120, cues: [{ from: 6, to: 120, text: "Your whole team, waiting." }] },
    { id: "brand", frames: 80, in: "circle" as const, origin: [0.5, 0.42] as [number, number], cues: [{ from: 6, to: 80, text: "Introducing Acme." }] },
    { id: "runs", frames: 140, in: "panel" as const, origin: [0.5, 0.5] as [number, number], cues: [{ from: 6, to: 140, text: "Builds start in seconds." }] },
    { id: "cache", frames: 140, cues: [{ from: 6, to: 140, text: "Cached for every branch." }] },
    { id: "price", frames: 110, in: "circle" as const, origin: [0.5, 0.5] as [number, number], cues: [{ from: 6, to: 110, text: "Starting from $19 a month per seat." }] },
  ],
};

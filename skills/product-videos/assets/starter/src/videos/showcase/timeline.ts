// A showcase-look launch: a typed-and-selected hook, a bracketed pivot, the brand on a gradient wipe,
// a live product moment, a swapping "track every …" line over lifting cards, and the close.
// Music-led (no narration), so the cues are the captions. Scenes left without `in` use the look's
// default transition (rise). Base lengths are at 30 fps.

export const VIDEO = {
  id: "showcase",
  title: "Showcase",
  look: "showcase" as const,
  crossfade: 12,
  scenes: [
    { id: "hook", frames: 105, cues: [{ from: 6, to: 105, text: "Release day has always been chaos." }] },
    { id: "pivot", frames: 96, cues: [{ from: 4, to: 96, text: "What if every push just shipped?" }] },
    { id: "brand", frames: 110, in: "wipe" as const, cues: [{ from: 6, to: 110, text: "Meet Acme. Builds that ship themselves." }] },
    { id: "demo", frames: 220, cues: [{ from: 4, to: 220, text: "Name it, save it, done." }] },
    { id: "track", frames: 150, cues: [{ from: 6, to: 150, text: "Track every build, deploy and rollback." }] },
    { id: "close", frames: 105, in: "wipe" as const, cues: [{ from: 6, to: 105, text: "Acme. The one-line promise, said plainly." }] },
  ],
};

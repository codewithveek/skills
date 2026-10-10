// A footage-look launch (Box-style): hook on footage, the turn, the problem as cards, the product,
// the close. Music-led; cues are the captions. Footage is placeholder until clips are added.
export const VIDEO = {
  id: "footage",
  title: "Footage",
  look: "footage" as const,
  crossfade: 8,
  scenes: [
    { id: "hook", frames: 100, cues: [{ from: 26, to: 100, text: "Every shop starts somewhere." }] },
    { id: "who", frames: 100, cues: [{ from: 4, to: 100, text: "The bakery that bakes at dawn, takes pre-orders, ships gift boxes." }] },
    { id: "turn", frames: 80, cues: [{ from: 2, to: 80, text: "But most tools do one thing." }] },
    { id: "juggle", frames: 160, in: "slab" as const, cues: [{ from: 50, to: 160, text: "So you juggle six tools." }] },
    { id: "intro", frames: 60, in: "pixels" as const, cues: [{ from: 4, to: 60, text: "What if it was one?" }] },
    { id: "step", frames: 110, in: "focus" as const, cues: [{ from: 4, to: 110, text: "Tell Acme how you sell." }] },
    { id: "close", frames: 110, in: "pixels" as const, cues: [{ from: 14, to: 110, text: "Acme. Now live. acme.example.com" }] },
  ],
};

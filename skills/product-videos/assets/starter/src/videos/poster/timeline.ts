// A poster-look ad (Taeillo-style): a question decodes on black, one word punched, the brand, one
// colour poster per product, the address. Music-led; cues are the captions. Products are stand-ins.
export const VIDEO = {
  id: "poster",
  title: "Poster",
  look: "poster" as const,
  crossfade: 10,
  scenes: [
    { id: "ask", frames: 110, cues: [{ from: 4, to: 110, text: "When did a guest last ask: where's that from?" }] },
    { id: "brand", frames: 60, in: "circle" as const, origin: [0.5, 0.5] as [number, number], cues: [{ from: 4, to: 60, text: "Introducing Acme." }] },
    { id: "orbit", frames: 60, in: "slash" as const, cues: [{ from: 4, to: 60, text: "Orbit armchair." }] },
    { id: "halo", frames: 60, in: "pixels" as const, cues: [{ from: 4, to: 60, text: "Halo lamp." }] },
    { id: "dune", frames: 60, in: "slash" as const, cues: [{ from: 4, to: 60, text: "Dune sofa." }] },
    { id: "shop", frames: 90, in: "pixels" as const, cues: [{ from: 4, to: 90, text: "Shop at acme.example.com" }] },
  ],
};

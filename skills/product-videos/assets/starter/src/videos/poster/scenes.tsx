import React from "react";
import { Armchair, Lamp, Sofa } from "lucide-react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { progress } from "../../anim";
import { PRODUCT } from "../../brand";
import { PosterName, Punch, Scramble } from "../../kit/Kinetic";
import { useLook } from "../../kit/looks";
import { fontFamily } from "../../theme";
import { Sfx } from "../../kit/Sfx";

// The poster look: a question that decodes on black, one word punched in, the brand, then one flat
// colour poster per product with its name huge behind it, and the address. Learned from Taeillo's ad.
// The products here are icon stand-ins: use cut-out product photos (<Img> of a transparent PNG).

const Center = ({ children, gap = 20 }: { children: React.ReactNode; gap?: number }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap }}>{children}</AbsoluteFill>
);

/* The hook: a line decodes out of noise, then one word lands hard */
export const Ask = () => {
  const look = useLook();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#0e0d0d" }}>
      <Center gap={40}>
        <div style={{ opacity: 1 - progress(frame, 56, 62) }}>
          <Scramble text="WHEN DID A GUEST LAST ASK" at={4} dur={22} size={84} color="#fff" />
        </div>
      </Center>
      <Center>{frame >= 60 && <Punch text="WHERE'S THAT FROM?" at={60} size={130} color={look.alarm} glitch />}</Center>
    </AbsoluteFill>
  );
};

/* The brand: an italic serif lead-in and the name */
export const Brand = () => {
  const frame = useCurrentFrame();
  const look = useLook();
  return (
    <AbsoluteFill style={{ background: look.canvas }}>
      <Sfx name="blip" at={14} />
      <Center>
        <div style={{ display: "flex", alignItems: "baseline", gap: 26 }}>
          <span style={{ fontFamily: look.serif, fontStyle: "italic", fontSize: 70, color: look.ink, opacity: progress(frame, 4, 12) }}>Introducing</span>
          <span style={{ fontFamily: look.font, fontSize: 120, color: look.ink, letterSpacing: -3, opacity: progress(frame, 14, 18) }}>{PRODUCT.toLowerCase()}</span>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

const Product = ({ children }: { children: React.ReactNode }) => (
  <div style={{ filter: "drop-shadow(0 30px 40px rgba(0,0,0,.35))" }}>{children}</div>
);

export const Orbit = () => (
  <PosterName name="ORBIT" at={2} background="#b9a6f3" color="#24124a" caption="Orbit armchair">
    <Product><Armchair size={520} strokeWidth={1.2} color="#24124a" fill="#e9e1ff" /></Product>
  </PosterName>
);
export const Halo = () => (
  <PosterName name="HALO" at={2} background="#e5532d" color="#fff3e8" caption="Halo lamp">
    <Product><Lamp size={520} strokeWidth={1.2} color="#3a1407" fill="#ffd9c7" /></Product>
  </PosterName>
);
export const Dune = () => (
  <PosterName name="DUNE" at={2} background="#f2c230" color="#2b2205" caption="Dune sofa">
    <Product><Sofa size={560} strokeWidth={1.2} color="#2b2205" fill="#3b4f8a" /></Product>
  </PosterName>
);

/* The close: the name and the address, decoding into place */
export const Shop = () => {
  const look = useLook();
  return (
    <AbsoluteFill style={{ background: look.canvas }}>
      <Center gap={14}>
        <span style={{ fontFamily: look.font, fontSize: 120, color: look.ink, letterSpacing: -3 }}>{PRODUCT.toLowerCase()}</span>
        <Scramble text="shop at acme.example.com" at={10} dur={18} size={34} color={look.ink} font={fontFamily} weight={500} glyphs="abcdefghijklmnopqrstuvwxyz." />
      </Center>
    </AbsoluteFill>
  );
};

export const SCENES = { ask: Ask, brand: Brand, orbit: Orbit, halo: Halo, dune: Dune, shop: Shop };

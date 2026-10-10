import React from "react";
import { CalendarCheck, CreditCard, Gift, Package, Receipt, Store } from "lucide-react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { progress } from "../../anim";
import { PRODUCT } from "../../brand";
import { Stage } from "../../kit/Backdrops";
import { CardDeck, Crate, Footage, LightSwitch, PhraseSwap, Punch, StepLabel, Typewriter, UrlPill } from "../../kit/Kinetic";
import { useLook } from "../../kit/looks";
import { Mark } from "../../kit/Mark";
import { AccentLine, Tilt } from "../../kit/Motion";

// The footage look: a human hook on footage, a turn on a dark screen, the problem as cards, the
// product, the close. Learned from Box's launch. Footage here is placeholder panels: put real or
// generated clips in public/footage/ and pass `src` (references/footage.md). Copy is illustrative.

const Center = ({ children, gap = 30 }: { children: React.ReactNode; gap?: number }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap }}>{children}</AbsoluteFill>
);

/* A dark room; the light switches on; a line types across it */
export const Hook = () => (
  <LightSwitch at={14}>
    <Footage label="a café before opening, chairs on tables">
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 200 }}>
        <Typewriter text="Every shop starts somewhere" caps at={26} size={40} color="#fff" />
      </AbsoluteFill>
    </Footage>
  </LightSwitch>
);

/* Who it's for: one business, the jobs it does, one phrase at a time over its footage */
export const Who = () => (
  <Footage label="a baker at the counter, morning light">
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 170 }}>
      <PhraseSwap lead="The bakery that" phrases={["bakes at dawn", "takes pre-orders", "ships gift boxes"]} at={4} every={32} color="#fff" />
    </AbsoluteFill>
  </Footage>
);

/* The turn: one word slams in, then becomes the start of the sentence */
export const Turn = () => {
  return (
    <AbsoluteFill>
      <Stage />
      <Center>
        <Punch text="But" at={2} size={300} color="#fff" settle={{ at: 26, scale: 0.3, x: 0, y: -60 }} />
        <div style={{ position: "absolute", top: "54%" }}>
          <AccentLine text="most tools do *one thing.*" at={32} size={64} color="#fff" />
        </div>
      </Center>
    </AbsoluteFill>
  );
};

const CARDS = [
  { label: "Orders", color: "#f97316", icon: <Package size={40} /> },
  { label: "Bookings", color: "#14b8a6", icon: <CalendarCheck size={40} /> },
  { label: "Payments", color: "#8b5cf6", icon: <CreditCard size={40} /> },
  { label: "Invoices", color: "#eab308", icon: <Receipt size={40} /> },
  { label: "Storefront", color: "#ec4899", icon: <Store size={40} /> },
  { label: "Gift cards", color: "#22c55e", icon: <Gift size={40} /> },
];

/* The problem as things: a card per tool, juggled, then dropped into one box that shuts */
export const Juggle = () => {
  const frame = useCurrentFrame();
  const look = useLook();
  return (
    <AbsoluteFill style={{ background: look.accent }}>
      <CardDeck cards={CARDS} keys={[{ f: 4, mode: "rows" }, { f: 56, mode: "fan" }, { f: 74, mode: "stack" }, { f: 88, mode: "fan" }, { f: 128, mode: "gather" }]} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 120, opacity: progress(frame, 100, 112) }}>
        <Crate at={100} closeAt={140} size={210} label={<Mark size={56} />} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 110 }}>
        <div style={{ opacity: 1 - progress(frame, 96, 106) }}>
          <AccentLine text="So you juggle *six tools.*" at={50} size={60} color="#fff" accentColor="#fff" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* The product, by name */
export const Intro = () => (
  <AbsoluteFill style={{ background: "#f4f4f2" }}>
    <Center>
      <AccentLine text={`What if it was *one?*`} at={4} size={56} color="#111" />
    </Center>
  </AbsoluteFill>
);

/* A product step: numbered label on the left, the real screen on the right */
export const Step = () => (
  <AbsoluteFill style={{ background: "#f4f4f2" }}>
    <div style={{ position: "absolute", left: 140, top: 420 }}>
      <StepLabel n={1} kicker="Set up" title={`Tell ${PRODUCT}\nhow you sell.`} at={4} color="#111" />
    </div>
    <div style={{ position: "absolute", right: 120, top: 220 }}>
      <Tilt at={2}>
        <div style={{ width: 960, height: 600, borderRadius: 18, background: "#fff", boxShadow: "0 40px 90px rgba(0,0,0,.18)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", color: "#9ca3af", fontSize: 24 }}>
          the product's real screen (rebuilt or a screenshot)
        </div>
      </Tilt>
    </div>
  </AbsoluteFill>
);

/* The close: mark, name, "Now live.", the address typed and clicked */
export const Close = () => {
  const frame = useCurrentFrame();
  const look = useLook();
  return (
    <AbsoluteFill style={{ background: "#f4f4f2" }}>
      <Center gap={22}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: progress(frame, 2, 10) }}>
          <Mark size={70} />
          <div style={{ fontFamily: look.font, fontSize: 80, fontWeight: 800, color: "#111", letterSpacing: -2 }}>{PRODUCT}</div>
        </div>
        <AccentLine text="Now live." at={14} size={34} color="#111" />
        <UrlPill url="acme.example.com" at={26} click={74} />
      </Center>
    </AbsoluteFill>
  );
};

export const SCENES = { hook: Hook, who: Who, turn: Turn, juggle: Juggle, intro: Intro, step: Step, close: Close };

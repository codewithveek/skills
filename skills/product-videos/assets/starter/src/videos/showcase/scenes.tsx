import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { progress } from "../../anim";
import { PRODUCT, TAGLINE } from "../../brand";
import { StepCopy } from "../../kit/AppStage";
import { Glow } from "../../kit/Backdrops";
import { useLook } from "../../kit/looks";
import { Mark } from "../../kit/Mark";
import { measured, MOTION } from "../../kit/measured";
import { Bracket, CurveLine, DropWords, Lift, SwapWord, TypeSelect } from "../../kit/showcase";
import { Demo } from "../example/scenes";

// The showcase look: white, a brand-to-violet gradient on accent words, words dropping in along
// curves, a live product moment, cards lifting out. Timing comes from kit/measured: motion measured
// frame by frame from a real launch video. Every value here is illustrative: use the product's own.

const Center = ({ children, gap = 36 }: { children: React.ReactNode; gap?: number }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap }}>{children}</AbsoluteFill>
);

/* The hook: a line types out, then the problem word is selected like text in an editor */
export const Hook = () => (
  <AbsoluteFill>
    <Glow strength={0.5} />
    <Center>
      <TypeSelect text="Release day has always been chaos" select="chaos" at={6} size={72} />
    </Center>
  </AbsoluteFill>
);

/* The pivot: a bracketed "But…", then the question in its own bracket */
export const Pivot = () => {
  const frame = useCurrentFrame();
  const look = useLook();
  const SWAP = 34;
  const first = 1 - progress(frame, SWAP - 6, SWAP, (x) => x);
  return (
    <AbsoluteFill>
      <Glow strength={0.5} />
      <Center>
        {frame < SWAP ? (
          <div style={{ opacity: first }}>
            <Bracket at={2}><span style={{ fontFamily: look.font, fontSize: 56, color: look.ink }}>But…</span></Bracket>
          </div>
        ) : (
          <Bracket at={SWAP}>
            <DropWords text="What if every push *just shipped?*" at={SWAP + 2} size={56} stagger={2} />
          </Bracket>
        )}
      </Center>
    </AbsoluteFill>
  );
};

/* The brand moment, entered on a gradient wipe: the mark settles, the name and promise drop in */
export const Brand = () => {
  const frame = useCurrentFrame();
  const settle = measured(frame, 4, MOTION.settle);
  return (
    <AbsoluteFill>
      <Glow />
      <Center gap={26}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, transform: `translateY(${(1 - settle) * 30}px)`, opacity: Math.min(1, settle * 2) }}>
          <Mark size={96} />
          <DropWords text={PRODUCT} at={8} size={110} weight={700} />
        </div>
        <DropWords text="Builds that *ship themselves.*" at={30} size={46} />
      </Center>
    </AbsoluteFill>
  );
};

/* A live product moment: the Studio example's demo, reused with this video's headline */
export const Product = () => (
  <StepCopy.Provider value={{ eyebrow: "Set up in a minute", text: "Name it, save it, done." }}>
    <Demo />
  </StepCopy.Provider>
);

const STATUSES = [
  { name: "feat/checkout", state: "Built", detail: "38 s", tone: "#16a34a" },
  { name: "v2.14.0", state: "Deployed", detail: "eu-west, us-east", tone: "#4f46e5" },
  { name: "v2.13.2", state: "Rolled back", detail: "in 9 s", tone: "#d97706" },
] as const;

/* One line, its last word swapping on a schedule, over cards that lift out one at a time */
export const Track = () => {
  const look = useLook();
  const EVERY = 40;
  return (
    <AbsoluteFill>
      <Glow />
      <CurveLine at={4} d="M -40 900 C 420 760, 760 980, 1960 820" width={4} />
      <Center gap={70}>
        <SwapWord lead="Track every" words={["build", "deploy", "rollback"]} at={4} every={EVERY} size={64} />
        <div style={{ display: "flex", gap: 28 }}>
          {STATUSES.map((status, index) => (
            <Lift key={status.name} at={14 + index * EVERY}>
              <div style={{ width: 330, background: look.card, borderRadius: 18, boxShadow: look.cardShadow, padding: "22px 24px", fontFamily: look.font }}>
                <div style={{ fontSize: 15, color: look.muted }}>{status.name}</div>
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, fontSize: 26, fontWeight: 600, color: look.ink }}>
                  <span style={{ width: 10, height: 10, borderRadius: 99, background: status.tone }} />
                  {status.state}
                </div>
                <div style={{ marginTop: 6, fontSize: 15, color: look.muted }}>{status.detail}</div>
              </div>
            </Lift>
          ))}
        </div>
      </Center>
    </AbsoluteFill>
  );
};

/* The close, on a gradient wipe: mark and name, the promise, the address */
export const Close = () => {
  const frame = useCurrentFrame();
  const look = useLook();
  const settle = measured(frame, 2, MOTION.settle);
  return (
    <AbsoluteFill>
      <Glow />
      <Center gap={22}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, transform: `scale(${0.92 + 0.08 * settle})`, opacity: Math.min(1, settle * 2) }}>
          <Mark size={84} />
          <span style={{ fontFamily: look.font, fontSize: 96, fontWeight: 700, letterSpacing: -3, color: look.ink }}>{PRODUCT}</span>
        </div>
        <DropWords text={TAGLINE} at={18} size={40} color={look.muted} />
        <div style={{ fontFamily: look.font, fontSize: 24, color: look.ink, opacity: progress(frame, 44, 56) }}>acme.example.com</div>
      </Center>
    </AbsoluteFill>
  );
};

export const SCENES = { hook: Hook, pivot: Pivot, brand: Brand, demo: Product, track: Track, close: Close };

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { pop, progress } from "../../anim";
import { PRODUCT } from "../../brand";
import { Paper, Slab } from "../../kit/Backdrops";
import { useLook } from "../../kit/looks";
import { Mark } from "../../kit/Mark";
import { AccentLine, Caption, CellGrid, Dealt, Odometer, PersonCard, RuleLabel, Stamp, Tilt } from "../../kit/Motion";
import { Sfx } from "../../kit/Sfx";
import { useFrameShape } from "../../kit/Stage";

// The editorial look: warm paper, one number or claim per scene, floating cards, focus pulls, and a
// brand-colour circle for the brand moments. Music-led; the words on screen carry the story.
// Every value here is illustrative: replace with the product's real numbers.

const Center = ({ children, gap = 48 }: { children: React.ReactNode; gap?: number }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap }}>{children}</AbsoluteFill>
);

/* The problem as one number: it rolls up to its value, the rule turns red when it lands */
export const Stat = () => (
  <AbsoluteFill>
    <Paper />
    <Center gap={36}>
      <RuleLabel label="Average wait for a build" at={0} width={760} hot={44} note="this week" />
      <Odometer value={14} from={0} at={6} dur={38} size={220} suffix=" min" />
      <AccentLine text="Fourteen minutes. *Every push.*" tone="alarm" at={46} size={44} />
    </Center>
  </AbsoluteFill>
);

/* Who it hurts: cards dealt onto the table, then a status stamped on each */
export const Waiting = () => {
  const look = useLook();
  const people = [["Maya Collins", "Frontend"], ["Ethan Brooks", "Platform"], ["Emma Clarke", "Mobile"]];
  return (
    <AbsoluteFill>
      <Paper />
      <Center gap={70}>
        <div style={{ display: "flex", gap: 28 }}>
          {people.map(([name, role], i) => (
            <Dealt key={name} at={4 + i * 7} rest={[-3, 1, 3][i]}>
              <PersonCard name={name} role={role} width={290} footer={<><span>Pushed 2 min ago</span><span>main</span></>}>
                <div style={{ marginTop: 16, height: 36 }}>
                  <Stamp at={40 + i * 8}>
                    <div style={{ border: `2px solid ${look.alarm}`, color: look.alarm, borderRadius: 6, padding: "4px 12px", fontWeight: 800, letterSpacing: 2, fontSize: 15 }}>WAITING</div>
                  </Stamp>
                </div>
              </PersonCard>
            </Dealt>
          ))}
        </div>
        <AccentLine text="Your whole team, *waiting.*" tone="alarm" at={30} size={44} />
      </Center>
    </AbsoluteFill>
  );
};

/* The brand moment, on a circle of brand colour: the mark pops, the name rises */
export const Brand = () => {
  const frame = useCurrentFrame();
  const look = useLook();
  return (
    <AbsoluteFill>
      <Slab dots />
      <Center gap={30}>
        <div style={{ transform: `scale(${pop(frame, 4, 200, 14)})` }}>
          <div style={{ background: "#fff", borderRadius: 30, padding: 10 }}><Mark size={110} /></div>
        </div>
        <AccentLine text={`Introducing ${PRODUCT}`} at={14} size={72} color={look.onAccent} />
      </Center>
    </AbsoluteFill>
  );
};

/* A product moment without window chrome: a light panel tilts in and settles, rows resolve one by one */
export const Runs = () => {
  const frame = useCurrentFrame();
  const look = useLook();
  const rows = [["feat/checkout", "38 s"], ["fix/login-redirect", "41 s"], ["main", "52 s"], ["chore/deps", "29 s"]];
  return (
    <AbsoluteFill>
      <Paper />
      <Center>
        <Tilt at={0}>
          <div style={{ width: 1080, background: "#fff", borderRadius: 18, boxShadow: look.cardShadow, padding: "34px 40px", fontFamily: look.font }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: look.ink, letterSpacing: -0.6 }}>Builds</div>
            <div style={{ fontSize: 16, color: look.muted, marginTop: 6 }}>Every push, every branch, started the moment it lands.</div>
            <div style={{ marginTop: 26, borderTop: `1px solid ${look.line}66` }}>
              {rows.map(([branch, time], i) => {
                const done = frame >= 46 + i * 14;
                return (
                  <div key={branch} style={{ display: "flex", alignItems: "center", padding: "16px 0", borderBottom: `1px solid ${look.line}66`, fontSize: 19, opacity: progress(frame, 14 + i * 5, 26 + i * 5) }}>
                    <div style={{ flex: 1, color: look.ink, fontWeight: 600 }}>{branch}</div>
                    <div style={{ width: 120, color: look.muted }}>{done ? time : "…"}</div>
                    <div style={{ width: 130, color: done ? "#1f9d55" : look.muted, fontWeight: 600 }}>● {done ? "Passed" : "Running"}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Tilt>
      </Center>
      <Caption text="Builds start in *seconds*" at={20} />
      {/* One confirmation when the last build passes, not one per row */}
      <Sfx name="confirm" at={46 + 3 * 14} />
    </AbsoluteFill>
  );
};

/* A process shown as a filling grid plus a card whose number rolls to done */
export const Cache = () => {
  const frame = useCurrentFrame();
  const look = useLook();
  const { portrait } = useFrameShape();
  const done = frame >= 96;
  return (
    <AbsoluteFill>
      <Paper />
      <Sfx name="confirm" at={96} />
      <div style={{ position: "absolute", left: portrait ? 60 : 140, top: portrait ? 260 : 150 }}>
        <AccentLine text="Cached for *every branch*" at={0} size={56} align="left" />
      </div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: portrait ? "column" : "row", gap: 90, paddingTop: 80 }}>
        <CellGrid rows={4} cols={7} at={14} dur={80} cell={46} gap={10} shade={(i) => 0.35 + ((i * 37) % 10) / 15} labels={{ rows: ["Week 1", "Week 2", "Week 3", "Week 4"], cols: ["M", "T", "W", "T", "F", "S", "S"] }} />
        <div style={{ transform: `scale(${done ? 1 + 0.04 * Math.max(0, 1 - (frame - 96) / 10) : 1})` }}>
          <div style={{ width: 340, background: "#fff", borderRadius: 16, boxShadow: look.cardShadow, padding: 26, fontFamily: look.font, border: done ? `2px solid ${look.accent}55` : "2px solid transparent" }}>
            <div style={{ fontSize: 14, letterSpacing: 2, color: look.muted, fontWeight: 600 }}>CACHE HIT RATE</div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Odometer value={100} from={0} at={14} dur={82} size={56} suffix="%" color={done ? look.accent : look.ink} />
            </div>
            <div style={{ height: 4, background: `${look.line}88`, borderRadius: 4, marginTop: 10 }}>
              <div style={{ height: 4, borderRadius: 4, background: look.accent, width: `${progress(frame, 14, 96, (x) => x) * 100}%` }} />
            </div>
            <div style={{ marginTop: 14, fontSize: 15, fontWeight: 600, color: done ? "#1f9d55" : look.muted }}>● {done ? "Warm and ready" : "Warming up"}</div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* The offer and the address, on brand colour */
export const Price = () => {
  const frame = useCurrentFrame();
  const look = useLook();
  return (
    <AbsoluteFill>
      <Slab dots />
      <Center gap={26}>
        <AccentLine text="Starting from" at={4} size={30} color={look.onAccent} weight={500} />
        <div style={{ display: "flex", alignItems: "baseline", gap: 16, color: look.onAccent }}>
          <Odometer value={19} from={0} at={8} dur={30} size={170} prefix="$" color={look.onAccent} />
          <AccentLine text="/mo per seat" at={30} size={40} color={look.onAccent} weight={600} />
        </div>
        <div style={{ opacity: progress(frame, 44, 58), display: "flex", alignItems: "center", gap: 14, fontFamily: look.font, fontSize: 34, fontWeight: 600, color: look.onAccent, marginTop: 30 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 4 }}><Mark size={36} /></div>
          acme.example.com
        </div>
      </Center>
    </AbsoluteFill>
  );
};

export const SCENES = { stat: Stat, waiting: Waiting, brand: Brand, runs: Runs, cache: Cache, price: Price };

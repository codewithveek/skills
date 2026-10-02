import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { pop, progress, rise } from "../anim";
import { c, fontFamily } from "../theme";
import { Mark } from "./Mark";
import { Backdrop, useFrameShape } from "./Stage";

/** Opening card: the mark, an eyebrow naming the audience, the title and one line under it. */
export const TitleCard = ({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) => {
  const frame = useCurrentFrame();
  const { portrait } = useFrameShape();
  const mark = pop(frame, 0, 190, 15);
  const words = title.split(" ");
  return (
    <AbsoluteFill style={{ fontFamily, alignItems: "center", justifyContent: "center" }}>
      <Backdrop glow={0.6} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", maxWidth: portrait ? 940 : 1400 }}>
        <div style={{ transform: `scale(${mark})`, boxShadow: `0 0 90px ${c.brand}99`, borderRadius: 22 }}>
          <Mark size={portrait ? 110 : 80} />
        </div>
        <div style={{ ...rise(frame, 6, 16), marginTop: 36, fontSize: portrait ? 30 : 22, fontWeight: 600, letterSpacing: 2.6, textTransform: "uppercase", color: c.brand300 }}>{eyebrow}</div>
        <div style={{ marginTop: 16, fontSize: portrait ? 92 : 76, fontWeight: 800, letterSpacing: -2.6, color: c.ink, lineHeight: 1.06 }}>
          {words.map((w, i) => (
            <span key={i} style={{ display: "inline-block", marginRight: 20, ...rise(frame, 10 + i * 3, 36, 20) }}>
              {w}
            </span>
          ))}
        </div>
        {sub && <div style={{ ...rise(frame, 16 + words.length * 3, 20), marginTop: 24, fontSize: portrait ? 38 : 30, color: c.muted }}>{sub}</div>}
      </div>
    </AbsoluteFill>
  );
};

/** Closing card: the mark, a line, an optional sub-line, and what to watch or do next. */
export const EndCard = ({ title, sub, next }: { title: string; sub?: string; next?: string }) => {
  const frame = useCurrentFrame();
  const { portrait } = useFrameShape();
  const mark = pop(frame, 0, 170, 16);
  return (
    <AbsoluteFill style={{ fontFamily, alignItems: "center", justifyContent: "center" }}>
      <Backdrop glow={0.75} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", maxWidth: portrait ? 960 : 1600 }}>
        <div style={{ transform: `scale(${mark})`, boxShadow: `0 0 120px ${c.brand}aa`, borderRadius: 30 }}>
          <Mark size={110} />
        </div>
        <div style={{ ...rise(frame, 10, 30, 20), fontSize: portrait ? 76 : 64, fontWeight: 800, letterSpacing: -2, color: c.ink, marginTop: 34, lineHeight: 1.08 }}>{title}</div>
        {sub && <div style={{ ...rise(frame, 18, 20, 20), fontSize: portrait ? 36 : 28, color: c.muted, marginTop: 14 }}>{sub}</div>}
        {next && (
          <div style={{ opacity: progress(frame, 30, 50), marginTop: 40, padding: "12px 22px", borderRadius: 999, border: `1px solid ${c.brand}66`, background: `${c.brand}1a`, fontSize: portrait ? 28 : 22, color: c.brand300, fontWeight: 600 }}>
            {next}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

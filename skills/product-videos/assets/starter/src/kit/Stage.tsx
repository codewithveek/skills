import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { progress, rise } from "../anim";
import { c } from "../theme";
import { useLook } from "./looks";

/** The backdrop every scene sits on: near-black, a slow coloured glow from below, a faint drifting grid. */
export const Backdrop = ({ glow = 0.55, hue = c.brand }: { glow?: number; hue?: string }) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 50) * 40;
  const alpha = Math.round(glow * 120).toString(16).padStart(2, "0");
  return (
    <AbsoluteFill style={{ background: c.canvas, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(900px 600px at ${50 + drift / 20}% 115%, ${hue}${alpha}, transparent 70%)` }} />
      <AbsoluteFill
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)",
          transform: `translateY(${-frame * 0.3}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Is this a portrait (9:16) or square frame? Layout sizes follow it. */
export const useFrameShape = () => {
  const { width, height } = useVideoConfig();
  return { width, height, portrait: height > width * 1.2, scale: width / 1920 };
};

/** A scene's headline: an eyebrow and a line that rises in word by word. Sized for the frame's shape. */
export const Headline = ({ eyebrow, text, at = 0, out }: { eyebrow: string; text: string; at?: number; out?: number }) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const { portrait } = useFrameShape();
  const fontFamily = look.font;
  const leave = out === undefined ? 0 : progress(frame, out, out + 12);
  return (
    <div style={{ position: "absolute", top: portrait ? 150 : 64, left: portrait ? 60 : 0, right: portrait ? 60 : 0, textAlign: "center", fontFamily, opacity: 1 - leave, transform: `translateY(${-leave * 20}px)` }}>
      <div style={{ ...rise(frame, at, 12), fontSize: portrait ? 30 : 20, fontWeight: 600, color: look.name === "studio" ? c.brand300 : look.accent, letterSpacing: 2.4, textTransform: "uppercase" }}>{eyebrow}</div>
      <div style={{ fontSize: portrait ? 70 : 50, lineHeight: 1.12, fontWeight: Math.min(700, look.weight + 100), color: look.ink, letterSpacing: -1.4, marginTop: portrait ? 20 : 10 }}>
        {text.split(" ").map((w, i) => (
          <span key={i} style={{ display: "inline-block", marginRight: portrait ? 18 : 14, ...rise(frame, at + 4 + i * 3, 30, 20) }}>
            {w}
          </span>
        ))}
      </div>
    </div>
  );
};

/** Big kinetic words, rising one by one from frame `at`. The building block of problem and close scenes. */
export const Words = ({ text, at, size, color, weight }: { text: string; at: number; size: number; color?: string; weight?: number }) => {
  const frame = useCurrentFrame();
  const look = useLook();
  return (
    <div style={{ fontFamily: look.font, fontSize: size, fontWeight: weight ?? look.weight, letterSpacing: size * look.tracking, lineHeight: 1.08, color: color ?? look.ink }}>
      {text.split(" ").map((w, i) => (
        <span key={i} style={{ display: "inline-block", marginRight: size * 0.26, ...rise(frame, at + i * 3, 36, 18) }}>
          {w}
        </span>
      ))}
    </div>
  );
};

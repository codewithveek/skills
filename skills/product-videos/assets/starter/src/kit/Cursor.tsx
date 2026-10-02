import React from "react";
import { Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { progress, track, type Key } from "../anim";
import { c } from "../theme";

/**
 * A pointer that glides between keyframes (screen coordinates) and clicks at the
 * given frames: it dips, and a ring spreads from the tip.
 */
export const Cursor = ({ path, clicks = [], show = [0, 1e6] }: { path: Key[]; clicks?: number[]; show?: [number, number] }) => {
  const frame = useCurrentFrame();
  const { x, y } = track(frame, path);
  const fadeIn = progress(frame, show[0], show[0] + 8);
  const fadeOut = 1 - progress(frame, show[1], show[1] + 8);

  let dip = 0;
  for (const f of clicks) {
    const d = frame - f;
    if (d >= -3 && d <= 6) dip = Math.max(dip, d < 0 ? (d + 3) / 3 : 1 - d / 6);
  }

  return (
    <div style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: Math.min(fadeIn, fadeOut), zIndex: 50 }}>
      {clicks.map((f) => (
        <Sequence key={`click-${f}`} from={f - 1} durationInFrames={14} layout="none">
          <Audio src={staticFile("sfx/mouse-click.wav")} volume={0.38} />
        </Sequence>
      ))}
      {clicks.map((f) => {
        const d = frame - f;
        if (d < 0 || d > 20) return null;
        const t = d / 20;
        const at = track(f, path);
        return (
          <div
            key={f}
            style={{
              position: "absolute",
              left: at.x - 28,
              top: at.y - 28,
              width: 56,
              height: 56,
              borderRadius: 28,
              border: `2px solid ${c.brand300}`,
              background: `${c.brand}22`,
              opacity: 1 - t,
              transform: `scale(${0.3 + t * 1.1})`,
            }}
          />
        );
      })}
      <svg
        width={26}
        height={30}
        viewBox="0 0 26 30"
        style={{
          position: "absolute",
          left: x - 3,
          top: y - 2,
          transform: `scale(${1 - dip * 0.18})`,
          transformOrigin: "3px 2px",
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.55))",
        }}
      >
        <path d="M3 2 L3 24 L9 18.5 L13 27.5 L17 25.8 L13 17 L21 17 Z" fill="#fff" stroke="#000" strokeWidth={1.6} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/** A text caret that blinks while idle and stays solid while typing. */
export const Caret = ({ typing }: { typing: boolean }) => {
  const frame = useCurrentFrame();
  const on = typing || Math.floor(frame / 15) % 2 === 0;
  return <span style={{ display: "inline-block", width: 2, height: "1.15em", background: c.brand300, marginLeft: 1, verticalAlign: "text-bottom", opacity: on ? 1 : 0 }} />;
};

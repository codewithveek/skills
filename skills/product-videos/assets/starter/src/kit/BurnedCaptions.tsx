import React from "react";
import { useCurrentFrame } from "remotion";
import { c, fontFamily } from "../theme";
import { useFrameShape } from "./Stage";

/** One caption on screen: [from, to] in video frames, and its text. */
export type Caption = { from: number; to: number; text: string };

/**
 * Captions drawn into the picture, for feeds that autoplay muted (most phone viewing). The same
 * sentences as the .vtt file. Sits above the bottom of the frame, clear of platform buttons.
 */
export const BurnedCaptions = ({ captions }: { captions: Caption[] }) => {
  const frame = useCurrentFrame();
  const { portrait, height } = useFrameShape();
  const now = captions.find((k) => frame >= k.from && frame < k.to);
  if (!now) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: portrait ? height * 0.14 : 56, display: "flex", justifyContent: "center", padding: "0 60px", pointerEvents: "none" }}>
      <div
        style={{
          fontFamily,
          fontSize: portrait ? 44 : 34,
          fontWeight: 700,
          lineHeight: 1.25,
          color: c.ink,
          textAlign: "center",
          maxWidth: portrait ? 900 : 1400,
          padding: "10px 22px",
          borderRadius: 14,
          background: "rgba(0,0,0,0.72)",
        }}
      >
        {now.text}
      </div>
    </div>
  );
};

/** The narration as sentence-level captions in video frames: the same split scripts/vtt.mts uses. */
export const captionsFrom = (lines: { from: number; frames: number; text: string }[]): Caption[] =>
  lines.flatMap((l) => {
    const sentences = l.text.split(/(?<=[.?!:])\s+(?=[A-Z0-9])/);
    const total = sentences.reduce((n, t) => n + t.length, 0);
    let t0 = l.from;
    return sentences.map((text, i) => {
      const from = t0;
      t0 += Math.round((l.frames * text.length) / total);
      return { from, to: i === sentences.length - 1 ? l.from + l.frames + 6 : t0, text };
    });
  });

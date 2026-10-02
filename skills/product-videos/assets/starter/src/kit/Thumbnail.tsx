import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { PRODUCT } from "../brand";
import { c, fontFamily } from "../theme";
import { Mark } from "./Mark";
import { Backdrop } from "./Stage";

/** Thumbnails are 240-frame compositions rendered at their last frame, so everything has finished animating. */
export const THUMB_FRAMES = 240;
export const THUMB_FRAME = THUMB_FRAMES - 1;

/**
 * A 16:9 thumbnail: brand, eyebrow and a two-line title on the left; one of the video's own
 * scenes on the right, held at frame `at` of that scene, with its headline cropped off (`crop`).
 * Thumbnails must show the real product: reuse a scene, never draw a fake one.
 */
export const Thumbnail = ({ eyebrow, title, Scene, at, crop = 214, zoom = 0.86 }: { eyebrow: string; title: [string, string]; Scene: () => React.JSX.Element; at: number; crop?: number; zoom?: number }) => (
  <AbsoluteFill style={{ fontFamily, background: c.canvas }}>
    <Backdrop glow={0.7} />
    <div style={{ position: "absolute", left: 700, top: 70, width: 1920 * zoom, height: (1080 - crop) * zoom, overflow: "hidden", borderRadius: 18 }}>
      <div style={{ width: 1920, height: 1080, transformOrigin: "0 0", transform: `scale(${zoom}) translateY(${-crop}px)` }}>
        <Sequence from={THUMB_FRAME - at} layout="none">
          <Scene />
        </Sequence>
      </div>
    </div>
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${c.canvas} 36%, ${c.canvas}e0 44%, transparent 60%)` }} />
    <div style={{ position: "absolute", left: 110, top: 0, bottom: 0, width: 780, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ boxShadow: `0 0 60px ${c.brand}99`, borderRadius: 16 }}>
          <Mark size={60} />
        </div>
        <div style={{ fontSize: 46, fontWeight: 800, letterSpacing: -1.4, color: c.ink }}>{PRODUCT}</div>
      </div>
      <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: 3.4, textTransform: "uppercase", color: c.brand300, marginTop: 52 }}>{eyebrow}</div>
      <div style={{ fontSize: 104, fontWeight: 800, letterSpacing: -4, lineHeight: 1.02, color: c.ink, marginTop: 18 }}>
        {title[0]}
        <br />
        <span style={{ color: c.brand300 }}>{title[1]}</span>
      </div>
    </div>
  </AbsoluteFill>
);

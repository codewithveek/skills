import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { PRODUCT } from "../brand";
import { c } from "../theme";
import { Stage } from "./Backdrops";
import { LookContext, LOOKS, type Look, type LookName } from "./looks";
import { Mark } from "./Mark";
import { GradientText } from "./showcase";
import { Backdrop } from "./Stage";

/** Thumbnails are 240-frame compositions rendered at their last frame, so everything has finished animating. */
export const THUMB_FRAMES = 240;
export const THUMB_FRAME = THUMB_FRAMES - 1;

const isDark = (look: Look) => look.name === "studio" || look.name === "cinematic";

/** The title's second line in the look's accent: the gradient in showcase, the flat accent in other light looks. */
const AccentLine = ({ look, children }: { look: Look; children: string }) => {
  if (isDark(look)) return <span style={{ color: c.brand300 }}>{children}</span>;
  if (look.gradient) return <GradientText>{children}</GradientText>;
  return <span style={{ color: look.accent }}>{children}</span>;
};

export type ThumbnailProps = {
  eyebrow: string;
  title: [string, string];
  Scene: () => React.JSX.Element;
  /** Frame of the scene to hold: pick a resolved, telling moment. */
  at: number;
  /** The video's look; the thumbnail is drawn in it, and so is the scene. Defaults to studio. */
  look?: LookName;
  /** Pixels cropped off the top of the scene (its headline). */
  crop?: number;
  zoom?: number;
};

/**
 * A 16:9 thumbnail in the video's look: brand, eyebrow and a two-line title on the left; one of the
 * video's own scenes on the right, held at frame `at` of that scene, with its headline cropped off
 * (`crop`). Dark looks (studio, cinematic) sit on the glowing backdrop; light looks (editorial,
 * graphic, showcase) on their own ground, in their ink and accent. Thumbnails must show the real
 * product: reuse a scene, never draw a fake one.
 */
export const Thumbnail = ({ eyebrow, title, Scene, at, look: lookName = "studio", crop = 214, zoom = 0.86 }: ThumbnailProps) => {
  const look = LOOKS[lookName];
  const dark = isDark(look);
  const canvas = dark ? c.canvas : look.canvas;
  const ink = dark ? c.ink : look.ink;
  return (
    <LookContext.Provider value={look}>
      <AbsoluteFill style={{ fontFamily: look.font, background: canvas }}>
        {dark ? <Backdrop glow={0.7} /> : <Stage />}
        <div style={{ position: "absolute", left: 700, top: 70, width: 1920 * zoom, height: (1080 - crop) * zoom, overflow: "hidden", borderRadius: 18, boxShadow: dark ? undefined : look.cardShadow }}>
          <div style={{ width: 1920, height: 1080, transformOrigin: "0 0", transform: `scale(${zoom}) translateY(${-crop}px)` }}>
            <Sequence from={THUMB_FRAME - at} layout="none">
              <Scene />
            </Sequence>
          </div>
        </div>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${canvas} 36%, ${canvas}e0 44%, transparent 60%)` }} />
        <div style={{ position: "absolute", left: 110, top: 0, bottom: 0, width: 800, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ boxShadow: dark ? `0 0 60px ${c.brand}99` : undefined, borderRadius: 16 }}>
              <Mark size={60} />
            </div>
            <div style={{ fontSize: 46, fontWeight: Math.max(700, look.weight), letterSpacing: -1.4, color: ink }}>{PRODUCT}</div>
          </div>
          <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: 3.4, textTransform: "uppercase", color: dark ? c.brand300 : look.accent, marginTop: 52 }}>{eyebrow}</div>
          <div style={{ fontSize: 104, fontWeight: dark ? 800 : Math.max(600, look.weight), letterSpacing: -4, lineHeight: 1.02, color: ink, marginTop: 18 }}>
            {title[0]}
            <br />
            <AccentLine look={look}>{title[1]}</AccentLine>
          </div>
        </div>
      </AbsoluteFill>
    </LookContext.Provider>
  );
};

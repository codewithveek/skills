import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MarkIcon } from "../brand";
import { useLook } from "./looks";
import { Backdrop } from "./Stage";

// Backdrops for each look. `Stage` picks the right one for the video's look, so a scene written
// with <Stage /> works in any look; use the specific ones when a scene needs a particular ground.

/** Warm paper with a soft vignette: the editorial look's ground. */
export const Paper = () => {
  const look = useLook();
  return (
    <AbsoluteFill style={{ background: look.canvas }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 70% at 50% 45%, rgba(255,255,255,0.55), transparent 70%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 120% 110% at 50% 50%, transparent 55%, rgba(60,52,40,0.16))" }} />
    </AbsoluteFill>
  );
};

/** Near-white with a fine square grid fading out from the centre: the graphic look's ground. `dark` inverts it. */
export const Blueprint = ({ dark = false, size = 96 }: { dark?: boolean; size?: number }) => {
  const look = useLook();
  const ln = dark ? "rgba(255,255,255,0.09)" : look.line;
  return (
    <AbsoluteFill style={{ background: dark ? "#0a0a0a" : look.canvas }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${ln} 1px, transparent 1px), linear-gradient(90deg, ${ln} 1px, transparent 1px)`,
          backgroundSize: `${size}px ${size}px`,
          backgroundPosition: "center center",
          maskImage: "radial-gradient(ellipse 80% 75% at 50% 50%, black 30%, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 75% at 50% 50%, black 30%, transparent)",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * Full-bleed brand colour with a soft light from above and an optional huge outline of the mark as a
 * watermark: brand moments, prices, the close. `dots` adds a faint dot texture (editorial).
 */
export const Slab = ({ watermark = false, dots = false }: { watermark?: boolean; dots?: boolean }) => {
  const look = useLook();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: look.accent, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(255,255,255,0.16), transparent 70%)" }} />
      {dots && <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.13) 1.4px, transparent 1.6px)", backgroundSize: "26px 26px", maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent)", WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent)" }} />}
      {watermark && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 0.16, transform: `scale(${1.02 + frame * 0.0006})` }}>
          <MarkIcon size={1100} strokeWidth={0.35} color={look.onAccent} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/** The current look's default ground. */
export const Stage = () => {
  const look = useLook();
  if (look.name === "editorial") return <Paper />;
  if (look.name === "graphic") return <Blueprint />;
  if (look.name === "cinematic") return <Backdrop glow={0.4} />;
  return <Backdrop />;
};

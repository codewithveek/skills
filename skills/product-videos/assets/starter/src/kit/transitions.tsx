import React from "react";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import type { Look, TransitionName } from "./looks";

// Scene hand-overs, each a @remotion/transitions presentation. Plain CSS (clip-path, blur,
// transforms), so they render the same in stills, the studio and the final file.
//   fade   crossfade                                   any look; the safe default
//   focus  old scene blurs and drifts, new one sharpens   editorial, cinematic: between beats of one story
//   circle a brand-colour circle grows from a point     the brand moment ("Introducing", price, close)
//   panel  a rounded panel grows to full bleed          from a small element into its own scene
//   slab   a brand-colour slab sweeps up across         graphic: section changes, big statements
//   zoom   concentric squares zoom through to the next  graphic: into the close / logo
//   push   the new scene pushes the old one out         lists, sequences, "next"
//   cut    a hard cut at the midpoint                   on a music hit

type P = { look: Look; x: number; y: number };
const io = Easing.bezier(0.65, 0, 0.35, 1);
const out = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (p: number, a: number, b: number, e = io) => interpolate(p, [a, b], [0, 1], { ...clamp, easing: e });

const Focus = ({ children, presentationProgress: p, presentationDirection: d }: TransitionPresentationComponentProps<P>) => {
  if (d === "exiting") {
    const t = ease(p, 0, 0.7);
    return <AbsoluteFill style={{ opacity: 1 - t, filter: `blur(${t * 14}px)`, transform: `scale(${1 + t * 0.04})` }}>{children}</AbsoluteFill>;
  }
  const t = ease(p, 0.25, 1, out);
  return <AbsoluteFill style={{ opacity: t, filter: `blur(${(1 - t) * 14}px)`, transform: `scale(${0.97 + t * 0.03})` }}>{children}</AbsoluteFill>;
};

const Circle = ({ children, presentationProgress: p, presentationDirection: d, passedProps: { x, y } }: TransitionPresentationComponentProps<P>) => {
  if (d === "exiting") return <AbsoluteFill>{children}</AbsoluteFill>;
  // A dot appears, then grows (slow start, fast middle, soft landing) until it covers the frame
  const r = interpolate(ease(p, 0, 1), [0, 1], [0.4, 125]);
  return <AbsoluteFill style={{ clipPath: `circle(${r}% at ${x * 100}% ${y * 100}%)` }}>{children}</AbsoluteFill>;
};

const Panel = ({ children, presentationProgress: p, presentationDirection: d, passedProps: { x, y } }: TransitionPresentationComponentProps<P>) => {
  if (d === "exiting") {
    const t = ease(p, 0.3, 1);
    return <AbsoluteFill style={{ filter: `blur(${t * 6}px)`, transform: `scale(${1 - t * 0.03})` }}>{children}</AbsoluteFill>;
  }
  // A small rounded card at (x, y) grows to fill the frame, its corners straightening as it lands
  const t = ease(p, 0, 1);
  const top = y * 100 * (1 - t), bottom = (1 - y) * 100 * (1 - t), left = x * 100 * (1 - t), right = (1 - x) * 100 * (1 - t);
  return <AbsoluteFill style={{ clipPath: `inset(${top}% ${right}% ${bottom}% ${left}% round ${(1 - t) * 48}px)`, opacity: ease(p, 0, 0.08) }}>{children}</AbsoluteFill>;
};

const Slab = ({ children, presentationProgress: p, presentationDirection: d, passedProps: { look } }: TransitionPresentationComponentProps<P>) => {
  if (d === "exiting") return <AbsoluteFill style={{ transform: `translateY(${-ease(p, 0, 0.5) * 6}%)` }}>{children}</AbsoluteFill>;
  // The slab rises over the old scene, the new scene is swapped in underneath, the slab leaves upwards
  const rise = ease(p, 0, 0.5);
  const leave = ease(p, 0.5, 1);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: p >= 0.5 ? 1 : 0 }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ background: look.accent, transform: `translateY(${(1 - rise) * 100 - leave * 100}%)` }} />
    </AbsoluteFill>
  );
};

const Zoom = ({ children, presentationProgress: p, presentationDirection: d, passedProps: { look } }: TransitionPresentationComponentProps<P>) => {
  if (d === "exiting") {
    const t = ease(p, 0, 1, Easing.in(Easing.cubic));
    return <AbsoluteFill style={{ transform: `scale(${1 + t * 2.5})`, opacity: 1 - ease(p, 0.6, 0.9) }}>{children}</AbsoluteFill>;
  }
  // Concentric outlined squares stream out of the centre; the new scene opens through the innermost
  const t = ease(p, 0, 1);
  const rings = [0, 1, 2, 3, 4].map((i) => Math.max(0, t * 1.6 - i * 0.18));
  const hole = Math.max(0, ease(p, 0.45, 1)) * 150;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(${50 - hole / 2}% ${50 - hole / 2}%)` }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none", opacity: 1 - ease(p, 0.85, 1) }}>
        {rings.map((s, i) => (
          <div key={i} style={{ position: "absolute", width: `${s * 70}vmin`, height: `${s * 70}vmin`, border: `${4 + s * 26}px solid ${look.accent}` }} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Cut = ({ children, presentationProgress: p, presentationDirection: d }: TransitionPresentationComponentProps<P>) => (
  <AbsoluteFill style={{ opacity: d === "exiting" ? (p < 0.5 ? 1 : 0) : p >= 0.5 ? 1 : 0 }}>{children}</AbsoluteFill>
);

const make = (component: (props: TransitionPresentationComponentProps<P>) => React.ReactNode, look: Look, x = 0.5, y = 0.5): TransitionPresentation<P> => ({ component, props: { look, x, y } });

/** The presentation for a named transition. `origin` is where a circle or panel starts, as fractions of the frame. */
export const presentationFor = (name: TransitionName, look: Look, origin: [number, number] = [0.5, 0.5]): TransitionPresentation<Record<string, unknown>> => {
  const [x, y] = origin;
  const p = (() => {
    switch (name) {
      case "focus": return make(Focus, look);
      case "circle": return make(Circle, look, x, y);
      case "panel": return make(Panel, look, x, y);
      case "slab": return make(Slab, look);
      case "zoom": return make(Zoom, look);
      case "cut": return make(Cut, look);
      case "push": return slide({ direction: "from-right" });
      default: return fade();
    }
  })();
  return p as unknown as TransitionPresentation<Record<string, unknown>>;
};

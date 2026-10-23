import type { CSSProperties } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { MotionPreset } from "../runtime/motion-preset";
import { presetDurationInFrames, presetValue } from "../runtime/motion-preset";

export interface PresetReplayProps extends Record<string, unknown> {
  readonly preset: MotionPreset;
  readonly holdBeforeFrames: number;
  readonly holdAfterFrames: number;
}

const CARD_WIDTH = 640;
const CARD_HEIGHT = 400;
const STRIPE_COLOURS = ["#4F46E5", "#A855F7", "#0EA5E9", "#16A34A", "#F59E0B"] as const;

/** Textured card so optical flow has detail to track (flat fills only produce flow at edges). */
function TexturedCard(): JSX.Element {
  return (
    <div style={{ width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: 24, background: "#ffffff", boxShadow: "0 24px 60px rgba(15,23,42,0.18)", padding: 32, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 18, overflow: "hidden" }}>
      <div style={{ fontFamily: "sans-serif", fontSize: 40, fontWeight: 700, color: "#111827" }}>Motion check</div>
      {STRIPE_COLOURS.map((colour, index) => (
        <div key={colour} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 36, height: 36, borderRadius: 18, background: colour }} />
          <div style={{ height: 14, width: 420 - index * 55, borderRadius: 7, background: "#E5E7EB" }} />
          <div style={{ height: 14, width: 60 + index * 20, borderRadius: 7, background: colour, opacity: 0.6 }} />
        </div>
      ))}
    </div>
  );
}

function cardTransform(preset: MotionPreset, value: number): CSSProperties {
  switch (preset.channel) {
    case "translateX":
      return { transform: `translateX(${value - preset.travel / 2}px)` };
    case "translateY":
      return { transform: `translateY(${value - preset.travel / 2}px)` };
    case "scale":
      return { transform: `scale(${value})` };
    case "progress":
      // No single property: replay as a horizontal move so the timing is still measurable.
      return { transform: `translateX(${(value - 0.5) * 600}px)` };
  }
}

export function PresetReplay(props: PresetReplayProps): JSX.Element {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const beatFrame = Math.min(Math.max(0, frame - props.holdBeforeFrames), presetDurationInFrames(props.preset, fps));
  const value = presetValue({ frame: beatFrame, fps, preset: props.preset });
  return (
    <AbsoluteFill style={{ background: "#F5F5F7", alignItems: "center", justifyContent: "center" }}>
      <div style={cardTransform(props.preset, value)}>
        <TexturedCard />
      </div>
    </AbsoluteFill>
  );
}

export function replayDurationInFrames(props: PresetReplayProps, fps: number): number {
  return props.holdBeforeFrames + presetDurationInFrames(props.preset, fps) + props.holdAfterFrames;
}

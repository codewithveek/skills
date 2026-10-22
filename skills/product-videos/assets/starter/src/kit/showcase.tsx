import React, { type CSSProperties, type ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { progress, typed } from "../anim";
import { FPS } from "../theme";
import { accentStyle, useLook } from "./looks";
import { measured, MOTION } from "./measured";

// Motion blocks for the showcase look, each timed with motion measured from a real launch video
// (kit/measured). Like Motion.tsx they take `at`, the frame they start on, and read colours from the
// look. Accent words are written in *asterisks* and drawn in the look's gradient.

type Word = { readonly text: string; readonly accent: boolean };

/** Split "Track every *application*" into words, marking the starred ones as accents. */
export const parseAccents = (text: string): Word[] => {
  const words: Word[] = [];
  let inAccent = false;
  for (const raw of text.split(" ")) {
    if (raw.startsWith("*")) inAccent = true;
    words.push({ text: raw.replace(/\*/g, ""), accent: inAccent });
    if (raw.endsWith("*")) inAccent = false;
  }
  return words;
};

/**
 * An accent word in the current look: the gradient in showcase, otherwise the accent colour set in the
 * look's accent face (EB Garamond italic in editorial, Instrument Serif italic in cinematic).
 */
export const AccentWord = ({ children }: { children: ReactNode }) => {
  const look = useLook();
  if (look.gradient) return <GradientText>{children}</GradientText>;
  return <span style={{ color: look.accent, ...accentStyle(look) }}>{children}</span>;
};

/** Text filled with the look's two-stop gradient (falls back to the flat accent). */
export const GradientText = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => {
  const look = useLook();
  const [from, to] = look.gradient ?? [look.accent, look.accent];
  return (
    <span style={{ background: `linear-gradient(90deg, ${from}, ${to})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", ...style }}>
      {children}
    </span>
  );
};

type TextBlockProps = {
  readonly text: string;
  readonly at?: number;
  readonly size?: number;
  readonly align?: "left" | "center";
  readonly color?: string;
  readonly weight?: number;
};

/**
 * Words drop in one by one along a short curved path — falling from above-right, swinging into
 * place — the showcase look's headline move. Sideways settle uses the measured `wordSettle`
 * (clamped spring), the fall uses `textRise`, so each word lands without bouncing.
 */
export const DropWords = ({ text, at = 0, size = 64, align = "center", color, weight, stagger = 3 }: TextBlockProps & { readonly stagger?: number }) => {
  const frame = useCurrentFrame();
  const look = useLook();
  return (
    <div style={{ fontFamily: look.font, fontSize: size, fontWeight: weight ?? look.weight, letterSpacing: size * look.tracking, lineHeight: 1.15, color: color ?? look.ink, textAlign: align }}>
      {parseAccents(text).map((word, index) => {
        const start = at + index * stagger;
        const across = measured(frame, start, MOTION.wordSettle);
        const down = measured(frame, start, MOTION.textRise);
        const style: CSSProperties = {
          display: "inline-block",
          marginRight: size * 0.26,
          opacity: progress(frame, start, start + 4, (x) => x),
          transform: `translate(${(1 - across) * size * 0.9}px, ${-(1 - down) * size * 1.1}px) rotate(${(1 - across) * 9}deg)`,
          transformOrigin: "left bottom",
        };
        return (
          <span key={index} style={style}>
            {word.accent ? <AccentWord>{word.text}</AccentWord> : word.text}
          </span>
        );
      })}
    </div>
  );
};

/**
 * A line whose last word swaps in place on a schedule: "Track every *application*" → "*task*".
 * The old word lifts away (`chainStep`), the new one rises in with a ~10% overshoot (`swapOvershoot`).
 * All words share one grid cell, so the line never reflows.
 */
export const SwapWord = ({ lead, words, at = 0, every = 45, size = 56 }: { readonly lead: string; readonly words: readonly string[]; readonly at?: number; readonly every?: number; readonly size?: number }) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const current = Math.min(words.length - 1, Math.max(0, Math.floor((frame - at) / every)));
  return (
    <div style={{ fontFamily: look.font, fontSize: size, fontWeight: look.weight, letterSpacing: size * look.tracking, color: look.ink, display: "inline-flex", alignItems: "baseline", gap: size * 0.26, whiteSpace: "nowrap" }}>
      <span>{lead}</span>
      <span style={{ display: "inline-grid", overflow: "hidden", paddingBottom: size * 0.12, marginBottom: -size * 0.12 }}>
        {words.map((word, index) => {
          const swapIn = at + index * every;
          const entering = index === 0 ? measured(frame, at, MOTION.textRise) : measured(frame, swapIn, MOTION.swapOvershoot);
          const leaving = index < words.length - 1 ? measured(frame, swapIn + every, MOTION.chainStep) : 0;
          const visible = index === current || (index === current - 1 && leaving < 1);
          return (
            <span key={word} style={{ gridArea: "1 / 1", visibility: visible ? "visible" : "hidden", transform: `translateY(${(1 - entering) * 100 - leaving * 100}%)`, opacity: 1 - leaving }}>
              <AccentWord>{word}</AccentWord>
            </span>
          );
        })}
      </span>
    </div>
  );
};

/**
 * Text typed with a caret, then one word selected as if by a cursor: a tinted box with handles grows
 * across it. The showcase hook ("Release day has always been *chaos*"). `select` must appear in `text`.
 */
export const TypeSelect = ({ text, select, at = 0, cps = 22, size = 64, selectAt }: { readonly text: string; readonly select: string; readonly at?: number; readonly cps?: number; readonly size?: number; readonly selectAt?: number }) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const shown = typed(frame, text, at, cps);
  const typingDone = shown.length === text.length;
  const selectStart = text.indexOf(select);
  if (selectStart < 0) throw new Error(`TypeSelect: "${select}" is not in "${text}"`);
  const startSelecting = selectAt ?? at + Math.ceil((text.length / cps) * FPS) + 10;
  const grow = measured(frame, startSelecting, MOTION.scrollStep);
  const before = shown.slice(0, selectStart);
  const selected = shown.slice(selectStart, selectStart + select.length);
  const after = shown.slice(selectStart + select.length);
  const caretOn = !typingDone || Math.floor(frame / 15) % 2 === 0;
  const handle: CSSProperties = { position: "absolute", top: -size * 0.08, bottom: -size * 0.08, width: 3, background: look.accent, opacity: grow > 0.02 ? 1 : 0 };
  return (
    <div style={{ fontFamily: look.font, fontSize: size, fontWeight: look.weight, letterSpacing: size * look.tracking, color: look.ink, whiteSpace: "pre" }}>
      {before}
      <span style={{ position: "relative", display: "inline-block" }}>
        <span style={{ position: "absolute", left: 0, top: size * 0.04, bottom: size * 0.02, width: `${grow * 100}%`, background: `${look.accent}2e`, borderRadius: 4 }} />
        {selected}
        {selected.length === select.length && (
          <>
            <span style={{ ...handle, left: -2 }}><span style={{ position: "absolute", top: -7, left: -4, width: 11, height: 11, borderRadius: 99, background: look.accent }} /></span>
            <span style={{ ...handle, left: `calc(${grow * 100}% - 1px)` }}><span style={{ position: "absolute", bottom: -7, left: -4, width: 11, height: 11, borderRadius: 99, background: look.accent }} /></span>
          </>
        )}
      </span>
      {after}
      <span style={{ display: "inline-block", width: 3, height: size * 0.9, marginLeft: 4, verticalAlign: "-0.1em", background: look.accent, opacity: caretOn && grow === 0 ? 1 : 0 }} />
    </div>
  );
};

/** Corner brackets around a line ("But…", "What if you only needed one app"), springing in with a small overshoot. */
export const Bracket = ({ at = 0, children, pad = 22, arm = 18 }: { readonly at?: number; readonly children: ReactNode; readonly pad?: number; readonly arm?: number }) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const grow = measured(frame, at, MOTION.swapOvershoot);
  const corner = (position: CSSProperties, borders: CSSProperties) => (
    <span style={{ position: "absolute", width: arm, height: arm, borderColor: look.ink, borderStyle: "solid", borderWidth: 0, ...borders, ...position }} />
  );
  return (
    <div style={{ position: "relative", display: "inline-block", padding: `${pad * 0.6}px ${pad}px`, transform: `scale(${1.12 - 0.12 * grow})`, opacity: progress(frame, at, at + 6, (x) => x) }}>
      {corner({ left: 0, top: 0 }, { borderLeftWidth: 2, borderTopWidth: 2 })}
      {corner({ right: 0, top: 0 }, { borderRightWidth: 2, borderTopWidth: 2 })}
      {corner({ left: 0, bottom: 0 }, { borderLeftWidth: 2, borderBottomWidth: 2 })}
      {corner({ right: 0, bottom: 0 }, { borderRightWidth: 2, borderBottomWidth: 2 })}
      {children}
    </div>
  );
};

/** A card lifting out of the screen toward the viewer: it rises, grows slightly and its shadow deepens (`settle`). */
export const Lift = ({ at = 0, children, rise = 36, grow = 0.05 }: { readonly at?: number; readonly children: ReactNode; readonly rise?: number; readonly grow?: number }) => {
  const frame = useCurrentFrame();
  const t = measured(frame, at, MOTION.settle);
  return (
    <div style={{ transform: `translateY(${-rise * t}px) scale(${1 + grow * t})`, filter: `drop-shadow(0 ${8 + 22 * t}px ${18 + 30 * t}px rgba(60,40,140,${0.08 + 0.12 * t}))` }}>
      {children}
    </div>
  );
};

/**
 * A curved line drawing itself across the frame in the gradient — a section change or a pointer
 * from one idea to the next. `d` is an SVG path in 1920x1080 space.
 */
export const CurveLine = ({ at = 0, d, width = 6 }: { readonly at?: number; readonly d: string; readonly width?: number }) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const [from, to] = look.gradient ?? [look.accent, look.accent];
  const drawn = Math.max(0, Math.min(1, measured(frame, at, MOTION.longSettle)));
  const gradientId = `curve-${at}`;
  return (
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <path d={d} pathLength={1} fill="none" stroke={`url(#${gradientId})`} strokeWidth={width} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - drawn} />
    </svg>
  );
};

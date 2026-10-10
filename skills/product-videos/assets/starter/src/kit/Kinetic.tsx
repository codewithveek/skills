import React, { type ReactNode } from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ease, easeOut, lerp, pop, progress } from "../anim";
import { monoFamily } from "../theme";
import { useLook } from "./looks";
import { Sfx, type SfxName } from "./Sfx";

// Kinetic type and footage blocks learned from two launch videos made with Claude and Remotion
// (Box, a footage-led launch, and Taeillo, a type-poster ad; both Oct 2026). Like Motion.tsx, each
// takes the frame it starts on (`at`), reads the look, and plays its own sound unless `sound={false}`.

const KEYS: SfxName[] = ["key1", "key2", "key3", "key4"];

/* ------------------------------------------------------------ typing */

/**
 * Text that types itself out, one key sound per character (varied keys, varied level, so it sounds
 * like a keyboard and not one sample on repeat). The caret is a block while typing and blinks after.
 * Keep it to short lines: a headline, a URL, a search. Long typing is tiring to watch and to hear.
 */
export const Typewriter = ({ text, at = 0, cps = 16, size = 44, color, font, caps = false, caret = "block", weight = 700, tracking = 0.04, sound = true }: { text: string; at?: number; cps?: number; size?: number; color?: string; font?: string; caps?: boolean; caret?: "block" | "bar" | "none"; weight?: number; tracking?: number; sound?: boolean }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const look = useLook();
  const shown = Math.max(0, Math.min(text.length, Math.floor(((frame - at) / fps) * cps)));
  const done = shown >= text.length;
  const blink = done ? Math.floor((frame - at) / 15) % 2 === 0 : true;
  const ink = color ?? look.ink;
  return (
    <span style={{ fontFamily: font ?? look.font, fontSize: size, fontWeight: weight, letterSpacing: size * tracking, color: ink, textTransform: caps ? "uppercase" : undefined, whiteSpace: "pre", display: "inline-flex", alignItems: "center" }}>
      {sound &&
        Array.from(text).map((ch, i) =>
          ch === " " ? null : <Sfx key={i} name={KEYS[Math.floor(random(`k${i}${text}`) * 4)]} at={at + Math.round((i * fps) / cps)} volume={0.7 + random(`kv${i}`) * 0.6} />,
        )}
      {frame >= at && text.slice(0, shown)}
      {frame >= at && caret !== "none" && (
        <span style={{ display: "inline-block", width: caret === "block" ? size * 0.55 : Math.max(2, size * 0.06), height: size * 0.9, marginLeft: size * 0.06, background: ink, opacity: blink ? 1 : 0 }} />
      )}
    </span>
  );
};

/** A URL typed into a rounded pill, then clicked: the close of a launch ("boxspace.io"). */
export const UrlPill = ({ url, at = 0, cps = 12, size = 30, click, sound = true }: { url: string; at?: number; cps?: number; size?: number; click?: number; sound?: boolean }) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const appear = pop(frame, at, 220, 18);
  const pressed = click !== undefined && frame >= click && frame < click + 5;
  // A small arrow pointer glides in from the lower right and clicks the pill
  const arrive = click === undefined ? 0 : progress(frame, click - 18, click, ease);
  return (
    <div style={{ position: "relative", display: "inline-block", transform: `scale(${appear * (pressed ? 0.96 : 1)})` }}>
      <div style={{ background: look.accent, borderRadius: 999, padding: `${size * 0.35}px ${size * 0.9}px`, boxShadow: "0 10px 30px rgba(0,0,0,.18)" }}>
        <Typewriter text={url} at={at + 6} cps={cps} size={size} color={look.onAccent} font={monoFamily} weight={500} tracking={0.02} caret="bar" sound={sound} />
      </div>
      {click !== undefined && (
        <>
          {sound && <Sfx name="click" at={click} />}
          <svg width={size * 0.9} height={size * 0.9} viewBox="0 0 24 24" style={{ position: "absolute", right: -size * 0.2 + (1 - arrive) * -size * 3, bottom: -size * 0.6 + (1 - arrive) * -size * 2, opacity: progress(frame, click - 20, click - 12) }}>
            <path d="M4 2l16 9-7 2-3 7z" fill="#111" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </>
      )}
    </div>
  );
};

/* ------------------------------------------------------------ captions over footage */

/**
 * A two-tier caption: a small lead ("The salon that") over a big line that blurs from one phrase to
 * the next ("takes appointments" → "sells haircare products"), with an accent bar under it. Each
 * phrase holds `every` frames. On footage, no sound: the music carries it.
 */
export const PhraseSwap = ({ lead, phrases, at = 0, every = 30, size = 84, color, bar = true }: { lead?: string; phrases: string[]; at?: number; every?: number; size?: number; color?: string; bar?: boolean }) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const t = Math.max(0, frame - at);
  const k = Math.min(phrases.length - 1, Math.floor(t / every));
  const local = t - k * every;
  const inT = progress(local, 0, 9, easeOut);
  const outT = k < phrases.length - 1 ? progress(local, every - 7, every, ease) : 0;
  const blur = (1 - inT) * 14 + outT * 14;
  const ink = color ?? look.ink;
  return (
    <div style={{ textAlign: "center", fontFamily: look.font, color: ink, opacity: progress(frame, at, at + 6) }}>
      {lead && <div style={{ fontSize: size * 0.34, fontWeight: 600, letterSpacing: -0.3, marginBottom: size * 0.08, textShadow: "0 2px 18px rgba(0,0,0,.45)" }}>{lead}</div>}
      <span style={{ position: "relative", display: "inline-block", fontSize: size, fontWeight: 800, letterSpacing: size * look.tracking, lineHeight: 1.05, filter: `blur(${blur}px)`, opacity: inT * (1 - outT * 0.7), transform: `translateY(${(1 - inT) * 14 - outT * 10}px) scale(${0.96 + 0.04 * inT})`, textShadow: "0 4px 30px rgba(0,0,0,.4)" }}>
        {bar && <span style={{ position: "absolute", left: "-2%", right: "-2%", bottom: size * 0.02, height: size * 0.16, background: look.accent, zIndex: -1, transformOrigin: "left", transform: `scaleX(${progress(local, 2, 14, easeOut)})` }} />}
        {phrases[k]}
      </span>
    </div>
  );
};

/* ------------------------------------------------------------ type effects */

/** Characters that scramble through random glyphs and resolve left to right into the text. */
export const Scramble = ({ text, at = 0, dur = 16, size = 120, color, font, weight, glyphs = "ABCDEFGHJKLMNPQRSTUVWXYZ#%&*?!" }: { text: string; at?: number; dur?: number; size?: number; color?: string; font?: string; weight?: number; glyphs?: string }) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const chars = Array.from(text);
  return (
    <span style={{ fontFamily: font ?? look.font, fontSize: size, fontWeight: weight ?? look.weight, letterSpacing: size * look.tracking, color: color ?? look.ink, whiteSpace: "pre", opacity: frame >= at ? 1 : 0 }}>
      {chars.map((ch, i) => {
        const settle = at + (i / Math.max(1, chars.length - 1)) * dur;
        if (frame >= settle || ch === " ") return ch;
        return glyphs[Math.floor(random(`sc${i}-${Math.floor(frame / 2)}`) * glyphs.length)];
      })}
    </span>
  );
};

/**
 * One word, hit hard: it slams in big (with an optional colour-split glitch), holds, and can then
 * settle into a smaller size and place, the way "But" lands huge and then becomes the first word of
 * its sentence. `settle` is { at, scale, x, y } in pixels from the centre.
 */
export const Punch = ({ text, at = 0, size = 260, color, glitch = false, settle, sound = true }: { text: string; at?: number; size?: number; color?: string; glitch?: boolean; settle?: { at: number; scale: number; x: number; y: number }; sound?: boolean }) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const s = pop(frame, at, 300, 20);
  const g = settle ? progress(frame, settle.at, settle.at + 12, ease) : 0;
  const scale = lerp(1.35, 1, s) * lerp(1, settle?.scale ?? 1, g);
  const shake = glitch && frame >= at && frame < at + 8 ? (random(`gl${frame}`) - 0.5) * size * 0.06 : 0;
  const ink = color ?? look.ink;
  const word = (c: string, dx: number, op: number) => (
    <span style={{ position: "absolute", left: 0, top: 0, color: c, transform: `translateX(${dx}px)`, opacity: op, mixBlendMode: "multiply" }}>{text}</span>
  );
  return (
    <div style={{ position: "relative", display: "inline-block", fontFamily: look.font, fontSize: size, fontWeight: 900, letterSpacing: size * look.tracking, lineHeight: 1, opacity: frame >= at ? 1 : 0, transform: `translate(${(settle?.x ?? 0) * g + shake}px, ${(settle?.y ?? 0) * g}px) scale(${scale})`, filter: `blur(${(1 - s) * 6}px)` }}>
      {sound && <Sfx name="thump" at={at} volume={0.7} />}
      <span style={{ color: ink, position: "relative" }}>{text}</span>
      {glitch && frame < at + 10 && word("#00e5ff", -size * 0.04, 0.8)}
      {glitch && frame < at + 10 && word("#ff2bd6", size * 0.04, 0.8)}
    </div>
  );
};

/**
 * A product name set huge behind its cut-out photo, letters dropping into place one by one with a
 * little tumble; a small italic serif caption names it in the corner. `children` is the product
 * image (an <Img> of a cut-out PNG), drawn in front of the letters.
 */
export const PosterName = ({ name, at = 0, size = 380, color, background, caption, children, sound = true }: { name: string; at?: number; size?: number; color?: string; background?: string; caption?: string; children?: ReactNode; sound?: boolean }) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const letters = Array.from(name);
  return (
    <AbsoluteFill style={{ background: background ?? look.accent, overflow: "hidden" }}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 150 }}>
        <div style={{ fontFamily: look.font, fontSize: size, lineHeight: 0.9, letterSpacing: size * look.tracking, color: color ?? look.onAccent, whiteSpace: "nowrap" }}>
          {letters.map((ch, i) => {
            const t = pop(frame, at + i * 2, 260, 15);
            const rot = (random(`pn${name}${i}`) - 0.5) * 50;
            return (
              <span key={i} style={{ display: "inline-block", transform: `translateY(${(1 - t) * -size * 1.2}px) rotate(${(1 - t) * rot}deg)`, opacity: frame >= at + i * 2 ? 1 : 0 }}>
                {ch === " " ? " " : ch}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>
      {sound && <Sfx name="pop" at={at + letters.length * 2} />}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 30 }}>
        <div style={{ transform: `translateY(${(1 - pop(frame, at + 6, 160, 16)) * 80}px)`, opacity: progress(frame, at + 6, at + 14) }}>{children}</div>
      </AbsoluteFill>
      {caption && <div style={{ position: "absolute", right: 60, bottom: 40, fontFamily: look.serif ?? look.font, fontStyle: "italic", fontSize: 30, color: color ?? look.onAccent, opacity: progress(frame, at + 10, at + 20) }}>{caption}</div>}
    </AbsoluteFill>
  );
};

/** A numbered step label beside a product screen: "01 — ONBOARDING" over a two-line title. */
export const StepLabel = ({ n, kicker, title, at = 0, size = 44, color }: { n: number; kicker: string; title: string; at?: number; size?: number; color?: string }) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const t = progress(frame, at, at + 14);
  return (
    <div style={{ fontFamily: look.font, color: color ?? look.ink, opacity: t, transform: `translateY(${(1 - t) * 16}px)` }}>
      <div style={{ fontFamily: monoFamily, fontSize: size * 0.3, letterSpacing: 2, color: look.muted, textTransform: "uppercase" }}>
        {String(n).padStart(2, "0")} — {kicker}
      </div>
      <div style={{ fontSize: size, fontWeight: 700, letterSpacing: size * look.tracking, lineHeight: 1.08, marginTop: size * 0.25, whiteSpace: "pre-line" }}>{title}</div>
    </div>
  );
};

/* ------------------------------------------------------------ footage */

/**
 * Background footage (B-roll): a clip or a still photo from public/footage/, covering the frame, slowly
 * pushing in (from `from` to `zoom`, towards `origin`, drifting by `pan` pixels), darkened at the bottom
 * for legible type. A still gets the same move, so a photo reads as a shot, not a slide. With no `src`
 * it draws a labelled placeholder, so the storyboard can be built and timed before footage is chosen or
 * generated. Footage stays muted; the music and effects are the soundtrack.
 * `origin` also crops: zoom in towards a corner to keep a logo or a face out of frame.
 */
export const Footage = ({ src, label, startFrom = 0, from = 1, zoom = 1.08, origin = "50% 50%", pan = [0, 0], darken = 0.45, children }: { src?: string; label?: string; startFrom?: number; from?: number; zoom?: number; origin?: string; pan?: [number, number]; darken?: number; children?: ReactNode }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames], [0, 1], { extrapolateRight: "clamp" });
  const s = lerp(from, zoom, t);
  const still = src !== undefined && /\.(jpe?g|png|webp|avif)$/i.test(src);
  const fill = { width: "100%", height: "100%", objectFit: "cover" as const, objectPosition: origin };
  return (
    <AbsoluteFill style={{ background: "#111", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${pan[0] * t}px, ${pan[1] * t}px) scale(${s})`, transformOrigin: origin }}>
        {src ? (
          still ? <Img src={staticFile(src)} style={fill} /> : <OffthreadVideo src={staticFile(src)} startFrom={startFrom} muted style={fill} />
        ) : (
          <AbsoluteFill style={{ background: "repeating-linear-gradient(135deg, #2a2a33 0 40px, #24242c 40px 80px)", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: monoFamily, fontSize: 26, color: "#8a8a96", border: "2px dashed #55555f", padding: "14px 22px", borderRadius: 10 }}>footage: {label ?? "add a clip"}</div>
          </AbsoluteFill>
        )}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(0,0,0,${darken * 0.5}) 0%, rgba(0,0,0,${darken * 0.2}) 40%, rgba(0,0,0,${darken}) 100%)` }} />
      {children}
    </AbsoluteFill>
  );
};

export type Shot = { src?: string; label?: string; from?: number; zoom?: number; origin?: string; pan?: [number, number]; darken?: number; startFrom?: number };

/**
 * Several shots cut on the beat under one caption: the first holds until `at`, then each holds `every`
 * frames (a bar or a beat of the music). Pair it with a PhraseSwap at the same `at` and `every`, so
 * each phrase lands on its own picture. Children are drawn once, over every shot.
 */
export const Montage = ({ shots, every, at = 0, children }: { shots: Shot[]; every: number; at?: number; children?: ReactNode }) => (
  <AbsoluteFill>
    {shots.map((shot, i) => {
      const start = i === 0 ? 0 : at + i * every;
      const end = i === shots.length - 1 ? undefined : at + (i + 1) * every;
      return (
        <Sequence key={i} from={start} durationInFrames={end === undefined ? undefined : end - start}>
          <Footage {...shot} />
        </Sequence>
      );
    })}
    {children}
  </AbsoluteFill>
);

/**
 * The room is dark, then a light switches on: everything inside starts at low brightness, flickers
 * once and comes up at `at`, with the switch click. Wrap a Footage (or any scene) in it.
 */
export const LightSwitch = ({ at, children, sound = true }: { at: number; children: ReactNode; sound?: boolean }) => {
  const frame = useCurrentFrame();
  const d = frame - at;
  const level = d < 0 ? 0.12 : d < 2 ? 1 : d < 4 ? 0.35 : interpolate(d, [4, 10], [0.85, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ filter: `brightness(${level})` }}>
      {sound && <Sfx name="switch" at={at} />}
      {children}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ cards and the box */

export type DeckCard = { label: string; color: string; icon?: ReactNode };
type Mode = "rows" | "fan" | "stack" | "gather";

const place = (mode: Mode, i: number, n: number, w: number) => {
  const half = Math.ceil(n / 2);
  switch (mode) {
    case "rows": {
      // two rows across the frame, top row tilted one way, bottom the other
      const top = i < half;
      const k = top ? i : i - half;
      const count = top ? half : n - half;
      return { x: (k - (count - 1) / 2) * (w * 0.2), y: top ? -300 : 300, r: (top ? -6 : 6) + (k % 2 ? 3 : -3), s: 1, o: 1 };
    }
    case "fan":
      return { x: (i - (n - 1) / 2) * 34, y: Math.abs(i - (n - 1) / 2) * 8, r: (i - (n - 1) / 2) * 7, s: 1, o: 1 };
    case "stack":
      return { x: (random(`st${i}`) - 0.5) * 30, y: (random(`sy${i}`) - 0.5) * 20, r: (random(`sr${i}`) - 0.5) * 12, s: 1, o: 1 };
    case "gather":
      return { x: 0, y: 260, r: 0, s: 0.25, o: 0 };
  }
};

/**
 * A deck of product cards that moves between arrangements at keyframes: shooting in as two tilted
 * rows ("rows"), fanning out ("fan"), stacking ("stack"), and dropping out of sight into a box below
 * ("gather"). A "shuffle" is two quick swaps between fan and stack. Cards are real product areas.
 */
export const CardDeck = ({ cards, keys, cardW = 230, sound = true }: { cards: DeckCard[]; keys: { f: number; mode: Mode }[]; cardW?: number; sound?: boolean }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const look = useLook();
  const n = cards.length;
  const enter = keys[0].f;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      {sound && <Sfx name="whoosh" at={enter - 2} volume={1.4} />}
      {sound && keys.slice(1).map((k) => <Sfx key={k.f} name={k.mode === "gather" ? "swish" : "land"} at={k.f + (k.mode === "gather" ? 0 : 8)} volume={0.6} />)}
      {cards.map((c, i) => {
        // which keyframe leg are we in?
        let a = keys[0], b = keys[0];
        for (let j = 0; j < keys.length; j++) if (frame >= keys[j].f) { a = keys[j]; b = keys[j + 1] ?? keys[j]; }
        const t = b === a ? 1 : progress(frame, b.f - 14 + (i % 3) * 2, b.f + (i % 3) * 2, ease);
        const pa = place(a.mode, i, n, width), pb = place(b.mode, i, n, width);
        let p = { x: lerp(pa.x, pb.x, t), y: lerp(pa.y, pb.y, t), r: lerp(pa.r, pb.r, t), s: lerp(pa.s, pb.s, t), o: lerp(pa.o, pb.o, t) };
        // shooting in: from beyond the top or bottom edge, staggered
        const inT = pop(frame, enter + i * 2, 160, 18);
        if (frame < enter + 30) p = { ...p, y: lerp(p.y + (p.y < 0 ? -900 : 900), p.y, inT), r: p.r + (1 - inT) * 25 };
        return (
          <div key={c.label} style={{ position: "absolute", width: cardW, height: cardW * 1.3, borderRadius: cardW * 0.09, background: c.color, boxShadow: "0 20px 50px rgba(0,0,0,.35)", transform: `translate(${p.x}px, ${p.y}px) rotate(${p.r}deg) scale(${p.s})`, opacity: p.o * (frame >= enter + i * 2 ? 1 : 0), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "#fff", fontFamily: look.font, fontWeight: 700, fontSize: cardW * 0.1, textAlign: "center", padding: 14, zIndex: i }}>
            {c.icon}
            {c.label}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/**
 * A 3D box (CSS cube) with its lid open, which shuts at `closeAt` with a soft thud: things go in,
 * the lid closes, the product is introduced. `label` is printed on the front face.
 */
export const Crate = ({ at = 0, closeAt, size = 220, color, label, sound = true }: { at?: number; closeAt: number; size?: number; color?: string; label?: ReactNode; sound?: boolean }) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const c = color ?? look.accent;
  const lid = interpolate(progress(frame, closeAt - 8, closeAt, Easing2), [0, 1], [-115, 0]);
  const settle = frame >= closeAt ? Math.sin((frame - closeAt) * 0.9) * Math.exp(-(frame - closeAt) * 0.25) * 4 : 0;
  const half = size / 2;
  const face = (transform: string, shade: number, content?: ReactNode) => (
    <div style={{ position: "absolute", width: size, height: size, left: -half, top: -half, background: c, filter: `brightness(${shade})`, transform, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,.15)", color: "#fff", fontFamily: look.font, fontWeight: 800, fontSize: size * 0.16 }}>{content}</div>
  );
  return (
    <div style={{ perspective: 1600, transform: `scale(${pop(frame, at, 180, 16)}) translateY(${settle}px)` }}>
      {sound && <Sfx name="thump" at={closeAt} volume={0.55} />}
      <div style={{ position: "relative", width: 0, height: 0, transformStyle: "preserve-3d", transform: `rotateX(-22deg) rotateY(${-38 + Math.sin(frame / 40) * 4}deg)` }}>
        {face(`translateZ(${half}px)`, 1, label)}
        {face(`rotateY(180deg) translateZ(${half}px)`, 0.7)}
        {face(`rotateY(90deg) translateZ(${half}px)`, 0.82)}
        {face(`rotateY(-90deg) translateZ(${half}px)`, 0.82)}
        {face(`rotateX(-90deg) translateZ(${half}px)`, 0.6)}
        {/* the lid: hinged on the back top edge */}
        <div style={{ position: "absolute", width: size, height: size, left: -half, top: -half, transformStyle: "preserve-3d", transform: `translateZ(${-half}px) rotateX(${lid}deg)`, transformOrigin: "50% 0%" }}>
          <div style={{ position: "absolute", inset: 0, background: c, filter: "brightness(1.15)", transform: "rotateX(90deg)", transformOrigin: "50% 0%", border: "1px solid rgba(255,255,255,.2)" }} />
        </div>
      </div>
    </div>
  );
};

const Easing2 = (x: number) => x * x; // the lid accelerates as it falls

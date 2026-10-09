import React, { type ReactNode } from "react";
import { random, useCurrentFrame } from "remotion";
import { ease, easeOut, lerp, pop, progress } from "../anim";
import { useLook } from "./looks";
import { Sfx } from "./Sfx";

// Motion building blocks for the editorial, graphic and cinematic looks. Each reads the video's
// look for colours and font, takes the frame it starts on (`at`), and animates only what is given:
// pass real values (the product's real limit, price, count) and let the motion do the selling.

/* ------------------------------------------------------------------ numbers */

/**
 * A number that rolls to its value like an odometer: each digit column slides, carrying into the
 * next one the way a mechanical counter does, with a little motion blur while it moves.
 * `from` → `value` over `dur` frames from `at`; it decelerates into the final value.
 */
export const Odometer = ({ value, from = 0, at = 0, dur = 36, size = 160, color, prefix = "", suffix = "", group = true, weight, sound = true }: { value: number; from?: number; at?: number; dur?: number; size?: number; color?: string; prefix?: string; suffix?: string; group?: boolean; weight?: number; sound?: boolean }) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const at_ = (f: number) => lerp(from, value, progress(f, at, at + dur, easeOut));
  const n = at_(frame);
  const prev = at_(frame - 1);
  const digits = Math.max(String(Math.floor(Math.abs(value))).length, String(Math.floor(Math.abs(from))).length);
  const h = size * 1.04;
  const cols: ReactNode[] = [];
  for (let k = digits - 1; k >= 0; k--) {
    const place = 10 ** k;
    const whole = Math.floor(n);
    const base = Math.floor(n / place) % 10;
    const lower = whole % place;
    const roll = lower === place - 1 ? n - whole : 0;
    const pos = base + roll;
    const speed = Math.abs(n - prev) / place;
    const shown = k === 0 || n >= place - 0.001;
    const blur = Math.min(size * 0.04, speed * size * 0.06);
    cols.push(
      <span key={k} style={{ display: "inline-block", height: h, overflow: "hidden", width: shown ? "0.62em" : 0, transition: "none", verticalAlign: "top" }}>
        <span style={{ display: "block", transform: `translateY(${-pos * h}px)`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, i) => (
            <span key={i} style={{ display: "block", height: h, lineHeight: `${h}px`, textAlign: "center" }}>{d}</span>
          ))}
        </span>
      </span>,
    );
    if (group && k > 0 && k % 3 === 0 && shown) cols.push(<span key={`s${k}`} style={{ display: "inline-block", height: h, lineHeight: `${h}px`, verticalAlign: "top" }}>,</span>);
  }
  // A tick each time the shown value changes, if it changes few enough times to hear as steps
  const steps: number[] = [];
  for (let f = at; f <= at + dur; f++) if (Math.floor(at_(f)) !== Math.floor(at_(f - 1))) steps.push(f);
  const ticks = steps.length <= 15 ? steps : steps.slice(-1);
  return (
    <>
      {sound && ticks.map((f) => <Sfx key={f} name="tick" at={f} />)}
      <div style={{ fontFamily: look.font, fontSize: size, fontWeight: weight ?? look.weight, letterSpacing: size * look.tracking, color: color ?? look.ink, fontVariantNumeric: "tabular-nums", lineHeight: 1, whiteSpace: "nowrap", display: "inline-flex", alignItems: "flex-start" }}>
        {prefix && <span style={{ height: h, lineHeight: `${h}px`, whiteSpace: "pre" }}>{prefix}</span>}
        {cols}
        {suffix && <span style={{ height: h, lineHeight: `${h}px`, whiteSpace: "pre" }}>{suffix}</span>}
      </div>
    </>
  );
};

/* -------------------------------------------------------------------- words */

/**
 * A line of words that rise out of a mask one by one. Wrap words in *asterisks* to colour them
 * with the accent (`tone="accent"`) or the alarm colour (`tone="alarm"`): "100 invites a week. *That's it.*"
 */
export const AccentLine = ({ text, at = 0, size = 44, tone = "accent", color, accentColor, align = "center", gap = 3, weight }: { text: string; at?: number; size?: number; tone?: "accent" | "alarm"; color?: string; accentColor?: string; align?: "left" | "center"; gap?: number; weight?: number }) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const words: { w: string; hi: boolean }[] = [];
  let hi = false;
  for (const raw of text.split(" ")) {
    const starts = raw.startsWith("*");
    const ends = raw.endsWith("*");
    if (starts) hi = true;
    words.push({ w: raw.replace(/\*/g, ""), hi });
    if (ends) hi = false;
  }
  return (
    <div style={{ fontFamily: look.font, fontSize: size, fontWeight: weight ?? look.weight, letterSpacing: size * look.tracking, lineHeight: 1.15, color: color ?? look.ink, textAlign: align }}>
      {words.map(({ w, hi: h }, i) => {
        const t = progress(frame, at + i * gap, at + i * gap + 14);
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", paddingBottom: size * 0.12, marginBottom: -size * 0.12, marginRight: size * 0.24 }}>
            <span style={{ display: "inline-block", transform: `translateY(${(1 - t) * 110}%)`, color: h ? (accentColor ?? (tone === "alarm" ? look.alarm : look.accent)) : undefined }}>{w}</span>
          </span>
        );
      })}
    </div>
  );
};

/** A small uppercase label over a hairline rule that draws in from the centre; the rule can turn a colour (a limit reached). */
export const RuleLabel = ({ label, at = 0, width = 900, hot, note, sound = true }: { label: string; at?: number; width?: number; hot?: number; note?: string; sound?: boolean }) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const draw = progress(frame, at, at + 24);
  const isHot = hot !== undefined && frame >= hot;
  return (
    <>
      {sound && hot !== undefined && <Sfx name="alert" at={hot} />}
      <div style={{ width, fontFamily: look.font, textAlign: "center", position: "relative" }}>
        <div style={{ fontSize: 15, letterSpacing: 2.4, fontWeight: 600, textTransform: "uppercase", color: look.muted, opacity: progress(frame, at, at + 12) }}>{label}</div>
        <div style={{ height: 2, marginTop: 14, background: isHot ? look.alarm : look.ink, opacity: isHot ? 1 : 0.55, transform: `scaleX(${draw})` }} />
        {note && <div style={{ position: "absolute", right: -110, top: 30, fontSize: 14, color: isHot ? look.alarm : look.muted, opacity: progress(frame, at + 20, at + 32) }}>{note}</div>}
      </div>
    </>
  );
};

/** Relative luminance of a #rrggbb colour, 0 (black) to 1 (white). */
export const luminance = (hex: string) => {
  const n = parseInt(hex.replace("#", "").slice(0, 6), 16);
  const lin = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
};

/** A dark pill caption at the bottom-left, the way a product moment is labelled in the editorial look. */
export const Caption = ({ text, at = 0, size = 30 }: { text: string; at?: number; size?: number }) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const t = progress(frame, at, at + 16);
  // A dark brand colour (black, navy) disappears on the dark pill: then the accent word is white
  // and the rest of the line steps back to grey
  const dark = luminance(look.accent) < 0.25;
  return (
    <div style={{ position: "absolute", left: 70, bottom: 70, background: "#17171a", borderRadius: 12, padding: "12px 22px", opacity: t, transform: `translateY(${(1 - t) * 16}px)`, boxShadow: "0 12px 30px rgba(0,0,0,0.25)" }}>
      <AccentLine text={text} at={at + 4} size={size} color={dark ? "#a1a1aa" : "#fff"} accentColor={dark ? "#fff" : undefined} align="left" weight={600} />
    </div>
  );
};

/* -------------------------------------------------------------- cards in 3D */

/**
 * A UI panel that swings in from a tilted, blurred 3D angle and settles flat, like a screen being
 * set down in front of the viewer. Use it to bring in a rebuilt app screen without a window chrome.
 */
export const Tilt = ({ at = 0, dur = 34, from = { rx: 22, ry: -26, rz: 6, s: 0.82 }, fill = false, sound = false, children }: { at?: number; dur?: number; from?: { rx: number; ry: number; rz: number; s: number }; fill?: boolean; sound?: boolean; children: ReactNode }) => {
  const frame = useCurrentFrame();
  const t = progress(frame, at, at + dur, easeOut);
  // `fill` makes it cover the frame, for wrapping an AppWindow (which positions itself in the frame)
  const box = fill ? ({ position: "absolute", inset: 0 } as const) : {};
  return (
    <>
      {sound && <Sfx name="air" at={at} />}
      <div style={{ perspective: 1800, ...box }}>
        <div style={{ ...box, transform: `rotateX(${(1 - t) * from.rx}deg) rotateY(${(1 - t) * from.ry}deg) rotateZ(${(1 - t) * from.rz}deg) scale(${lerp(from.s, 1, t)})`, filter: `blur(${(1 - t) * 10}px)`, opacity: progress(frame, at, at + 10), transformStyle: "preserve-3d" }}>{children}</div>
      </div>
    </>
  );
};

/** Flips a card over at `at`: `front` turns away, `back` turns in (an account down → its replacement). */
export const Flip = ({ at, dur = 18, front, back, sound = true }: { at: number; dur?: number; front: ReactNode; back: ReactNode; sound?: boolean }) => {
  const frame = useCurrentFrame();
  const a = progress(frame, at, at + dur, ease) * 180;
  const face = { position: "absolute", inset: 0, backfaceVisibility: "hidden" } as const;
  return (
    <>
      {sound && <Sfx name="swish" at={at - 2} />}
      {sound && <Sfx name="land" at={at + dur - 2} volume={0.6} />}
      <div style={{ perspective: 1400, position: "relative" }}>
        <div style={{ transform: `rotateY(${a}deg)`, transformStyle: "preserve-3d", position: "relative" }}>
          <div style={{ backfaceVisibility: "hidden", visibility: a < 90 ? "visible" : "hidden" }}>{front}</div>
          <div style={{ ...face, transform: "rotateY(180deg)", visibility: a >= 90 ? "visible" : "hidden" }}>{back}</div>
        </div>
      </div>
    </>
  );
};

/** A rubber-stamp entrance: big and rotated, then slammed down. For a status that lands hard (Restricted, Approved, Paid). */
export const Stamp = ({ at, children, rotate = -7, sound = true }: { at: number; children: ReactNode; rotate?: number; sound?: boolean }) => {
  const frame = useCurrentFrame();
  const s = pop(frame, at, 320, 22);
  return (
    <>
      {sound && <Sfx name="stamp" at={at + 2} />}
        <div style={{ display: "inline-block", opacity: frame >= at ? 1 : 0, transform: `scale(${lerp(2.2, 1, s)}) rotate(${rotate}deg)` }}>{children}</div>
    </>
  );
};

/** Style for a card dealt onto the table: flies in from the top right with a spin and settles at a slight angle. */
export const dealt = (frame: number, at: number, rest = 0) => {
  const s = pop(frame, at, 120, 16);
  return { transform: `translate(${(1 - s) * 520}px, ${(1 - s) * -420}px) rotate(${lerp(28, rest, s)}deg)`, opacity: progress(frame, at, at + 6) } as const;
};

/** A card dealt onto the table (the `dealt` style) with its sound: a swish as it flies, a knock as it lands. */
export const Dealt = ({ at, rest = 0, sound = true, children }: { at: number; rest?: number; sound?: boolean; children: ReactNode }) => {
  const frame = useCurrentFrame();
  return (
    <div style={dealt(frame, at, rest)}>
      {sound && <Sfx name="swish" at={at - 3} volume={0.7} />}
      {sound && <Sfx name="land" at={at + 9} />}
      {children}
    </div>
  );
};

/** A white person card (avatar initials, name, role, and a footer), the floating-card unit of the editorial look. */
export const PersonCard = ({ name, role, footer, right, width = 300, children }: { name: string; role?: string; footer?: ReactNode; right?: ReactNode; width?: number; children?: ReactNode }) => {
  const look = useLook();
  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2);
  const hue = Math.floor(random(name) * 360);
  return (
    <div style={{ width, background: look.card, borderRadius: 14, boxShadow: look.cardShadow, padding: 20, fontFamily: look.font, color: look.ink }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 99, background: `hsl(${hue} 45% 82%)`, color: `hsl(${hue} 40% 30%)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15 }}>{initials}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: -0.3 }}>{name}</div>
          {role && <div style={{ fontSize: 13, color: look.muted }}>{role}</div>}
        </div>
        {right}
      </div>
      {children}
      {footer && <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${look.line}55`, display: "flex", justifyContent: "space-between", fontSize: 13, color: look.muted }}>{footer}</div>}
    </div>
  );
};

/* ------------------------------------------------------------- grids & bars */

/**
 * A grid of cells filling one after another (weeks used up, a warm-up calendar, capacity). `shade`
 * returns 0–1 per filled cell for a heatmap; `count` is how many fill in total (defaults to all).
 */
export const CellGrid = ({ rows, cols, at = 0, dur = 60, cell = 34, gap = 8, count, shade, color, labels }: { rows: number; cols: number; at?: number; dur?: number; cell?: number; gap?: number; count?: number; shade?: (i: number) => number; color?: string; labels?: { rows?: string[]; cols?: string[] } }) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const total = count ?? rows * cols;
  const filled = progress(frame, at, at + dur, (x) => x) * total;
  const fill = color ?? look.accent;
  return (
    <div style={{ fontFamily: look.font, display: "inline-grid", gridTemplateColumns: `${labels?.rows ? "70px " : ""}repeat(${cols}, ${cell}px)`, gap, alignItems: "center" }}>
      {labels?.cols && (
        <>
          {labels.rows && <div />}
          {labels.cols.map((l, i) => <div key={i} style={{ fontSize: 12, color: look.muted, textAlign: "center" }}>{l}</div>)}
        </>
      )}
      {Array.from({ length: rows }).flatMap((_, r) => [
        ...(labels?.rows ? [<div key={`l${r}`} style={{ fontSize: 12, color: look.muted, letterSpacing: 1.2, textTransform: "uppercase", opacity: filled > r * cols ? 1 : 0.35 }}>{labels.rows[r]}</div>] : []),
        ...Array.from({ length: cols }).map((__, ci) => {
          const i = r * cols + ci;
          const on = Math.min(1, Math.max(0, filled - i));
          const strength = shade ? shade(i) : 1;
          return <div key={i} style={{ width: cell, height: cell, borderRadius: cell * 0.18, background: on > 0 ? fill : `${look.line}88`, opacity: on > 0 ? 0.25 + 0.75 * strength * on : 1, transform: `scale(${on > 0 ? 0.8 + 0.2 * on : 1})` }} />;
        }),
      ])}
    </div>
  );
};

/** A labelled horizontal bar that grows to `value` of `max`, its number counting with it. Turns the alarm colour when `hot`. */
export const Meter = ({ label, value, max, at = 0, dur = 30, width = 520, hot = false, lead }: { label: string; value: number; max: number; at?: number; dur?: number; width?: number; hot?: boolean; lead?: ReactNode }) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const t = progress(frame, at, at + dur, easeOut);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: look.font, fontSize: 18, color: look.ink }}>
      {lead}
      <div style={{ width: 170 }}>{label}</div>
      <div style={{ width, height: 4, background: `${look.line}88`, borderRadius: 4 }}>
        <div style={{ width: `${(value / max) * 100 * t}%`, height: "100%", borderRadius: 4, background: hot ? look.alarm : look.accent }} />
      </div>
      <div style={{ width: 48, textAlign: "right", fontVariantNumeric: "tabular-nums", color: look.muted }}>{Math.round(value * t)}</div>
    </div>
  );
};

/* ------------------------------------------------------- lists and orbits */

/**
 * A vertical slot of words stepping through a list, the current one bold in the middle, its
 * neighbours fading above and below (formats, use cases, integrations). Steps every `every` frames.
 */
export const WordSlot = ({ items, at = 0, every = 14, size = 54, visible = 2, icon, sound = true }: { items: string[]; at?: number; every?: number; size?: number; visible?: number; icon?: (i: number) => ReactNode; sound?: boolean }) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const raw = Math.max(0, (frame - at) / every);
  const step = Math.floor(raw);
  const pos = step + progress(raw - step, 0.15, 0.65, ease) ;
  const cur = Math.min(items.length - 1, Math.round(pos));
  const lh = size * 1.12;
  return (
    <>
      {sound && items.slice(1).map((_, i) => <Sfx key={i} name="tick" at={Math.round(at + (i + 0.4) * every)} />)}
      <div style={{ display: "flex", alignItems: "center", gap: size * 0.5, fontFamily: look.font }}>
        {icon && <div style={{ width: size * 1.5, height: size * 1.5, display: "flex", alignItems: "center", justifyContent: "center", color: look.ink }}>{icon(cur)}</div>}
        <div style={{ position: "relative", height: lh * (visible * 2 + 1), width: size * 7, overflow: "hidden" }}>
          {items.map((w, i) => {
            const d = i - Math.min(pos, items.length - 1);
            const o = Math.max(0, 1 - Math.abs(d) / (visible + 0.5));
            return (
              <div key={i} style={{ position: "absolute", top: lh * (visible + d), height: lh, lineHeight: `${lh}px`, fontSize: size, fontWeight: look.weight, letterSpacing: size * look.tracking, color: look.ink, opacity: Math.abs(d) < 0.5 ? 1 : o * 0.35 }}>{w}</div>
            );
          })}
        </div>
      </div>
    </>
  );
};

/** Items placed around faint concentric rings, popping in one by one and drifting slowly round (integrations, sources, partners). */
export const Orbit = ({ items, at = 0, rx = 620, ry = 330, spin = 0.06, rings = 3, sound = true }: { items: ReactNode[]; at?: number; rx?: number; ry?: number; spin?: number; rings?: number; sound?: boolean }) => {
  const frame = useCurrentFrame();
  const look = useLook();
  return (
    <>
      {sound && <Sfx name="swish" at={at + 2} volume={0.8} />}
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0 }}>
        {Array.from({ length: rings }).map((_, i) => {
          const f = (i + 1) / rings;
          return <div key={i} style={{ position: "absolute", left: -rx * f, top: -ry * f, width: rx * 2 * f, height: ry * 2 * f, borderRadius: "50%", border: `1px solid ${look.line}`, opacity: progress(frame, at, at + 20) * 0.8 }} />;
        })}
        {items.map((node, i) => {
          const a = (i / items.length) * Math.PI * 2 + random(`orbit${i}`) * 0.5 + (frame - at) * spin * 0.01;
          const ring = 0.7 + random(`ring${i}`) * 0.3;
          const s = pop(frame, at + 4 + i * 3, 200, 16);
          return <div key={i} style={{ position: "absolute", left: Math.cos(a) * rx * ring, top: Math.sin(a) * ry * ring, transform: `translate(-50%, -50%) scale(${s})`, opacity: Math.min(1, s * 1.5) }}>{node}</div>;
        })}
      </div>
    </>
  );
};

/**
 * Tiles burst out of the centre in a spiral and scatter across the frame, then drift (logos,
 * file types, sources: "data from anywhere"). Positions are seeded, so every render is identical.
 */
export const Swirl = ({ tiles, at = 0, dur = 30, spread = 0.9, width = 1920, height = 1080, sound = true }: { tiles: ReactNode[]; at?: number; dur?: number; spread?: number; width?: number; height?: number; sound?: boolean }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {sound && <Sfx name="swish" at={at} />}
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0 }}>
        {tiles.map((node, i) => {
          const tx = (random(`sx${i}`) - 0.5) * width * spread;
          const ty = (random(`sy${i}`) - 0.5) * height * spread;
          const endA = Math.atan2(ty, tx);
          const endR = Math.hypot(tx, ty);
          const t = progress(frame, at + i * 0.6, at + i * 0.6 + dur, easeOut);
          const a = endA - (1 - t) * 2.6; // unwinds a spiral as it travels out
          const r = endR * t;
          const drift = Math.max(0, frame - at - dur) * (random(`d${i}`) - 0.5) * 0.6;
          const rot = (random(`r${i}`) - 0.5) * 70 + (1 - t) * 180;
          return <div key={i} style={{ position: "absolute", left: Math.cos(a) * r + drift, top: Math.sin(a) * r - drift * 0.5, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${0.4 + 0.6 * t})`, opacity: progress(frame, at + i * 0.6, at + i * 0.6 + 6) }}>{node}</div>;
        })}
      </div>
    </>
  );
};

/** A square tile for Swirl: a coloured or outlined square with an icon in it. */
export const Tile = ({ size = 70, fill, children }: { size?: number; fill?: string; children?: ReactNode }) => {
  const look = useLook();
  return <div style={{ width: size, height: size, borderRadius: size * 0.08, background: fill ?? look.card, boxShadow: fill ? undefined : look.cardShadow, display: "flex", alignItems: "center", justifyContent: "center", color: fill ? look.onAccent : look.ink }}>{children}</div>;
};

/** A chip with an icon and a name, the unit for Orbit. */
export const Chip = ({ icon, label, size = 22 }: { icon?: ReactNode; label: string; size?: number }) => {
  const look = useLook();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: look.font, fontSize: size, fontWeight: 500, color: look.ink, whiteSpace: "nowrap" }}>
      {icon && <div style={{ width: size * 1.6, height: size * 1.6, borderRadius: 99, background: look.card, boxShadow: look.cardShadow, display: "flex", alignItems: "center", justifyContent: "center", color: look.accent }}>{icon}</div>}
      {label}
    </div>
  );
};

/* ------------------------------------------------------------ pixel motifs */

/**
 * A field of small squares in the accent colour, flickering at different strengths and revealed
 * outwards from the centre. `hole` clears an ellipse in the middle for a word. The opening motif of
 * the graphic look; also good as a texture behind a title.
 */
export const DotMatrix = ({ at = 0, dur = 24, cols = 48, rows = 27, cell = 28, gap = 12, hole = 0, collapse, sound = true }: { at?: number; dur?: number; cols?: number; rows?: number; cell?: number; gap?: number; hole?: number; collapse?: number; sound?: boolean }) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const reveal = progress(frame, at, at + dur, easeOut);
  const gone = collapse === undefined ? 0 : progress(frame, collapse, collapse + 14, ease);
  const w = cols * (cell + gap), h = rows * (cell + gap);
  return (
    <>
      {sound && [0, 5, 11].map((d) => <Sfx key={d} name="glitch" at={at + d} />)}
      {sound && collapse !== undefined && <Sfx name="glitch" at={collapse} volume={1.3} />}
      <div style={{ position: "relative", width: w, height: h }}>
        {Array.from({ length: rows * cols }).map((_, i) => {
          const r = Math.floor(i / cols), ci = i % cols;
          const dx = (ci - (cols - 1) / 2) / (cols / 2), dy = (r - (rows - 1) / 2) / (rows / 2);
          const dist = Math.hypot(dx, dy);
          if (dist > reveal * 1.5 || dist < hole + gone * 1.6) return null;
          const flicker = Math.floor((frame + random(`p${i}`) * 40) / 5);
          const level = random(`l${i}-${flicker}`);
          const o = level > 0.72 ? 1 : level > 0.4 ? 0.35 : 0.12;
          return <div key={i} style={{ position: "absolute", left: ci * (cell + gap), top: r * (cell + gap), width: cell, height: cell, background: look.accent, opacity: o * (1 - gone) }} />;
        })}
      </div>
    </>
  );
};

/**
 * A cell of the graphic look's grid: a white box with hairlines running out to the edges of the
 * frame, drawn from the centre. Put the product name or one statement in it.
 */
export const GridCell = ({ at = 0, width = 520, height = 140, sound = true, children }: { at?: number; width?: number; height?: number; sound?: boolean; children: ReactNode }) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const t = progress(frame, at, at + 22, easeOut);
  const line = { position: "absolute", background: look.line } as const;
  return (
    <>
      {sound && <Sfx name="blip" at={at + 2} />}
      <div style={{ position: "relative", width, height }}>
        <div style={{ ...line, left: -1200 * t, right: -1200 * t, top: 0, height: 1 }} />
        <div style={{ ...line, left: -1200 * t, right: -1200 * t, bottom: 0, height: 1 }} />
        <div style={{ ...line, top: -800 * t, bottom: -800 * t, left: 0, width: 1 }} />
        <div style={{ ...line, top: -800 * t, bottom: -800 * t, right: 0, width: 1 }} />
        <div style={{ position: "absolute", inset: 0, background: look.card, display: "flex", alignItems: "center", justifyContent: "center", opacity: progress(frame, at, at + 10), fontFamily: look.font }}>{children}</div>
      </div>
    </>
  );
};

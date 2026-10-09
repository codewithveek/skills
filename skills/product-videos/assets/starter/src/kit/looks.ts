import { createContext, useContext } from "react";
import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadInterTight } from "@remotion/google-fonts/InterTight";
import { loadFont as loadJakarta } from "@remotion/google-fonts/PlusJakartaSans";
import { c, fontFamily } from "../theme";
import type { SfxName } from "./Sfx";

// A look is a video's visual style: the stage colours, the display font, how scenes hand over to
// each other and how fast it moves. The video *type* (launch, tutorial, explainer …) decides the
// structure; the look decides how it feels. See references/visual-styles.md.

const { fontFamily: jakarta } = loadJakarta("normal", { weights: ["500", "600", "700", "800"], subsets: ["latin"] });
const { fontFamily: interTight } = loadInterTight("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });
const { fontFamily: geist } = loadGeist("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

export type TransitionName = "fade" | "focus" | "circle" | "panel" | "slab" | "zoom" | "push" | "cut";

export type Look = {
  name: LookName;
  /** Display font for headlines, numbers and cards around the product */
  font: string;
  /** Stage colours. `accent` is the brand colour; `alarm` colours the problem ("That's it.", "Restricted"). */
  canvas: string;
  ink: string;
  muted: string;
  line: string;
  accent: string;
  onAccent: string;
  alarm: string;
  /** A card sitting on the stage (person cards, floating UI snippets) */
  card: string;
  cardShadow: string;
  /** Headline weight and tracking: editorial is bold and tight, graphic is medium and very tight */
  weight: number;
  tracking: number;
  /** The default hand-over between scenes, and its length in frames (the timeline's crossfade) */
  transition: TransitionName;
  crossfade: number;
  /** The look's music (a preset from `npm run music`), used when a video in Root.tsx names no track */
  music: string;
  /**
   * The look's sound palette. `level` scales every effect (0 silences them); `transitions` is the
   * sound each scene transition makes; `swap` replaces or (with null) drops an effect, so motion
   * blocks sound right in every look without changing the scenes.
   */
  sfx: { level: number; transitions: Record<TransitionName, SfxName | null>; swap: Partial<Record<SfxName, SfxName | null>> };
};

const TRANSITION_SOUNDS: Record<TransitionName, SfxName | null> = { fade: "whoosh", focus: "air", circle: "riser", panel: "open", slab: "thump", zoom: "riser", push: "swish", cut: null };

export type LookName = "studio" | "editorial" | "graphic" | "cinematic";

export const LOOKS: Record<LookName, Look> = {
  // Dark stage, the app window front and centre, camera and cursor. The original kit look.
  studio: {
    name: "studio", font: fontFamily, canvas: c.canvas, ink: c.ink, muted: c.muted, line: "rgba(255,255,255,0.08)",
    accent: c.brand, onAccent: "#ffffff", alarm: c.red, card: c.surface, cardShadow: "0 30px 80px rgba(0,0,0,0.5)",
    weight: 800, tracking: -0.032, transition: "fade", crossfade: 12, music: "music/upbeat.wav",
    // The original kit's sounds: a click per click, a whoosh per transition, little else
    sfx: { level: 1, transitions: { ...TRANSITION_SOUNDS, focus: "whoosh", panel: "whoosh" }, swap: {} },
  },
  // Warm paper, one big number or claim per scene, floating cards, focus-pull cuts, brand-colour
  // circle reveals for brand moments. Calm, confident, numbers-led.
  editorial: {
    name: "editorial", font: jakarta, canvas: "#efeee9", ink: "#141414", muted: "#77756f", line: "#cfcdc6",
    accent: c.brand, onAccent: "#ffffff", alarm: "#d4483a", card: "#ffffff", cardShadow: "0 18px 40px rgba(40,36,28,0.14), 0 2px 6px rgba(40,36,28,0.08)",
    weight: 700, tracking: -0.03, transition: "focus", crossfade: 14, music: "music/editorial.wav",
    // Paper and cards: soft knocks, a stamp, ticks on slow counts; no digital blips
    sfx: { level: 1, transitions: TRANSITION_SOUNDS, swap: { blip: "pop", glitch: null } },
  },
  // Flat white, one loud brand colour, a modular grid, pixel/dot motifs, full-bleed colour slabs.
  // Fast and graphic; built for products with little UI (APIs, infrastructure, data).
  graphic: {
    name: "graphic", font: interTight, canvas: "#fafafa", ink: "#111111", muted: "#8a8a8a", line: "#e7e7e7",
    accent: c.brand, onAccent: "#ffffff", alarm: c.brand, card: "#ffffff", cardShadow: "0 1px 0 #e7e7e7, 0 10px 30px rgba(0,0,0,0.06)",
    weight: 500, tracking: -0.045, transition: "slab", crossfade: 12, music: "music/graphic.wav",
    // Crisp and digital: things pop rather than land, accents blip
    sfx: { level: 1, transitions: TRANSITION_SOUNDS, swap: { land: "pop", air: "swish" } },
  },
  // Near-black, a soft glow, large light type, slow focus pulls. Premium, quiet launches.
  cinematic: {
    name: "cinematic", font: geist, canvas: "#050507", ink: "#f4f4f5", muted: "#8b8b94", line: "rgba(255,255,255,0.08)",
    accent: c.brand, onAccent: "#ffffff", alarm: "#ff7a6b", card: "#111114", cardShadow: "0 40px 120px rgba(0,0,0,0.7)",
    weight: 600, tracking: -0.04, transition: "focus", crossfade: 20, music: "music/cinematic.wav",
    // Almost silent: soft air on transitions and the important moments only, at half level
    sfx: { level: 0.5, transitions: { ...TRANSITION_SOUNDS, slab: "air", zoom: "air", push: "air" }, swap: { tick: null, pop: null, glitch: null, blip: null, swish: "air", land: null } },
  },
};

export const LookContext = createContext<Look>(LOOKS.studio);
/** The current video's look. makeVideo provides it from the timeline's `look`; scene compositions get it too. */
export const useLook = () => useContext(LookContext);

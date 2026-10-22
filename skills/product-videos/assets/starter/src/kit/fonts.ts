import { loadFont } from "@remotion/fonts";
import ebGaramondItalic from "@fontsource-variable/eb-garamond/files/eb-garamond-latin-wght-italic.woff2";
import ebGaramond from "@fontsource-variable/eb-garamond/files/eb-garamond-latin-wght-normal.woff2";
import interItalic from "@fontsource-variable/inter/files/inter-latin-opsz-italic.woff2";
import inter from "@fontsource-variable/inter/files/inter-latin-opsz-normal.woff2";
import jetbrainsMono from "@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2";
import instrumentSerifItalic from "@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2";
import instrumentSerif from "@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2";

// The kit's typefaces, bundled from npm (all SIL Open Font License) so renders need no network and
// look the same everywhere. Chosen from measured reference launches (references/visual-styles.md):
//   Inter (with optical sizes) — headlines use its Display cut automatically above ~32 px; the
//     neo-grotesk of two of the references. Also the default UI font for rebuilt screens.
//   EB Garamond — a Garamond book serif with real italics: the editorial headline and number face.
//   Instrument Serif — a condensed display serif; its italic is the accent face for cinematic.
//   JetBrains Mono — code and IDs.

export const FONTS = {
  sans: "Inter Variable",
  serif: "EB Garamond Variable",
  displaySerif: "Instrument Serif",
  mono: "JetBrains Mono Variable",
} as const;

type FontFile = { readonly family: string; readonly url: string; readonly weight: string; readonly style: "normal" | "italic" };

const FILES: readonly FontFile[] = [
  { family: FONTS.sans, url: inter, weight: "100 900", style: "normal" },
  { family: FONTS.sans, url: interItalic, weight: "100 900", style: "italic" },
  { family: FONTS.serif, url: ebGaramond, weight: "400 800", style: "normal" },
  { family: FONTS.serif, url: ebGaramondItalic, weight: "400 800", style: "italic" },
  { family: FONTS.displaySerif, url: instrumentSerif, weight: "400", style: "normal" },
  { family: FONTS.displaySerif, url: instrumentSerifItalic, weight: "400", style: "italic" },
  { family: FONTS.mono, url: jetbrainsMono, weight: "100 800", style: "normal" },
];

// Each load holds the render (delayRender) until its file is ready, so no frame renders in a fallback font.
for (const file of FILES) {
  void loadFont({ family: file.family, url: file.url, weight: file.weight, style: file.style, format: "woff2" });
}

/** A CSS font stack with sensible fallbacks. */
export const stack = (family: string, fallback: "sans-serif" | "serif" | "monospace" = "sans-serif"): string => `"${family}", ${fallback}`;

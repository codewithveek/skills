import React from "react";
import { Braces, Code2, Database, FileJson, FileText, GitBranch, Globe, Image, Link, Rss, Sheet, Table, Video } from "lucide-react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { pop, progress } from "../../anim";
import { MarkIcon, PRODUCT } from "../../brand";
import { Blueprint, Slab } from "../../kit/Backdrops";
import { useLook } from "../../kit/looks";
import { AccentLine, Chip, DotMatrix, GridCell, Orbit, Swirl, Tile, WordSlot } from "../../kit/Motion";
import { Sfx } from "../../kit/Sfx";

// The graphic look: flat white, one loud brand colour, a modular grid, pixel motifs and full-bleed
// slabs. Fast, music-led, built for products with little UI to show (APIs, data, infrastructure).
// Sources, formats and copy are illustrative: use what the product really supports.

const Center = ({ children }: { children: React.ReactNode }) => <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>{children}</AbsoluteFill>;

/* Pixels flicker out from the centre around a word, collapse, and the name lands in a grid cell */
export const Intro = () => {
  const frame = useCurrentFrame();
  const look = useLook();
  const swap = 50;
  return (
    <AbsoluteFill>
      <Blueprint />
      {frame < swap + 14 && (
        <Center>
          <DotMatrix at={0} dur={26} hole={0.42} collapse={swap - 8} />
        </Center>
      )}
      {frame < swap && (
        <Center>
          <div style={{ fontFamily: look.font, fontSize: 40, fontWeight: 500, letterSpacing: -1.2, color: look.ink, opacity: progress(frame, 12, 22) }}>Introducing</div>
        </Center>
      )}
      {frame >= swap && (
        <Center>
          <GridCell at={swap} width={620} height={150}>
            <AccentLine text={`*${PRODUCT}*`} at={swap + 4} size={64} />
          </GridCell>
        </Center>
      )}
    </AbsoluteFill>
  );
};

const ICONS = [Globe, FileText, Sheet, Image, Video, Rss, Database, Table, GitBranch, Link, Braces, Code2];

/* Tiles spiral out of the centre and scatter: "from anywhere" */
export const Anywhere = () => {
  const look = useLook();
  const tiles = Array.from({ length: 36 }).map((_, i) => {
    const Icon = ICONS[i % ICONS.length];
    const filled = i % 3 === 0;
    return (
      <Tile key={i} size={i % 4 === 0 ? 86 : 62} fill={filled ? look.accent : i % 5 === 0 ? "#151515" : undefined}>
        <Icon size={28} strokeWidth={1.8} />
      </Tile>
    );
  });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Blueprint />
      <Swirl tiles={tiles} at={0} dur={30} spread={0.95} />
      <Center>
        <div style={{ background: look.canvas, padding: "10px 26px", borderRadius: 8 }}>
          <AccentLine text="Get data from *anywhere*" at={10} size={64} />
        </div>
      </Center>
    </AbsoluteFill>
  );
};

/* Integrations orbit a statement */
export const Sources = () => {
  const names: [string, React.ReactNode][] = [["Git", <GitBranch size={18} />], ["Sheets", <Sheet size={18} />], ["RSS", <Rss size={18} />], ["Postgres", <Database size={18} />], ["Docs", <FileText size={18} />], ["Webhooks", <Link size={18} />], ["JSON APIs", <Braces size={18} />], ["Video", <Video size={18} />]];
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Blueprint />
      <Orbit items={names.map(([label, icon]) => <Chip key={label} label={label} icon={icon} />)} at={0} />
      <Center>
        <AccentLine text="plus the tools you *already use*" at={6} size={60} />
      </Center>
    </AbsoluteFill>
  );
};

const FORMAT_ICONS = [FileText, FileJson, Code2, Image, Table, Link, Video];

/* Formats step through a slot, the icon following the current one */
export const Formats = () => {
  const items = ["Markdown", "JSON", "HTML", "Screenshots", "Tables", "Links", "Video"];
  return (
    <AbsoluteFill>
      <Blueprint />
      <div style={{ position: "absolute", left: 120, top: 110 }}>
        <AccentLine text="In every format *you need*" at={0} size={52} align="left" />
      </div>
      <Center>
        <div style={{ background: "#fff", padding: "10px 60px", boxShadow: "0 0 0 1px #e7e7e7" }}>
          <WordSlot items={items} at={14} every={16} size={58} icon={(i) => React.createElement(FORMAT_ICONS[i % FORMAT_ICONS.length], { size: 64, strokeWidth: 1.6 })} />
        </div>
      </Center>
    </AbsoluteFill>
  );
};

/* A statement on a full-bleed slab, big and left-aligned */
export const Statement = () => {
  const frame = useCurrentFrame();
  const look = useLook();
  return (
    <AbsoluteFill>
      <Slab />
      <div style={{ position: "absolute", left: 120, top: 330 }}>
        <AccentLine text="All with one" at={4} size={150} color={look.onAccent} align="left" />
        <div style={{ opacity: progress(frame, 22, 30) }}>
          <AccentLine text="endpoint." at={22} size={150} color={look.onAccent} align="left" />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* The close: watermark mark, the name, then "is live now" */
export const Live = () => {
  const frame = useCurrentFrame();
  const look = useLook();
  const swap = 46;
  return (
    <AbsoluteFill>
      <Slab watermark />
      <Sfx name="blip" at={swap} />
      <Center>
        <div style={{ fontFamily: look.font, color: look.onAccent }}>
          {frame < swap ? <AccentLine text={PRODUCT} at={6} size={110} color={look.onAccent} /> : <AccentLine text="is live now" at={swap} size={110} color={look.onAccent} />}
        </div>
      </Center>
      <div style={{ position: "absolute", bottom: 90, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 10, fontFamily: look.font, fontSize: 28, fontWeight: 600, color: look.onAccent, opacity: progress(frame, 16, 28), transform: `scale(${pop(frame, 16)})` }}>
        <MarkIcon size={28} /> {PRODUCT}
      </div>
    </AbsoluteFill>
  );
};

export const SCENES = { intro: Intro, anywhere: Anywhere, sources: Sources, formats: Formats, statement: Statement, live: Live };

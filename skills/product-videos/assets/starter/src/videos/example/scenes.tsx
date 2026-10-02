import React from "react";
import { FolderKanban, LayoutDashboard, Settings, Users } from "lucide-react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { progress, typed } from "../../anim";
import { PRODUCT, TAGLINE } from "../../brand";
import { c, fontFamily } from "../../theme";
import { Anchor } from "../../kit/anchors";
import { AppFrame } from "../../kit/AppFrame";
import { Step } from "../../kit/AppStage";
import { EndCard, TitleCard } from "../../kit/Cards";
import { Btn, FooterNote, Input, PageHead, Row, Section } from "../../kit/controls";
import { Backdrop, Words } from "../../kit/Stage";
import { t } from "../../kit/tokens";
import { lineAt } from "../../kit/voice";
import VOICE from "./voice.json";

const NAV = [
  { label: "Overview", icon: <LayoutDashboard size={18} /> },
  { label: "Projects", icon: <FolderKanban size={18} /> },
  { label: "Team", icon: <Users size={18} /> },
  { label: "Settings", icon: <Settings size={18} /> },
];
const pressed = (frame: number, at: number) => frame >= at && frame < at + 6;

/* A problem statement in big kinetic words, timed to the narration */
export const Problem = () => {
  const line = lineAt(VOICE, "problem", 0);
  return (
    <AbsoluteFill style={{ fontFamily, alignItems: "center", justifyContent: "center", textAlign: "center", padding: 80 }}>
      <Backdrop glow={0.35} />
      <Words text="Setting up a workspace" at={line.from - 2} size={80} />
      <Words text="shouldn't take a week." at={line.from + 14} size={80} color={c.red} />
    </AbsoluteFill>
  );
};

export const Title = () => <TitleCard eyebrow="Introducing" title={PRODUCT} sub={TAGLINE} />;

/* A product moment: type into a field, click Save, see the confirmation. The camera follows anchors. */
export const Demo = () => {
  const frame = useCurrentFrame();
  const NAME = "Northwind";
  const name = typed(frame, NAME, 52, 12);
  const SAVE = 112;
  return (
    <Step
      eyebrow="Set up"
      text="Name it, save it, done."
      camera={[
        { f: 20, s: 1 },
        { f: 44, at: "workspace", s: 1.45 },
        { f: SAVE + 10, at: "workspace", s: 1.45 },
        { f: SAVE + 34, at: "footer", s: 1.8 },
      ]}
      pointer={[
        { f: 24, x: 1000, y: 760 },
        { f: 44, at: "name", fx: 0.3, click: true },
        { f: 90, at: "name", fx: 0.3, dy: 30 },
        { f: SAVE, at: "save", click: true },
        { f: SAVE + 40, at: "save", dx: 30, dy: 40 },
      ]}
    >
      <AppFrame nav={NAV} active="Settings">
        <PageHead title="Workspace" description="What your team sees when they sign in." />
        <Anchor name="workspace">
          <Section title="General" description="The basics. You can change these later.">
            <Row label="Workspace name" description="Shown in the sidebar and on invites.">
              <Anchor name="name">
                <Input width={300} placeholder="My workspace" value={name} focused={frame >= 44 && frame < SAVE} typing={name.length > 0 && name.length < NAME.length} />
              </Anchor>
            </Row>
            <Anchor name="footer">
              <div style={{ borderTop: `1px solid ${t.lineSubtle}`, padding: "12px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                <FooterNote>Changes apply to everyone in the workspace.</FooterNote>
                <div style={{ fontSize: 14, color: t.positive, opacity: progress(frame, SAVE + 4, SAVE + 10) }}>Saved.</div>
                <Anchor name="save" inline>
                  <Btn pressed={pressed(frame, SAVE)}>Save</Btn>
                </Anchor>
              </div>
            </Anchor>
          </Section>
        </Anchor>
      </AppFrame>
    </Step>
  );
};

export const Outro = () => <EndCard title={PRODUCT} sub={TAGLINE} next="Try it today" />;

export const SCENES = { problem: Problem, title: Title, demo: Demo, outro: Outro };

import React, { type ReactNode } from "react";
import { Bell, Search } from "lucide-react";
import { PRODUCT } from "../brand";
import { SCREEN } from "../theme";
import { Anchor } from "./anchors";
import { Mark } from "./Mark";
import { t } from "./tokens";

/**
 * A generic app frame: sidebar, top bar, and the page in the remaining space. A stand-in to start from.
 * Rebuild the real product's shell from its screenshots and code (nav labels, icons, widths, active
 * style), because a video's screens must look like the app people will open.
 */
export const AppFrame = ({ nav, active, children, scroll = 0 }: { nav: { label: string; icon: ReactNode }[]; active: string; children: ReactNode; scroll?: number }) => (
  <div style={{ width: SCREEN.w, height: SCREEN.h, background: t.canvas, display: "flex", color: t.ink, overflow: "hidden" }}>
    <div style={{ width: 256, flexShrink: 0, background: t.surface, borderRight: `1px solid ${t.lineSubtle}`, padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 6px 22px" }}>
        <Mark />
        <div style={{ fontSize: 15, fontWeight: 600 }}>{PRODUCT}</div>
      </div>
      {nav.map((item) => (
        <Anchor key={item.label} name={`nav:${item.label}`}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              height: 36,
              padding: "0 12px",
              marginBottom: 2,
              borderRadius: 8,
              fontSize: 15,
              fontWeight: item.label === active ? 600 : 400,
              color: item.label === active ? t.navActiveInk : t.muted,
              background: item.label === active ? t.navActive : "transparent",
            }}
          >
            {item.icon}
            {item.label}
          </div>
        </Anchor>
      ))}
    </div>
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
      <div style={{ height: 56, flexShrink: 0, borderBottom: `1px solid ${t.lineSubtle}`, display: "flex", alignItems: "center", padding: "0 24px", gap: 10 }}>
        <div style={{ width: 320, height: 36, borderRadius: 8, border: `1px solid ${t.lineSubtle}`, display: "flex", alignItems: "center", gap: 10, padding: "0 12px", color: t.muted, fontSize: 15 }}>
          <Search size={16} /> Search...
        </div>
        <div style={{ flex: 1 }} />
        <Bell size={18} color={t.muted} />
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{ padding: "24px 32px 40px", transform: `translateY(${-scroll}px)` }}>{children}</div>
      </div>
    </div>
  </div>
);

import React, { type CSSProperties, type ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { monoFamily } from "../theme";
import { STATUS, t, tone as toneOf, type Tone } from "./tokens";

// Controls as the platform draws them in dark mode, sized for the 1440x900 logical screen.

export const Card = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div style={{ background: t.surface, border: `1px solid ${t.lineSubtle}`, borderRadius: 16, overflow: "hidden", ...style }}>{children}</div>
);

export const PageHead = ({ title, description, crumb, action, style }: { title: string; description?: string; crumb?: string; action?: ReactNode; style?: CSSProperties }) => (
  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, marginBottom: 24, ...style }}>
    <div>
      {crumb && <div style={{ fontSize: 15, color: t.muted, textDecoration: "underline", marginBottom: 12 }}>{crumb}</div>}
      <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.4, color: t.ink, lineHeight: 1.25 }}>{title}</div>
      {description && <div style={{ fontSize: 15.5, color: t.muted, marginTop: 6, maxWidth: 660, lineHeight: 1.35 }}>{description}</div>}
    </div>
    {action}
  </div>
);

export const SectionHead = ({ title, description }: { title: string; description?: string }) => (
  <div style={{ padding: "20px 20px 18px" }}>
    <div style={{ fontSize: 17, fontWeight: 600, color: t.ink }}>{title}</div>
    {description && <div style={{ fontSize: 15, color: t.muted, marginTop: 4, lineHeight: 1.35 }}>{description}</div>}
  </div>
);

/** A settings card: a head, rows separated by hairlines, and an optional footer. */
export const Section = ({ title, description, children, footer, style }: { title?: string; description?: string; children?: ReactNode; footer?: ReactNode; style?: CSSProperties }) => (
  <Card style={style}>
    {title && <SectionHead title={title} description={description} />}
    {children}
    {footer && (
      <div style={{ borderTop: `1px solid ${t.lineSubtle}`, padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>{footer}</div>
    )}
  </Card>
);

export const Row = ({ label, description, children, stack, style }: { label: ReactNode; description?: ReactNode; children?: ReactNode; stack?: boolean; style?: CSSProperties }) => (
  <div
    style={{
      borderTop: `1px solid ${t.lineSubtle}`,
      padding: "18px 20px",
      display: "flex",
      flexDirection: stack ? "column" : "row",
      alignItems: stack ? "stretch" : "center",
      justifyContent: "space-between",
      gap: stack ? 12 : 24,
      ...style,
    }}
  >
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: t.ink }}>{label}</div>
      {description && <div style={{ fontSize: 15, color: t.muted, marginTop: 3, lineHeight: 1.35 }}>{description}</div>}
    </div>
    {children}
  </div>
);

export const FooterNote = ({ children }: { children: ReactNode }) => (
  <div style={{ flex: 1, fontSize: 13, color: t.muted, lineHeight: 1.35, maxWidth: 420 }}>{children}</div>
);

export const Btn = ({
  children,
  kind = "primary",
  pressed = false,
  style,
  small,
}: {
  children: ReactNode;
  kind?: "primary" | "secondary";
  pressed?: boolean;
  style?: CSSProperties;
  small?: boolean;
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      height: small ? 30 : 36,
      padding: small ? "0 11px" : "0 15px",
      borderRadius: 8,
      fontSize: small ? 13.5 : 15,
      fontWeight: 600,
      whiteSpace: "nowrap",
      color: kind === "primary" ? "#fff" : t.ink,
      background: kind === "primary" ? (pressed ? t.brandStrong : t.brand) : pressed ? t.sunken : "transparent",
      border: kind === "primary" ? "1px solid transparent" : `1px solid ${t.lineControl}`,
      transform: `scale(${pressed ? 0.96 : 1})`,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Badge = ({ status, label, tone, style, dot = true }: { status?: string; label?: string; tone?: Tone; style?: CSSProperties; dot?: boolean }) => {
  const k = toneOf(tone ?? STATUS[status ?? ""] ?? "neutral");
  const text = label ?? (status ? status.replace(/_/g, " ").replace(/^./, (m) => m.toUpperCase()) : "");
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "1px 9px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 500,
        lineHeight: "20px",
        color: k.fg,
        background: k.bg,
        border: `1px solid ${k.edge}`,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: 3, background: k.fg }} />}
      {text}
    </span>
  );
};

/** The blinking text caret, solid while typing. */
export const Caret = ({ typing }: { typing: boolean }) => {
  const frame = useCurrentFrame();
  const on = typing || Math.floor(frame / 15) % 2 === 0;
  return <span style={{ display: "inline-block", width: 1.5, height: 18, background: t.ink, marginLeft: 1, opacity: on ? 1 : 0 }} />;
};

export const Input = ({
  value = "",
  placeholder,
  prefix,
  suffix,
  focused,
  typing,
  width,
  mono,
  style,
}: {
  value?: string;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  focused?: boolean;
  typing?: boolean;
  width?: number | string;
  mono?: boolean;
  style?: CSSProperties;
}) => (
  <div
    style={{
      display: "flex",
      height: 36,
      width,
      borderRadius: 8,
      border: `1px solid ${focused ? t.focus : t.lineControl}`,
      boxShadow: focused ? `0 0 0 1px ${t.focus}` : undefined,
      overflow: "hidden",
      fontSize: 15,
      flexShrink: 0,
      ...style,
    }}
  >
    {prefix && (
      <div style={{ display: "flex", alignItems: "center", padding: "0 10px", color: t.muted, borderRight: `1px solid ${t.lineControl}`, background: t.lineSubtle, fontFamily: monoFamily, fontSize: 14 }}>
        {prefix}
      </div>
    )}
    <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 12px", color: value ? t.ink : t.muted, fontFamily: mono ? monoFamily : undefined, fontSize: mono ? 14 : 15, whiteSpace: "nowrap", overflow: "hidden" }}>
      {value || (focused ? "" : placeholder)}
      {focused && <Caret typing={!!typing} />}
      {focused && !value && placeholder && <span style={{ color: t.muted }}>{placeholder}</span>}
    </div>
    {suffix && <div style={{ display: "flex", alignItems: "center", padding: "0 12px", color: t.muted, borderLeft: `1px solid ${t.lineControl}`, minWidth: 50, justifyContent: "center" }}>{suffix}</div>}
  </div>
);

export const Select = ({ value, placeholder, width, focused }: { value?: string; placeholder?: string; width?: number | string; focused?: boolean }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: 36,
      width,
      padding: "0 12px 0 16px",
      borderRadius: 8,
      border: `1px solid ${focused ? t.focus : t.lineControl}`,
      boxShadow: focused ? `0 0 0 1px ${t.focus}` : undefined,
      fontSize: 15,
      color: t.ink,
      flexShrink: 0,
    }}
  >
    <span style={{ color: value ? t.ink : t.ink }}>{value ?? placeholder}</span>
    <svg width="12" height="12" viewBox="0 0 12 12">
      <path d="M2.5 4.5 L6 8 L9.5 4.5" fill="none" stroke={t.ink} strokeWidth="1.6" />
    </svg>
  </div>
);

export const Textarea = ({ value = "", focused, typing, rows = 2 }: { value?: string; focused?: boolean; typing?: boolean; rows?: number }) => (
  <div
    style={{
      minHeight: 14 + rows * 22,
      borderRadius: 8,
      border: `1px solid ${focused ? t.focus : t.lineControl}`,
      boxShadow: focused ? `0 0 0 1px ${t.focus}` : undefined,
      padding: "8px 12px",
      fontSize: 15,
      color: t.ink,
      lineHeight: "22px",
    }}
  >
    {value}
    {focused && <Caret typing={!!typing} />}
  </div>
);

/** The app's on/off switch. */
export const Toggle = ({ on }: { on: number }) => (
  <div style={{ width: 40, height: 24, borderRadius: 12, background: on > 0.5 ? t.brandStrong : t.lineControl, position: "relative", flexShrink: 0 }}>
    <div style={{ position: "absolute", top: 3, left: 3 + 16 * on, width: 18, height: 18, borderRadius: 9, background: "#fff" }} />
  </div>
);

/** Boxed radio choices, like "Percentage of the order" / "Flat amount" and "Bank account" / "Mobile money". */
export const Choice = ({ options, value, direction = "column", width }: { options: string[]; value: string; direction?: "row" | "column"; width?: number }) => (
  <div style={{ display: "flex", flexDirection: direction, gap: 8, width }}>
    {options.map((o) => {
      const on = o === value;
      return (
        <div
          key={o}
          style={{
            height: 36,
            flex: direction === "row" ? 1 : undefined,
            display: "flex",
            alignItems: "center",
            justifyContent: direction === "row" ? "center" : "flex-start",
            padding: "0 16px",
            borderRadius: 8,
            border: `1px solid ${on ? t.focus : t.lineControl}`,
            boxShadow: on ? `0 0 0 1px ${t.focus}` : undefined,
            background: on ? t.brandSubtle : "transparent",
            color: on ? t.link : t.ink,
            fontSize: 15,
            fontWeight: on ? 500 : 400,
            whiteSpace: "nowrap",
          }}
        >
          {o}
        </div>
      );
    })}
  </div>
);

/** A round radio with a label and a line under it (the Team page's roles). */
export const Radio = ({ label, description, on }: { label: string; description?: string; on: boolean }) => (
  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
    <div style={{ width: 16, height: 16, borderRadius: 8, marginTop: 3, border: `1.5px solid ${on ? t.link : t.lineStrong}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {on && <div style={{ width: 8, height: 8, borderRadius: 4, background: t.link }} />}
    </div>
    <div>
      <div style={{ fontSize: 15, fontWeight: 600, color: t.ink }}>{label}</div>
      {description && <div style={{ fontSize: 15, color: t.muted, marginTop: 1 }}>{description}</div>}
    </div>
  </div>
);

export const Tabs = ({ items, active }: { items: string[]; active: string }) => (
  <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${t.line}`, marginBottom: 24 }}>
    {items.map((i) => (
      <div
        key={i}
        style={{
          padding: "10px 12px",
          fontSize: 15,
          fontWeight: i === active ? 600 : 400,
          color: i === active ? t.link : t.muted,
          borderBottom: `2px solid ${i === active ? t.link : "transparent"}`,
          marginBottom: -1,
          whiteSpace: "nowrap",
        }}
      >
        {i}
      </div>
    ))}
  </div>
);

/** A value in a sunken box with a Copy button, like the join link and the endpoint. */
export const CopyField = ({ value, copied, style }: { value: ReactNode; copied?: boolean; style?: CSSProperties }) => (
  <div style={{ display: "flex", gap: 8, alignItems: "center", ...style }}>
    <div style={{ flex: 1, height: 34, borderRadius: 8, background: t.lineSubtle, display: "flex", alignItems: "center", padding: "0 12px", fontFamily: monoFamily, fontSize: 13.5, color: t.ink, whiteSpace: "nowrap", overflow: "hidden" }}>
      {value}
    </div>
    <Btn kind="secondary" small style={{ color: copied ? t.positive : t.ink }}>
      {copied ? "Copied" : "Copy"}
    </Btn>
  </div>
);

export const IconTile = ({ children, size = 32 }: { children: ReactNode; size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: 8, background: t.brandSubtle, color: t.link, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{children}</div>
);

export const Avatar = ({ initials, size = 30 }: { initials: string; size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: t.brandSubtle, color: t.link, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, fontWeight: 700, flexShrink: 0 }}>
    {initials}
  </div>
);

export const Kpi = ({ label, icon, value, sub, valueColor, style }: { label: string; icon: ReactNode; value: ReactNode; sub?: ReactNode; valueColor?: string; style?: CSSProperties }) => (
  <Card style={{ flex: 1, padding: "20px 20px 18px", ...style }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div style={{ fontSize: 15.5, fontWeight: 500, color: t.muted, marginTop: 6 }}>{label}</div>
      <IconTile>{icon}</IconTile>
    </div>
    <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.8, color: valueColor ?? t.ink, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>{value}</div>
    {sub && <div style={{ fontSize: 13, color: t.muted, marginTop: 6, lineHeight: 1.35 }}>{sub}</div>}
  </Card>
);

export const Th = ({ children, align = "left", style }: { children?: ReactNode; align?: "left" | "right"; style?: CSSProperties }) => (
  <div style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: 0.9, textTransform: "uppercase", color: t.muted, textAlign: align, ...style }}>{children}</div>
);

export const Mono = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => <span style={{ fontFamily: monoFamily, fontSize: 13, ...style }}>{children}</span>;

/** A modal dialog over a dimmed page. `open` is 0..1. */
export const Dialog = ({ open, title, children, actions, width = 448 }: { open: number; title: string; children: ReactNode; actions: ReactNode; width?: number }) =>
  open <= 0 ? null : (
    <div style={{ position: "absolute", inset: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: t.scrim, opacity: open }} />
      <div
        style={{
          position: "relative",
          width,
          background: t.popover,
          border: `1px solid ${t.popoverLine}`,
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 12px 32px -8px rgba(0,0,0,0.6)",
          opacity: open,
          transform: `scale(${0.96 + 0.04 * open})`,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 600, color: t.ink }}>{title}</div>
        <div style={{ fontSize: 15, color: t.ink, opacity: 0.85, lineHeight: 1.35, marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 24 }}>{actions}</div>
      </div>
    </div>
  );

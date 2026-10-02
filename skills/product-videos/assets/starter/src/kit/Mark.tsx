import React from "react";
import { MarkIcon } from "../brand";
import { c } from "../theme";

/** The brand tile: a rounded square with the logo glyph. */
export const Mark = ({ size = 28 }: { size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.28, background: c.brand, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <MarkIcon size={size * 0.58} strokeWidth={2.25} />
  </div>
);

import React, { createContext, useContext, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";

/**
 * Named points on the logical screen. An element wrapped in <Anchor name="save">
 * reports its box in screen coordinates, whatever the camera is doing, so the
 * cursor and camera aim at "save" instead of at hand-measured numbers. Boxes are
 * re-measured on every frame, so an anchor that moves (a row sliding in, a page
 * scrolling) is followed.
 */
export type Box = { x: number; y: number; w: number; h: number };
type Store = { boxes: Map<string, Box>; root: React.RefObject<HTMLDivElement | null>; screenW: number; bump: () => void; version: number };

const Ctx = createContext<Store | null>(null);

export const AnchorProvider = ({ children, screenW }: { children: ReactNode; screenW: number }) => {
  const root = useRef<HTMLDivElement>(null);
  const boxes = useRef(new Map<string, Box>()).current;
  const [version, setVersion] = useState(0);
  // A new value on every measurement change, so the camera and pointer re-render
  // with the new boxes in the same frame, before it is captured
  const store = useMemo<Store>(() => ({ boxes, root, screenW, bump: () => setVersion((v) => v + 1), version }), [boxes, screenW, version]);
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
};

export const useAnchorStore = () => {
  const store = useContext(Ctx);
  if (!store) throw new Error("Anchor used outside an AnchorProvider");
  return store;
};

export const Anchor = ({ name, children, style, inline }: { name: string; children: ReactNode; style?: React.CSSProperties; inline?: boolean }) => {
  const store = useContext(Ctx);
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!store || !ref.current || !store.root.current) return;
    const r = ref.current.getBoundingClientRect();
    const o = store.root.current.getBoundingClientRect();
    const k = o.width / store.screenW;
    const box = { x: (r.left - o.left) / k, y: (r.top - o.top) / k, w: r.width / k, h: r.height / k };
    const old = store.boxes.get(name);
    if (!old || Math.abs(old.x - box.x) > 0.25 || Math.abs(old.y - box.y) > 0.25 || Math.abs(old.w - box.w) > 0.25 || Math.abs(old.h - box.h) > 0.25) {
      store.boxes.set(name, box);
      store.bump();
    }
  });
  return (
    <div ref={ref} style={{ display: inline ? "inline-flex" : undefined, ...style }}>
      {children}
    </div>
  );
};

/** A point aimed at: an anchor (its centre, or a fraction of its box), or a raw screen point. */
export type Aim = { at?: string; x?: number; y?: number; fx?: number; fy?: number; dx?: number; dy?: number };

export const resolve = (boxes: Map<string, Box>, aim: Aim, fallback = { x: 720, y: 450 }) => {
  if (aim.at) {
    const b = boxes.get(aim.at);
    if (!b) return { x: fallback.x, y: fallback.y };
    return { x: b.x + b.w * (aim.fx ?? 0.5) + (aim.dx ?? 0), y: b.y + b.h * (aim.fy ?? 0.5) + (aim.dy ?? 0) };
  }
  return { x: (aim.x ?? fallback.x) + (aim.dx ?? 0), y: (aim.y ?? fallback.y) + (aim.dy ?? 0) };
};

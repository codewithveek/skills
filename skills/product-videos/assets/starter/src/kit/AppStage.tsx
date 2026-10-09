import React, { createContext, useContext, useLayoutEffect, type ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { progress, track } from "../anim";
import { c, fontFamily, SCREEN } from "../theme";
import { AnchorProvider, resolve, useAnchorStore, type Aim } from "./anchors";
import { Cursor } from "./Cursor";
import { Stage } from "./Backdrops";
import { useLook } from "./looks";
import { Headline, useFrameShape } from "./Stage";

/** A camera keyframe: aim at an anchor (or a raw screen point) at frame `f`, zoomed by `s`. */
export type CameraKey = Aim & { f: number; s?: number };
/** A pointer keyframe: be at an anchor (or point) at frame `f`; `click` plays the click there. */
export type PointerKey = Aim & { f: number; click?: boolean };

const Screen = ({ camera, pointer, show, visibleH, zoom, children }: { camera: CameraKey[]; pointer?: PointerKey[]; show?: [number, number]; visibleH: number; zoom: (s: number) => number; children: ReactNode }) => {
  const frame = useCurrentFrame();
  const store = useAnchorStore();
  // Anchors measure in their layout effects, which run before this div's ref is attached on the
  // first render. One more pass once it is mounted lets them measure within the same frame, which
  // matters for single-frame stills and for the first frame of every render tab.
  useLayoutEffect(() => store.bump(), []); // eslint-disable-line react-hooks/exhaustive-deps
  // The window can run off the bottom of the frame, so the camera frames only the part that shows
  const keys = camera.map((k) => ({ f: k.f, s: zoom(k.s ?? 1), ...resolve(store.boxes, k, { x: SCREEN.w / 2, y: visibleH / 2 }) }));
  const cam = track(frame, keys);
  const s = cam.s;
  const half = { w: SCREEN.w / (2 * s), h: visibleH / (2 * s) };
  const x = Math.min(Math.max(cam.x, half.w), SCREEN.w - half.w);
  const y = Math.min(Math.max(cam.y, half.h), SCREEN.h - half.h);
  const path = pointer?.map((k) => ({ f: k.f, ...resolve(store.boxes, k) }));
  const clicks = pointer?.filter((k) => k.click).map((k) => k.f) ?? [];

  return (
    <div
      ref={store.root}
      style={{ width: SCREEN.w, height: SCREEN.h, position: "relative", transformOrigin: "0 0", transform: `translate(${SCREEN.w / 2 - x * s}px, ${visibleH / 2 - y * s}px) scale(${s})` }}
    >
      {children}
      {path && path.length > 0 && <Cursor path={path} clicks={clicks} show={show ?? [path[0].f, 1e6]} />}
    </div>
  );
};

/**
 * A floating app window over the logical SCREEN (1440x900 by default). The camera and the
 * pointer aim at anchors or raw screen points. Width and top follow the frame's shape unless
 * given, so the same scene works in 16:9, 1:1 and 9:16.
 */
export const AppWindow = ({
  children,
  camera,
  pointer,
  pointerShow,
  enter = 0,
  exit,
  width,
  top,
}: {
  children: ReactNode;
  camera: CameraKey[];
  pointer?: PointerKey[];
  pointerShow?: [number, number];
  enter?: number;
  exit?: number;
  width?: number;
  top?: number;
}) => {
  const frame = useCurrentFrame();
  const look = useLook();
  const dark = look.name === "studio" || look.name === "cinematic";
  const { width: fw, height: fh, portrait } = useFrameShape();
  const w = width ?? Math.round(portrait ? fw - 60 : fw * 0.78);
  const tp = top ?? Math.round(portrait ? fh * 0.3 : fh * 0.213);
  const scale = w / SCREEN.w;
  // Portrait: a taller 4:5 window, and the camera always at least 2x, so it frames a readable column of
  // the UI instead of a tiny strip. The same camera keys serve both shapes.
  const height = portrait ? Math.round(w * 1.25) : SCREEN.h * scale;
  const zoom = portrait ? (s: number) => Math.max(2, s * 1.5) : (s: number) => s;
  const visibleH = portrait ? height / scale : Math.min(SCREEN.h, (fh - tp) / scale);
  const t = progress(frame, enter, enter + 30);
  const out = exit === undefined ? 0 : progress(frame, exit, exit + 16);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: tp, display: "flex", justifyContent: "center", perspective: 2200 }}>
      <div
        style={{
          width: w,
          height,
          borderRadius: 18,
          overflow: "hidden",
          position: "relative",
          border: dark ? "1px solid rgba(255,255,255,0.09)" : `1px solid ${look.line}`,
          // On light looks the window floats on a soft shadow; on dark ones it glows in the brand colour
          boxShadow: dark ? `0 40px 120px -20px rgba(0,0,0,0.9), 0 0 0 1px rgba(0,0,0,0.6), 0 0 160px -40px ${c.brand}66` : "0 50px 100px -30px rgba(40,36,28,0.35), 0 12px 30px rgba(40,36,28,0.10)",
          opacity: t * (1 - out),
          transform: `translateY(${(1 - t) * 160 + out * 40}px) rotateX(${(1 - t) * 22}deg) scale(${0.9 + 0.1 * t - out * 0.04})`,
          transformOrigin: "50% 0%",
          fontFamily,
        }}
      >
        <div style={{ width: SCREEN.w, height: SCREEN.h, transformOrigin: "0 0", transform: `scale(${scale})` }}>
          <AnchorProvider screenW={SCREEN.w}>
            <Screen camera={camera} pointer={pointer} show={pointerShow} visibleH={visibleH} zoom={zoom}>
              {children}
            </Screen>
          </AnchorProvider>
        </div>
      </div>
    </div>
  );
};

/** Lets another video reuse a step with its own headline: wrap the scene in <StepCopy.Provider>. */
export const StepCopy = createContext<{ eyebrow: string; text: string } | null>(null);

/** A step: backdrop, the step's headline, and the app window under it. The standard product-moment scene. */
export const Step = ({
  eyebrow,
  text,
  children,
  ...win
}: {
  eyebrow: string;
  text: string;
  children: ReactNode;
  camera: CameraKey[];
  pointer?: PointerKey[];
  pointerShow?: [number, number];
  enter?: number;
  exit?: number;
}) => {
  const copy = useContext(StepCopy);
  return (
    <AbsoluteFill>
      <Stage />
      <Headline eyebrow={copy?.eyebrow ?? eyebrow} text={copy?.text ?? text} at={2} />
      <AppWindow enter={4} {...win}>
        {children}
      </AppWindow>
    </AbsoluteFill>
  );
};

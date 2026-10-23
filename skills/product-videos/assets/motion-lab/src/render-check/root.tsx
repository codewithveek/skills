import { Composition } from "remotion";
import { PresetReplay, replayDurationInFrames } from "./preset-replay";
import type { PresetReplayProps } from "./preset-replay";

export const REPLAY_FPS = 60;
export const REPLAY_COMPOSITION_ID = "PresetReplay";

const DEFAULT_PROPS: PresetReplayProps = {
  preset: { id: "default", channel: "translateX", durationMs: 600, travel: 600, easing: { kind: "bezier", x1: 0.33, y1: 1, x2: 0.68, y2: 1 } },
  holdBeforeFrames: 12,
  holdAfterFrames: 12,
};

export function RemotionRoot(): JSX.Element {
  return (
    <Composition
      id={REPLAY_COMPOSITION_ID}
      component={PresetReplay}
      width={1920}
      height={1080}
      fps={REPLAY_FPS}
      durationInFrames={replayDurationInFrames(DEFAULT_PROPS, REPLAY_FPS)}
      defaultProps={DEFAULT_PROPS}
      calculateMetadata={({ props }) => ({ durationInFrames: replayDurationInFrames(props, REPLAY_FPS) })}
    />
  );
}

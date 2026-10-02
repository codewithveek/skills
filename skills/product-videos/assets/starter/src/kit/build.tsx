import React from "react";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from "remotion";
import { BurnedCaptions, captionsFrom } from "./BurnedCaptions";
import { THUMB_FRAME } from "./Thumbnail";

export type Cue = { from: number; to: number; text: string };
export type VideoSpec = { id: string; title: string; crossfade: number; scenes: { id: string; frames: number; cues: Cue[] }[] };
/** scripts/voice.mts writes this: where each narration line lands, and how long each scene must be to fit it. */
export type VoiceSpec = { scenes: Record<string, { lines: { src: string; from: number; frames: number; text: string }[]; minFrames: number }> };

/** Each scene's length, grown where its narration needs more room. */
export const sceneFrames = (v: VideoSpec, voice?: VoiceSpec) => v.scenes.map((s) => Math.max(s.frames, voice?.scenes[s.id]?.minFrames ?? 0));

export const totalFrames = (v: VideoSpec, voice?: VoiceSpec) => sceneFrames(v, voice).reduce((n, f) => n + f, 0) - v.crossfade * (v.scenes.length - 1);

/** Where each scene starts in the finished video: scenes overlap by the crossfade. */
export const sceneStarts = (frames: number[], crossfade: number) => {
  let at = 0;
  return frames.map((f) => {
    const start = at;
    at += f - crossfade;
    return start;
  });
};

const WHOOSH = 0.2;
const MUSIC = { alone: 0.3, underVoice: 0.11, ramp: 8 };

/**
 * Music under the whole video, quieter while anyone speaks. `spans` are the
 * narration's [from, to] in video frames.
 */
export const musicVolume = (frame: number, total: number, spans: [number, number][], level = MUSIC) => {
  let duck = 0;
  for (const [a, b] of spans) duck = Math.max(duck, interpolate(frame, [a - level.ramp, a, b, b + level.ramp], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const fades = Math.min(interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }), interpolate(frame, [total - 50, total - 2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (level.alone + (level.underVoice - level.alone) * duck) * fades;
};

/** A soft whoosh as each crossfade begins. */
export const Whooshes = ({ at }: { at: number[] }) => (
  <>
    {at.map((f) => (
      <Sequence key={f} from={Math.max(0, f - 3)} durationInFrames={20} layout="none">
        <Audio src={staticFile("sfx/whoosh.wav")} volume={WHOOSH} />
      </Sequence>
    ))}
  </>
);

/** One component per scene id, played in the timeline's order with crossfades, narration, music and transition sounds. `burnCaptions` draws the narration into the picture (for muted feeds). */
export const makeVideo = (v: VideoSpec, components: Record<string, () => React.JSX.Element>, voice?: VoiceSpec, music = "music/bed.wav", level = MUSIC, burnCaptions = false) => {
  for (const s of v.scenes) if (!components[s.id]) throw new Error(`${v.id}: no component for scene "${s.id}"`);
  const frames = sceneFrames(v, voice);
  const starts = sceneStarts(frames, v.crossfade);
  const total = totalFrames(v, voice);
  const captions = burnCaptions ? captionsFrom(v.scenes.flatMap((s, i) => (voice?.scenes[s.id]?.lines ?? []).map((l) => ({ ...l, from: starts[i] + l.from })))) : [];
  const spans: [number, number][] = v.scenes.flatMap((s, i) => (voice?.scenes[s.id]?.lines ?? []).map((l) => [starts[i] + l.from, starts[i] + l.from + l.frames] as [number, number]));

  const Video = () => (
    <AbsoluteFill>
      <TransitionSeries>
        {v.scenes.flatMap(({ id }, i) => {
          const C = components[id];
          return [
            <TransitionSeries.Sequence key={id} durationInFrames={frames[i]}>
              <C />
              {(voice?.scenes[id]?.lines ?? []).map((l) => (
                <Sequence key={l.src} from={l.from} durationInFrames={l.frames + 4} layout="none">
                  <Audio src={staticFile(l.src)} />
                </Sequence>
              ))}
            </TransitionSeries.Sequence>,
            ...(i < v.scenes.length - 1
              ? [<TransitionSeries.Transition key={`${id}-x`} presentation={fade()} timing={linearTiming({ durationInFrames: v.crossfade })} />]
              : []),
          ];
        })}
      </TransitionSeries>
      <Audio src={staticFile(music)} volume={(f) => musicVolume(f, total, spans, level)} />
      <Whooshes at={starts.slice(1)} />
      {burnCaptions && <BurnedCaptions captions={captions} />}
    </AbsoluteFill>
  );
  return Video;
};

/**
 * Open on the thumbnail: held, then crossfading into the video. X, LinkedIn and most players use a
 * video's opening frame as its preview and ignore embedded cover art, so this is what makes the
 * thumbnail show up when the file is posted. The poster is drawn at THUMB_FRAME (where thumbnails
 * are designed to be seen); the video itself starts posterOffset frames in.
 */
export const POSTER = { hold: 25, fade: 10 };
export const posterOffset = POSTER.hold - POSTER.fade;

export const withPoster = (Video: () => React.JSX.Element, Poster: () => React.JSX.Element, total: number) => {
  const WithPoster = () => (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={POSTER.hold}>
        <Sequence from={-THUMB_FRAME}>
          <Poster />
        </Sequence>
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: POSTER.fade })} />
      <TransitionSeries.Sequence durationInFrames={total}>
        <Video />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
  return WithPoster;
};

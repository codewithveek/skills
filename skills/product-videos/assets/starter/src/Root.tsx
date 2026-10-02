import React from "react";
import { Composition } from "remotion";
import { makeVideo, posterOffset, sceneFrames, totalFrames, withPoster, type VideoSpec, type VoiceSpec } from "./kit/build";
import { Thumbnail, THUMB_FRAMES } from "./kit/Thumbnail";
import { FPS } from "./theme";
import { SCENES as EXAMPLE_SCENES } from "./videos/example/scenes";
import { VIDEO as EXAMPLE } from "./videos/example/timeline";
import EXAMPLE_VOICE from "./videos/example/voice.json";

type Level = { alone: number; underVoice: number; ramp: number };
// One entry per video: [cut list, scenes, voice manifest, music file, music levels].
// Music: "music/bed.wav" (calm, for tutorials) or "music/upbeat.wav" (launches). Levels default to bed levels.
const VIDEOS: [VideoSpec, Record<string, () => React.JSX.Element>, VoiceSpec, string?, Level?][] = [
  [EXAMPLE, EXAMPLE_SCENES, EXAMPLE_VOICE, "music/upbeat.wav", { alone: 0.5, underVoice: 0.16, ramp: 8 }],
];

// Videos that also get a 9:16 cutdown (<Title>Vertical, 1080x1920), reusing the same scenes and voice,
// with the narration burned in as captions (feeds autoplay muted).
const VERTICAL = new Set(["example"]);

// Thumbnails: [composition id (<Title>Thumbnail), eyebrow, [line 1, line 2], scene, frame of that scene].
const THUMBNAILS: [string, string, [string, string], () => React.JSX.Element, number][] = [
  ["ExampleThumbnail", "Introducing", ["Set up in", "one minute"], EXAMPLE_SCENES.demo, 170],
];

const thumbnail = ([, eyebrow, title, Scene, at]: (typeof THUMBNAILS)[number]) => {
  const T = () => <Thumbnail eyebrow={eyebrow} title={title} Scene={Scene} at={at} />;
  return T;
};
// A video with a thumbnail opens on it (withPoster), so feeds that preview the first frame show it.
// Set OPEN_ON_THUMBNAIL to false to start straight on the first scene.
const OPEN_ON_THUMBNAIL = true;
const POSTERS: Record<string, () => React.JSX.Element> = Object.fromEntries(THUMBNAILS.map((t) => [t[0].replace(/Thumbnail$/, ""), thumbnail(t)]));
const compose = (spec: VideoSpec, scenes: Record<string, () => React.JSX.Element>, voice: VoiceSpec, music?: string, level?: Level, burn = false) => {
  const video = makeVideo(spec, scenes, voice, music, level, burn);
  const total = totalFrames(spec, voice);
  const poster = OPEN_ON_THUMBNAIL ? POSTERS[spec.title] : undefined;
  return poster ? { component: withPoster(video, poster, total), durationInFrames: total + posterOffset } : { component: video, durationInFrames: total };
};

export const Root = () => (
  <>
    {VIDEOS.map(([spec, scenes, voice, music, level]) => (
      <React.Fragment key={spec.id}>
        <Composition id={spec.title} {...compose(spec, scenes, voice, music, level)} fps={FPS} width={1920} height={1080} />
        {/* Cutdowns start straight on the hook: platforms that take a cover use their own picker */}
        {VERTICAL.has(spec.id) && (
          <Composition id={`${spec.title}Vertical`} component={makeVideo(spec, scenes, voice, music, level, true)} durationInFrames={totalFrames(spec, voice)} fps={FPS} width={1080} height={1920} />
        )}
        {/* Each scene on its own, for stills and quick previews: <video id>-<scene id> */}
        {spec.scenes.map(({ id }, i) => (
          <Composition key={id} id={`${spec.id}-${id}`} component={scenes[id]} durationInFrames={sceneFrames(spec, voice)[i]} fps={FPS} width={1920} height={1080} />
        ))}
      </React.Fragment>
    ))}
    {THUMBNAILS.map((entry) => (
      <Composition key={entry[0]} id={entry[0]} component={thumbnail(entry)} durationInFrames={THUMB_FRAMES} fps={FPS} width={1920} height={1080} />
    ))}
  </>
);

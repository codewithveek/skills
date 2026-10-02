import type { VoiceSpec } from "./build";

/**
 * When the n-th narration line of a scene starts and how long it runs, from the video's voice.json,
 * so on-screen words land with the voice. Falls back to `fallback` until `npm run voice` has run.
 */
export const lineAt = (voice: VoiceSpec, scene: string, n: number, fallback = { from: 10 + n * 60, frames: 50 }) => voice.scenes[scene]?.lines[n] ?? fallback;

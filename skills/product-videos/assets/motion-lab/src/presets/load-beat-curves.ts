import { readFile } from "node:fs/promises";
import type { AnalysisChannel, BeatCurve, BeatCurveFile } from "./types";

const ANALYSIS_CHANNELS: ReadonlySet<string> = new Set<AnalysisChannel>(["translate_x", "translate_y", "scale", "speed"]);

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number" && Number.isFinite(item));
}

function isBeatCurve(value: unknown): value is BeatCurve {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record["beat_id"] === "number" &&
    typeof record["scene"] === "string" &&
    typeof record["start_frame"] === "number" &&
    typeof record["end_frame"] === "number" &&
    typeof record["duration_frames"] === "number" &&
    typeof record["channel"] === "string" && ANALYSIS_CHANNELS.has(record["channel"]) &&
    typeof record["travel"] === "number" &&
    typeof record["signal_quality"] === "number" &&
    typeof record["motion_type"] === "string" &&
    isNumberArray(record["region"]) && record["region"].length === 4 &&
    isNumberArray(record["velocity"]) &&
    isNumberArray(record["progress"]) && record["progress"].length === (record["duration_frames"] as number) + 1
  );
}

export async function loadBeatCurves(path: string): Promise<BeatCurveFile> {
  const parsed: unknown = JSON.parse(await readFile(path, "utf8"));
  if (typeof parsed !== "object" || parsed === null) throw new Error(`${path}: expected an object`);
  const { fps, curves } = parsed as { fps?: unknown; curves?: unknown };
  if (typeof fps !== "number" || !Array.isArray(curves)) throw new Error(`${path}: expected { fps, curves[] }`);
  const invalidIndex = curves.findIndex((curve) => !isBeatCurve(curve));
  if (invalidIndex >= 0) throw new Error(`${path}: curve at index ${invalidIndex} does not match the BeatCurve shape`);
  return { fps, curves: curves as BeatCurve[] };
}

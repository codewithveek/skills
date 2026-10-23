/**
 * Fit every beat curve to Remotion spring() / Easing.bezier, cluster them into a preset library,
 * and write fitted-beats.json, preset-library.json, motion-presets.ts and fit-report.md.
 *
 *   npm run fit-presets -- --curves data/saas-launch/beat-curves.json --out-dir data/saas-launch/presets --source saas-launch \
 *     --export-name SAAS_LAUNCH --runtime-import ./preset
 */
import { parseArgs } from "node:util";
import { clusterPresets } from "./cluster-presets";
import { fitBeat } from "./fit-beat";
import { loadBeatCurves } from "./load-beat-curves";
import { writePresetOutputs } from "./write-outputs";

const DEFAULTS = { minQuality: 0.6, maxFitRmse: 0.06, maxShapeDistance: 0.05 } as const;

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      curves: { type: "string" },
      "out-dir": { type: "string" },
      source: { type: "string", default: "reference" },
      "min-quality": { type: "string", default: String(DEFAULTS.minQuality) },
      "max-fit-rmse": { type: "string", default: String(DEFAULTS.maxFitRmse) },
      "max-shape-distance": { type: "string", default: String(DEFAULTS.maxShapeDistance) },
      "export-name": { type: "string", default: "MOTION_PRESETS" },
      "runtime-import": { type: "string", default: "./motion-preset" },
    },
  });
  if (!values.curves || !values["out-dir"]) throw new Error("Usage: --curves <beat-curves.json> --out-dir <dir> [--source name]");
  const minQuality = Number(values["min-quality"]);
  const maxFitRmse = Number(values["max-fit-rmse"]);

  const { fps, curves } = await loadBeatCurves(values.curves);
  const startedAt = performance.now();
  const fittedBeats = curves.map((curve) => fitBeat(curve, fps));
  const accepted = fittedBeats.filter((beat) => beat.signalQuality >= minQuality && beat.best.progressRmse <= maxFitRmse);
  const clusters = clusterPresets({ fittedBeats: accepted, fps, maxShapeDistance: Number(values["max-shape-distance"]) });
  const written = await writePresetOutputs({
    outDir: values["out-dir"],
    sourceName: values.source ?? "reference",
    fittedBeats,
    acceptedBeatIds: new Set(accepted.map((beat) => beat.beatId)),
    clusters,
    exportName: values["export-name"] ?? "MOTION_PRESETS",
    runtimeImport: values["runtime-import"] ?? "./motion-preset",
  });
  console.log(`fitted ${fittedBeats.length} beats in ${((performance.now() - startedAt) / 1000).toFixed(1)}s`);
  console.log(`accepted ${accepted.length} (quality >= ${minQuality}, rmse <= ${maxFitRmse}) -> ${clusters.length} presets`);
  for (const file of written) console.log(`  ${file}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

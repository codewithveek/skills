"""Summarise one or more measured references: beat lengths, where speed peaks, overshoot, anticipation,
springs, how much of the video moves, and how long holds last. The numbers behind the cross-reference
table in references/motion-data.md.

    python3 analysis/summarize_reference.py data/saas-launch data/furniture-launch [--json out.json]

Each folder needs runs.csv, beat-curves.json and presets/fitted-beats.json. Beat lengths use every
fitted beat (a length doesn't depend on how cleanly the curve fitted); curve shapes (where speed peaks,
overshoot, anticipation, springs) use only the beats accepted into the library (the fitter's defaults:
signal quality >= 0.6, fit error <= 0.06), because a noisy curve gives a noisy shape.
"""
from __future__ import annotations

import argparse
import csv
import json
from dataclasses import asdict, dataclass
from pathlib import Path
from statistics import median

import numpy as np

MIN_QUALITY = 0.6
MAX_FIT_RMSE = 0.06
OVERSHOOT_MARGIN = 0.02  # progress beyond 1 + this counts as overshoot
ANTICIPATION_MARGIN = 0.02  # progress below 0 - this, before the move gets going, counts as anticipation


@dataclass
class ReferenceSummary:
    name: str
    beats_fitted: int
    beats_accepted: int
    median_beat_ms: float
    p25_beat_ms: float
    p75_beat_ms: float
    median_peak_position: float
    peak_in_first_third: float
    peak_in_middle_third: float
    overshoot_share: float
    anticipation_share: float
    spring_best_fits: int
    moving_share: float
    median_hold_ms: float


def peak_position(progress: list[float]) -> float:
    """Where speed peaks, as a fraction of the beat (0 = first frame, 1 = last)."""
    speed = np.abs(np.diff(np.asarray(progress, dtype=float)))
    return float(np.argmax(speed) / max(1, len(speed) - 1))


def anticipates(progress: list[float]) -> bool:
    early = progress[: max(2, len(progress) // 2)]
    return min(early) < -ANTICIPATION_MARGIN


def overshoots(progress: list[float]) -> bool:
    return max(progress) > 1 + OVERSHOOT_MARGIN


def summarize(folder: Path) -> ReferenceSummary:
    fitted = json.loads((folder / "presets" / "fitted-beats.json").read_text())
    curves = {curve["beat_id"]: curve for curve in json.loads((folder / "beat-curves.json").read_text())["curves"]}
    accepted = [beat for beat in fitted if beat["signalQuality"] >= MIN_QUALITY and beat["best"]["progressRmse"] <= MAX_FIT_RMSE]
    progresses = [curves[beat["beatId"]]["progress"] for beat in accepted]
    durations = [float(beat["durationMs"]) for beat in fitted]
    peaks = [peak_position(progress) for progress in progresses]
    with (folder / "runs.csv").open() as handle:
        runs = list(csv.DictReader(handle))
    total_frames = sum(int(run["frames"]) for run in runs)
    moving_frames = sum(int(run["frames"]) for run in runs if run["kind"] == "motion")
    holds = [float(run["duration_ms"]) for run in runs if run["kind"] == "hold"]
    count = max(1, len(accepted))
    return ReferenceSummary(
        name=folder.name,
        beats_fitted=len(fitted),
        beats_accepted=len(accepted),
        median_beat_ms=round(median(durations), 1) if durations else 0.0,
        p25_beat_ms=round(float(np.percentile(durations, 25)), 1) if durations else 0.0,
        p75_beat_ms=round(float(np.percentile(durations, 75)), 1) if durations else 0.0,
        median_peak_position=round(median(peaks), 3) if peaks else 0.0,
        peak_in_first_third=round(sum(1 for peak in peaks if peak < 1 / 3) / count, 3),
        peak_in_middle_third=round(sum(1 for peak in peaks if 1 / 3 <= peak <= 2 / 3) / count, 3),
        overshoot_share=round(sum(1 for progress in progresses if overshoots(progress)) / count, 3),
        anticipation_share=round(sum(1 for progress in progresses if anticipates(progress)) / count, 3),
        spring_best_fits=sum(1 for beat in accepted if beat["best"]["easing"]["kind"] == "spring"),
        moving_share=round(moving_frames / max(1, total_frames), 3),
        median_hold_ms=round(median(holds), 1) if holds else 0.0,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("folders", type=Path, nargs="+")
    parser.add_argument("--json", type=Path, help="also write the summaries here")
    options = parser.parse_args()
    summaries = [summarize(folder) for folder in options.folders]
    for summary in summaries:
        print(json.dumps(asdict(summary)))
    if options.json:
        options.json.write_text(json.dumps([asdict(summary) for summary in summaries], indent=1))


if __name__ == "__main__":
    main()

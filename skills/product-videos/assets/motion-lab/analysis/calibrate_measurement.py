"""Calibrate the measurement pipeline on renders whose true motion is known.

For each render with a sibling `.truth.json` (written by `npm run render-check`), analyse the render
exactly as the reference video was analysed and compare the measured progress curve with the true
one. If measurement is biased (e.g. optical flow lagging, smearing ease-outs into ease-ins), it shows
up here as high RMSE or a systematic duration/travel error.

  python3 analysis/calibrate_measurement.py renders/cal-*.mp4
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np

from analyze_motion import analyze_frames
from motion_curves import BeatRow, Channel, build_beat_curve, resample_progress
from score_render import active_window, probe_pts, probe_video

CHANNEL_FROM_PRESET: dict[str, Channel] = {
    "translateX": "translate_x", "translateY": "translate_y", "scale": "scale", "progress": "translate_x",
}


def calibrate(render: Path) -> dict[str, object]:
    truth = json.loads(render.with_suffix(".truth.json").read_text())
    fps, time_base = probe_video(render)
    frames = analyze_frames(render, probe_pts(render, time_base), fps, progress_every=0)
    detected_start, detected_end = active_window(frames)
    true_start = truth["beatStartFrame"] + 1  # first frame that differs from the held start frame
    true_end = truth["beatStartFrame"] + truth["durationInFrames"]
    channel = CHANNEL_FROM_PRESET[truth["preset"]["channel"]]
    measured = build_beat_curve(frames, BeatRow(-1, "calibration", true_start, true_end, ""), forced_channel=channel)
    true_progress = np.asarray(truth["progress"], dtype=float)
    measured_progress = np.asarray(measured.progress)
    rmse = float(np.sqrt(np.mean((resample_progress(true_progress) - resample_progress(measured_progress)) ** 2)))
    true_travel = truth["preset"]["travel"]
    return {
        "render": render.name,
        "easing": truth["preset"]["easing"],
        "channel": channel,
        "true_window": [true_start, true_end],
        "detected_window": [detected_start, detected_end],
        "window_error_frames": [detected_start - true_start, detected_end - true_end],
        "progress_rmse_vs_truth": round(rmse, 4),
        "max_abs_error": round(float(np.max(np.abs(resample_progress(true_progress) - resample_progress(measured_progress)))), 4),
        "true_travel": true_travel,
        "measured_travel": round(measured.travel, 2),
        "travel_ratio": round(measured.travel / true_travel, 4) if true_travel else None,
        "true_overshoot": round(float(true_progress.max() - 1), 4),
        "measured_overshoot": round(float(measured_progress.max() - 1), 4),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("renders", type=Path, nargs="+")
    parser.add_argument("--out", type=Path)
    options = parser.parse_args()
    results = [calibrate(render) for render in options.renders]
    for result in results:
        print(f"{result['render']:<40} rmse={result['progress_rmse_vs_truth']:<7} max={result['max_abs_error']:<7} "
              f"travel x{result['travel_ratio']}  window err {result['window_error_frames']}  "
              f"overshoot true/measured {result['true_overshoot']}/{result['measured_overshoot']}")
    if options.out:
        options.out.write_text(json.dumps(results, indent=1))


if __name__ == "__main__":
    main()

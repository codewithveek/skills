"""Score a rendered clip against a reference beat using the same motion analysis as the reference.

  python3 analysis/score_render.py --render out.mp4 --reference-curves data/saas-launch/beat-curves.json --beat-id 94

The render is analysed frame by frame (optical flow + pixel diff), its active motion window is found
(first to last moving frame, or --render-range), and its curve is built on the reference beat's
channel so the two are compared like for like. Prints and optionally writes a JSON report.
"""
from __future__ import annotations

import argparse
import json
import subprocess
from dataclasses import asdict
from fractions import Fraction
from pathlib import Path

from analyze_motion import MOTION_ON_PCT, FrameMetrics, analyze_frames
from motion_curves import BeatCurve, BeatRow, Channel, build_beat_curve, compare_curves

MIN_FLOW_PX = 0.5  # a frame counts as moving if its fastest pixels move at least this far (full-res px)


def probe_video(video: Path) -> tuple[float, float]:
    """Return (fps, time_base_seconds) of the first video stream."""
    output = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=avg_frame_rate,time_base",
         "-of", "json", str(video)], check=True, capture_output=True, text=True).stdout
    stream = json.loads(output)["streams"][0]
    return float(Fraction(stream["avg_frame_rate"])), float(Fraction(stream["time_base"]))


def probe_pts(video: Path, time_base: float) -> list[tuple[int, int]]:
    output = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "frame=best_effort_timestamp",
         "-of", "csv=p=0", str(video)], check=True, capture_output=True, text=True).stdout
    timestamps = [int(line.split(",")[0]) for line in output.splitlines() if line.strip()]
    return [(pts, round(pts * time_base * 1_000_000)) for pts in timestamps]


def load_reference_curve(curves_path: Path, beat_id: int) -> BeatCurve:
    data = json.loads(curves_path.read_text())
    for raw in data["curves"]:
        if raw["beat_id"] == beat_id:
            return BeatCurve(**{**raw, "region": tuple(raw["region"]), "velocity": tuple(raw["velocity"]),
                                "progress": tuple(raw["progress"])})
    raise SystemExit(f"beat {beat_id} not found in {curves_path}")


def active_window(frames: list[FrameMetrics]) -> tuple[int, int]:
    """First to last frame showing real motion: enough changed pixels, or coherent optical flow.

    The flow test catches slow ease-in starts and ease-out tails that move too little to change many
    pixels; cutting them shortens the measured duration and skews the curve. A looser pixel-change
    test can't be used instead, because H.264 keeps refining a held image for several frames after
    motion stops; that refinement changes pixels but produces no coherent flow.
    """
    moving = [f.frame for f in frames if f.frame > 0 and (f.changed_pct >= MOTION_ON_PCT or f.flow_p95_px >= MIN_FLOW_PX)]
    if not moving:
        raise SystemExit("render has no motion above threshold")
    return moving[0], moving[-1]


def resolve_render_window(render: Path, render_range: str | None, frames: list[FrameMetrics]) -> tuple[int, int, str]:
    """Which render frames hold the beat, best source first.

    1. --render-range, e.g. from the composition timeline (Cutroom knows where each beat starts).
    2. The `.truth.json` written by `npm run render-check` (exact by construction).
    3. Auto-detection, which can miss sub-pixel motion at the very start or end of slow easings.
    """
    if render_range:
        start, end = (int(value) for value in render_range.split(":"))
        return start, end, "render-range"
    truth_path = render.with_suffix(".truth.json")
    if truth_path.exists():
        truth = json.loads(truth_path.read_text())
        return truth["beatStartFrame"] + 1, truth["beatStartFrame"] + truth["durationInFrames"], "truth.json"
    start, end = active_window(frames)
    return start, end, "auto-detected"


def score_render(options: argparse.Namespace) -> dict[str, object]:
    reference = load_reference_curve(options.reference_curves, options.beat_id)
    fps, time_base = probe_video(options.render)
    frames = analyze_frames(options.render, probe_pts(options.render, time_base), fps, progress_every=0)
    start, end, window_source = resolve_render_window(options.render, options.render_range, frames)
    channel: Channel = reference.channel
    candidate = build_beat_curve(frames, BeatRow(beat_id=-1, scene="render", start_frame=start, end_frame=end,
                                                 motion_type=reference.motion_type), forced_channel=channel)
    comparison = compare_curves(reference, candidate)
    return {
        "render": str(options.render), "render_fps": fps, "render_window": [start, end], "window_source": window_source,
        "reference_beat": reference.beat_id, "channel": channel,
        "reference": {"duration_frames": reference.duration_frames, "travel": round(reference.travel, 2)},
        "candidate": {"duration_frames": candidate.duration_frames, "travel": round(candidate.travel, 2),
                      "progress": [round(p, 4) for p in candidate.progress]},
        **asdict(comparison),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--render", type=Path, required=True)
    parser.add_argument("--reference-curves", type=Path, required=True)
    parser.add_argument("--beat-id", type=int, required=True)
    parser.add_argument("--render-range", help="start:end frame indices in the render (default: auto-detect)")
    parser.add_argument("--out", type=Path, help="write the JSON report here")
    options = parser.parse_args()
    report = score_render(options)
    if options.out:
        options.out.write_text(json.dumps(report, indent=1))
    summary = {k: report[k] for k in ("reference_beat", "channel", "render_window", "window_source", "score", "score_breakdown",
                                      "progress_rmse", "duration_ratio", "travel_ratio", "direction_match",
                                      "reference_overshoot", "candidate_overshoot")}
    print(json.dumps(summary, indent=1))


if __name__ == "__main__":
    main()

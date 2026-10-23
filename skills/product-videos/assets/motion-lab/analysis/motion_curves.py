"""Per-beat motion curves: the shared representation used by the preset fitter and the render scorer.

A beat covering frames [start, end] has N = end - start + 1 frame intervals (each row of frames.csv
holds the motion from the previous frame into that frame). Its curve is:

  velocity[i]  signed change of the chosen channel during interval i (i = 0..N-1)
  progress[k]  cumulative velocity / total travel, k = 0..N, so progress[0] = 0 and progress[N] = 1.
               Values above 1 mid-curve are overshoot; below 0 is anticipation.

Channels:
  translate_x / translate_y   mean optical flow of the dominant element's core pixels along that axis (px per frame)
  scale                       affine scale change of moving pixels (% per frame)
  speed                       unsigned p95 flow (px per frame); used when no single signed channel
                              explains the beat (several elements moving, typing, shimmer)
"""
from __future__ import annotations

import csv
import math
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Literal

import numpy as np

from analyze_motion import FrameMetrics

Channel = Literal["translate_x", "translate_y", "scale", "speed"]
CHANNEL_UNITS: dict[Channel, str] = {"translate_x": "px", "translate_y": "px", "scale": "pct", "speed": "px"}

MIN_DIRECTIONAL_CONSISTENCY = 0.6  # |net travel| / total path; below this a signed channel is noise
RESAMPLE_POINTS = 101
SPEED_SIGNAL_FLOOR_PX = 8.0  # beats whose fastest element peaks below this are low-signal
UNSIGNED_CHANNEL_PENALTY = 0.5
# Measured / true travel on known Remotion renders (analysis/calibrate_measurement.py, 7 clips):
# translate 0.935-0.958 (mean 0.948), scale 0.915. Travel is divided by this so presets replay at the
# reference size. Progress curves are unaffected (they are normalised).
TRAVEL_CALIBRATION_GAIN: dict[str, float] = {"translate_x": 0.948, "translate_y": 0.948, "scale": 0.915, "speed": 1.0}


@dataclass(frozen=True)
class BeatCurve:
    beat_id: int
    scene: str
    start_frame: int
    end_frame: int
    duration_frames: int
    channel: Channel
    unit: str
    travel: float
    peak_speed: float
    directional_consistency: float
    signal_quality: float
    motion_type: str
    region: tuple[int, int, int, int]  # union of motion boxes over the beat: x, y, w, h (full-res px)
    velocity: tuple[float, ...]
    progress: tuple[float, ...]

    def to_json(self) -> dict[str, object]:
        data = asdict(self)
        data["velocity"] = [round(v, 4) for v in self.velocity]
        data["progress"] = [round(p, 5) for p in self.progress]
        return data


@dataclass(frozen=True)
class BeatRow:
    beat_id: int
    scene: str
    start_frame: int
    end_frame: int
    motion_type: str


@dataclass(frozen=True)
class CurveComparison:
    progress_rmse: float
    duration_ratio: float
    travel_ratio: float
    direction_match: bool
    peak_time_error: float
    reference_overshoot: float
    candidate_overshoot: float
    score: float
    score_breakdown: dict[str, float]


def channel_series(frames: list[FrameMetrics], channel: Channel) -> list[float]:
    readers = {
        "translate_x": lambda f: f.core_dx_px,
        "translate_y": lambda f: f.core_dy_px,
        "scale": lambda f: f.affine_scale_pct,
        "speed": lambda f: f.flow_p95_px,
    }
    return [float(readers[channel](f)) for f in frames]


def scale_rates_to_velocity(rates_pct: list[float]) -> list[float]:
    """Per-frame scale rates are relative to the current size; convert to change in % of the start size.

    Summing raw rates over-weights late frames of a shrink (and under-weights a grow), because each
    rate is measured against an already-changed size. Compounding fixes that.
    """
    size = 1.0
    velocity: list[float] = []
    for rate in rates_pct:
        next_size = size * (1 + rate / 100)
        velocity.append((next_size - size) * 100)
        size = next_size
    return velocity


def directional_consistency(values: list[float]) -> float:
    path_length = sum(abs(v) for v in values)
    return abs(sum(values)) / path_length if path_length > 0 else 0.0


def choose_channel(window: list[FrameMetrics], motion_type: str) -> Channel:
    """Pick the signed channel that best explains the beat; fall back to unsigned speed."""
    if motion_type.startswith("scale"):
        preferred: list[Channel] = ["scale", "translate_x", "translate_y"]
    elif motion_type.startswith("slide-left") or motion_type.startswith("slide-right"):
        preferred = ["translate_x", "translate_y"]
    elif motion_type.startswith("slide-up") or motion_type.startswith("slide-down"):
        preferred = ["translate_y", "translate_x"]
    else:
        net_x = abs(sum(channel_series(window, "translate_x")))
        net_y = abs(sum(channel_series(window, "translate_y")))
        preferred = ["translate_x", "translate_y"] if net_x >= net_y else ["translate_y", "translate_x"]
    for channel in preferred:
        if directional_consistency(channel_series(window, channel)) >= MIN_DIRECTIONAL_CONSISTENCY:
            return channel
    return "speed"


def progress_from_velocity(velocity: list[float]) -> list[float]:
    travel = sum(velocity)
    if abs(travel) < 1e-9:
        return [0.0] * (len(velocity) + 1)
    cumulative = np.concatenate([[0.0], np.cumsum(velocity)])
    return [float(v) for v in cumulative / travel]


def union_region(window: list[FrameMetrics]) -> tuple[int, int, int, int]:
    boxes = [(f.motion_bbox_x, f.motion_bbox_y, f.motion_bbox_w, f.motion_bbox_h) for f in window if f.motion_bbox_w > 0]
    if not boxes:
        return (0, 0, 0, 0)
    left = min(b[0] for b in boxes)
    top = min(b[1] for b in boxes)
    right = max(b[0] + b[2] for b in boxes)
    bottom = max(b[1] + b[3] for b in boxes)
    return (left, top, right - left, bottom - top)


def build_beat_curve(frames: list[FrameMetrics], beat: BeatRow, forced_channel: Channel | None = None) -> BeatCurve:
    window = frames[beat.start_frame:beat.end_frame + 1]
    channel = forced_channel or choose_channel(window, beat.motion_type)
    velocity = channel_series(window, channel)
    if channel == "scale":
        velocity = scale_rates_to_velocity(velocity)
    peak_speed = max(f.flow_p95_px for f in window)
    consistency = directional_consistency(velocity)
    if channel == "speed":
        consistency *= UNSIGNED_CHANNEL_PENALTY  # unsigned speed is always "consistent"; it carries less evidence
    strength = min(1.0, peak_speed / SPEED_SIGNAL_FLOOR_PX)
    return BeatCurve(
        beat_id=beat.beat_id, scene=beat.scene, start_frame=beat.start_frame, end_frame=beat.end_frame,
        duration_frames=len(window), channel=channel, unit=CHANNEL_UNITS[channel],
        travel=float(sum(velocity)) / TRAVEL_CALIBRATION_GAIN[channel], peak_speed=float(peak_speed),
        directional_consistency=round(consistency, 4),
        signal_quality=round(consistency * strength, 4),
        motion_type=beat.motion_type, region=union_region(window),
        velocity=tuple(velocity), progress=tuple(progress_from_velocity(velocity)),
    )


def load_beat_rows(beats_csv: Path) -> list[BeatRow]:
    """Motion beats from beats.csv; beat_id is the row index so it stays stable across tools."""
    with beats_csv.open() as handle:
        return [
            BeatRow(beat_id=row_index, scene=row["scene"], start_frame=int(row["start_frame"]),
                    end_frame=int(row["end_frame"]), motion_type=row["motion_type"])
            for row_index, row in enumerate(csv.DictReader(handle))
            if row["kind"] == "motion"
        ]


def resample_progress(progress: tuple[float, ...] | list[float], points: int = RESAMPLE_POINTS) -> np.ndarray:
    source_times = np.linspace(0.0, 1.0, len(progress))
    return np.interp(np.linspace(0.0, 1.0, points), source_times, np.asarray(progress))


def peak_time(velocity: tuple[float, ...]) -> float:
    magnitudes = np.abs(np.asarray(velocity))
    return float(np.argmax(magnitudes) / max(1, len(magnitudes) - 1))


def compare_curves(reference: BeatCurve, candidate: BeatCurve) -> CurveComparison:
    """Score how closely a candidate beat reproduces a reference beat (0-100).

    Weights: curve shape 50, duration 20, travel distance 15, direction 15. Shape uses RMSE between
    the progress curves on normalised time (0.15 RMSE or worse scores 0). Duration and travel use
    log ratios, so twice or half as long/far scores 0.
    """
    rmse = float(np.sqrt(np.mean((resample_progress(reference.progress) - resample_progress(candidate.progress)) ** 2)))
    duration_ratio = candidate.duration_frames / reference.duration_frames
    travel_ratio = candidate.travel / reference.travel if abs(reference.travel) > 1e-9 else 0.0
    direction_match = reference.channel == "speed" or math.copysign(1, reference.travel) == math.copysign(1, candidate.travel)
    breakdown = {
        "shape": 50 * max(0.0, 1 - rmse / 0.15),
        "duration": 20 * max(0.0, 1 - abs(math.log(duration_ratio)) / math.log(2)),
        "travel": 15 * (max(0.0, 1 - abs(math.log(abs(travel_ratio))) / math.log(2)) if travel_ratio != 0 else 0.0),
        "direction": 15.0 if direction_match else 0.0,
    }
    return CurveComparison(
        progress_rmse=round(rmse, 4), duration_ratio=round(duration_ratio, 4), travel_ratio=round(travel_ratio, 4),
        direction_match=direction_match,
        peak_time_error=round(abs(peak_time(reference.velocity) - peak_time(candidate.velocity)), 4),
        reference_overshoot=round(max(reference.progress) - 1, 4),
        candidate_overshoot=round(max(candidate.progress) - 1, 4),
        score=round(sum(breakdown.values()), 1),
        score_breakdown={key: round(value, 1) for key, value in breakdown.items()},
    )

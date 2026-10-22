"""Per-frame motion analysis for a constant-frame-rate video.

Outputs (in --out-dir):
  frames.csv      one row per native frame: timing + pixel-diff + optical-flow metrics
  runs.csv        contiguous hold / motion runs
  beats.csv       motion runs split into single animation beats, with heuristic type and easing labels
  scenes.csv      storyboard scene ranges snapped to the calmest nearby frame (--storyboard)
  manifest.json   everything above plus video metadata, for programmatic use

--storyboard is an optional JSON list of approximate scene starts, e.g.
  [{"start_s": 0, "label": "hook"}, {"start_s": 3.5, "label": "problem"}]
Each start is moved to the calmest frame within SNAP_WINDOW_MS. Without it the video is one scene.
"""
from __future__ import annotations

import argparse
import csv
import json
import subprocess
from dataclasses import asdict, dataclass, field
from fractions import Fraction
from pathlib import Path

import cv2
import numpy as np

FLOW_WIDTH = 480  # optical flow computed at this width, vectors rescaled to full resolution
CORE_FLOW_FRACTION = 0.5  # core-flow pixels: magnitude >= this fraction of the p95 magnitude
DIFF_THRESHOLD = 8  # luma delta (0-255) counted as a "changed" pixel
MOTION_ON_PCT = 0.05  # % of pixels changed for a frame to count as moving
# Time thresholds are in milliseconds and converted with the video's frame rate, so a 30 fps reference
# is cut into runs and beats the same way as a 60 fps one (at 60 fps: 4, 6 and 20 frames).
MIN_HOLD_MS = 66.667  # holds shorter than this are merged into surrounding motion
MIN_BEAT_MS = 100.0  # a beat is never split into pieces shorter than this
SNAP_WINDOW_MS = 333.333  # how far a storyboard scene start may move to the calmest frame


def frames_for(milliseconds: float, fps: float) -> int:
    """Whole frames covering a duration at this frame rate (at least one)."""
    return max(1, round(milliseconds * fps / 1000))


@dataclass
class FrameMetrics:
    frame: int
    pts: int
    time_ms: float
    timecode: str
    scene: str = ""
    mean_abs_diff: float = 0.0
    changed_pct: float = 0.0
    motion_bbox_x: int = -1
    motion_bbox_y: int = -1
    motion_bbox_w: int = 0
    motion_bbox_h: int = 0
    flow_mean_px: float = 0.0
    flow_p95_px: float = 0.0
    flow_dx_px: float = 0.0
    flow_dy_px: float = 0.0
    flow_divergence: float = 0.0
    flow_curl: float = 0.0
    core_dx_px: float = 0.0
    core_dy_px: float = 0.0
    affine_scale_pct: float = 0.0
    affine_rotation_deg: float = 0.0
    affine_fit_residual_px: float = 0.0
    luma_mean: float = 0.0
    rgb_mean_r: float = 0.0
    rgb_mean_g: float = 0.0
    rgb_mean_b: float = 0.0


@dataclass
class Segment:
    kind: str  # "hold" or "motion"
    start_frame: int
    end_frame: int
    start_ms: float
    end_ms: float
    duration_ms: float
    frames: int
    scene: str
    parent_run: int = -1  # index of the hold/motion run this beat was split from
    peak_changed_pct: float = 0.0
    peak_flow_px: float = 0.0
    mean_dx_px: float = 0.0
    mean_dy_px: float = 0.0
    mean_divergence: float = 0.0
    mean_curl: float = 0.0
    mean_scale_pct_per_frame: float = 0.0
    mean_rotation_deg_per_frame: float = 0.0
    transform_fit_confidence: float = 0.0  # 1 = one move/scale/rotate explains all motion; 0 = many independent elements
    motion_type: str = ""
    easing: str = ""
    velocity_profile: list[float] = field(default_factory=list)


def format_timecode(time_ms: float, fps: float) -> str:
    total_frames = round(time_ms / 1000 * fps)
    seconds_total, frame_in_second = divmod(total_frames, round(fps))
    minutes, seconds = divmod(seconds_total, 60)
    return f"{minutes:02d}:{seconds:02d}:{frame_in_second:02d}"


AFFINE_SAMPLE_POINTS = 20_000


def fit_affine_to_flow(horizontal: np.ndarray, vertical: np.ndarray, moving_mask: np.ndarray) -> dict[str, float]:
    """Least-squares affine fit of the moving pixels' flow: u = a11*x + a12*y + tx, v = a21*x + a22*y + ty.

    Coordinates are centred on the frame, so scale/rotation are about the frame centre. Rates are
    per frame and independent of resolution.
    """
    rows, cols = np.nonzero(moving_mask)
    if rows.size < 50:
        return {"affine_scale_pct": 0.0, "affine_rotation_deg": 0.0, "affine_fit_residual_px": 0.0}
    if rows.size > AFFINE_SAMPLE_POINTS:
        pick = np.random.default_rng(0).choice(rows.size, AFFINE_SAMPLE_POINTS, replace=False)
        rows, cols = rows[pick], cols[pick]
    height, width = moving_mask.shape
    centred_x, centred_y = cols - width / 2, rows - height / 2
    design = np.column_stack([centred_x, centred_y, np.ones_like(centred_x)])
    u_target, v_target = horizontal[rows, cols], vertical[rows, cols]
    u_coeffs = np.linalg.lstsq(design, u_target, rcond=None)[0]
    v_coeffs = np.linalg.lstsq(design, v_target, rcond=None)[0]
    a11, a12, a21, a22 = u_coeffs[0], u_coeffs[1], v_coeffs[0], v_coeffs[1]
    residual = np.hypot(design @ u_coeffs - u_target, design @ v_coeffs - v_target).mean()
    return {
        "affine_scale_pct": float(100 * (a11 + a22) / 2),
        "affine_rotation_deg": float(np.degrees((a21 - a12) / 2)),
        "affine_fit_residual_px": float(residual),
    }


def compute_flow_metrics(previous_small: np.ndarray, current_small: np.ndarray, scale: float) -> dict[str, float]:
    flow = cv2.calcOpticalFlowFarneback(
        previous_small, current_small, None,
        pyr_scale=0.5, levels=4, winsize=21, iterations=3, poly_n=7, poly_sigma=1.5, flags=0,
    )
    horizontal, vertical = flow[..., 0], flow[..., 1]
    magnitude = np.hypot(horizontal, vertical)
    moving_mask = magnitude > 0.25
    if not moving_mask.any():
        return {"flow_mean_px": 0.0, "flow_p95_px": 0.0, "flow_dx_px": 0.0, "flow_dy_px": 0.0,
                "core_dx_px": 0.0, "core_dy_px": 0.0, "flow_divergence": 0.0, "flow_curl": 0.0}
    d_horizontal_dy, d_horizontal_dx = np.gradient(horizontal)
    d_vertical_dy, d_vertical_dx = np.gradient(vertical)
    divergence = (d_horizontal_dx + d_vertical_dy)[moving_mask]
    curl = (d_vertical_dx - d_horizontal_dy)[moving_mask]
    # "Core" = pixels moving at least half as fast as the fastest 5%: the dominant element itself,
    # without the low-flow halo optical flow spreads around it (which biases plain means and fits low).
    core_mask = moving_mask & (magnitude >= CORE_FLOW_FRACTION * np.percentile(magnitude[moving_mask], 95))
    affine = fit_affine_to_flow(horizontal, vertical, core_mask)
    affine["affine_fit_residual_px"] *= scale  # report in full-res px like the other flow columns
    return {
        **affine,
        "core_dx_px": float(horizontal[core_mask].mean() * scale),
        "core_dy_px": float(vertical[core_mask].mean() * scale),
        "flow_mean_px": float(magnitude[moving_mask].mean() * scale),
        "flow_p95_px": float(np.percentile(magnitude[moving_mask], 95) * scale),
        "flow_dx_px": float(horizontal[moving_mask].mean() * scale),
        "flow_dy_px": float(vertical[moving_mask].mean() * scale),
        "flow_divergence": float(divergence.mean()),
        "flow_curl": float(curl.mean()),
    }


def compute_diff_metrics(previous_gray: np.ndarray, current_gray: np.ndarray) -> dict[str, float | int]:
    abs_diff = cv2.absdiff(previous_gray, current_gray)
    changed_mask = abs_diff > DIFF_THRESHOLD
    changed_count = int(changed_mask.sum())
    metrics: dict[str, float | int] = {
        "mean_abs_diff": float(abs_diff.mean()),
        "changed_pct": 100.0 * changed_count / changed_mask.size,
    }
    if changed_count:
        x, y, width, height = cv2.boundingRect(changed_mask.astype(np.uint8))
        metrics.update(motion_bbox_x=x, motion_bbox_y=y, motion_bbox_w=width, motion_bbox_h=height)
    return metrics


def analyze_frames(video_path: Path, pts_rows: list[tuple[int, int]], fps: float, progress_every: int = 500) -> list[FrameMetrics]:
    capture = cv2.VideoCapture(str(video_path))
    previous_gray: np.ndarray | None = None
    previous_small: np.ndarray | None = None
    results: list[FrameMetrics] = []
    for frame_index, (pts, _) in enumerate(pts_rows):
        ok, frame_bgr = capture.read()
        if not ok:
            raise RuntimeError(f"Decode stopped at frame {frame_index}")
        gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
        scale = gray.shape[1] / FLOW_WIDTH
        small = cv2.resize(gray, (FLOW_WIDTH, round(gray.shape[0] / scale)), interpolation=cv2.INTER_AREA)
        time_ms = pts_rows[frame_index][1] / 1000.0
        metrics = FrameMetrics(frame=frame_index, pts=pts, time_ms=round(time_ms, 3),
                               timecode=format_timecode(time_ms, fps))
        blue_mean, green_mean, red_mean = (float(v) for v in frame_bgr.reshape(-1, 3).mean(axis=0))
        metrics.luma_mean, metrics.rgb_mean_r, metrics.rgb_mean_g, metrics.rgb_mean_b = (
            float(gray.mean()), red_mean, green_mean, blue_mean)
        if previous_gray is not None and previous_small is not None:
            for key, value in {**compute_diff_metrics(previous_gray, gray),
                               **compute_flow_metrics(previous_small, small, scale)}.items():
                setattr(metrics, key, value)
        results.append(metrics)
        previous_gray, previous_small = gray, small
        if progress_every and frame_index % progress_every == 0:
            print(f"analysed {frame_index}/{len(pts_rows)}", flush=True)
    capture.release()
    return results


def load_storyboard(path: Path | None) -> list[tuple[float, str]]:
    if path is None:
        return [(0.0, "video")]
    entries = json.loads(path.read_text())
    return sorted((float(entry["start_s"]), str(entry["label"])) for entry in entries)


def snap_scene_starts(frames: list[FrameMetrics], storyboard: list[tuple[float, str]], fps: float) -> list[tuple[int, str]]:
    snapped: list[tuple[int, str]] = []
    for start_seconds, label in storyboard:
        guess = round(start_seconds * fps)
        if guess >= len(frames):
            break
        if guess == 0:
            snapped.append((0, label))
            continue
        window = frames_for(SNAP_WINDOW_MS, fps)
        low, high = max(1, guess - window), min(len(frames) - 1, guess + window)
        calmest = min(range(low, high + 1), key=lambda i: (frames[i].changed_pct, abs(i - guess)))
        snapped.append((calmest, label))
    return snapped


def classify_motion(segment: Segment, frames: list[FrameMetrics]) -> str:
    window = frames[segment.start_frame:segment.end_frame + 1]
    if segment.frames <= 2 and segment.peak_changed_pct > 40:
        return "cut"
    luma_change = abs(window[-1].luma_mean - window[0].luma_mean)
    if segment.peak_flow_px < 1.0 and segment.peak_changed_pct > 5:
        return "fade/crossfade" if luma_change > 3 else "dissolve/reveal"
    # Compare components as pixel displacement per frame at a typical radius of the moving region.
    moving_boxes = [f for f in window if f.motion_bbox_w > 0]
    radius = 0.25 * float(np.mean([np.hypot(f.motion_bbox_w, f.motion_bbox_h) for f in moving_boxes])) if moving_boxes else 0.0
    horizontal, vertical = abs(segment.mean_dx_px), abs(segment.mean_dy_px)
    components = {
        "translate": float(np.hypot(horizontal, vertical)),
        "scale": abs(segment.mean_scale_pct_per_frame) / 100 * radius,
        "rotate": np.radians(abs(segment.mean_rotation_deg_per_frame)) * radius,
    }
    # Scale/rotation are only trusted when a single transform explains the motion well.
    if segment.transform_fit_confidence < MIN_SCALE_CONFIDENCE:
        components["scale"] = 0.0
    if segment.transform_fit_confidence < MIN_ROTATION_CONFIDENCE:
        components["rotate"] = 0.0
    dominant = max(components, key=lambda name: components[name])
    if components[dominant] < 0.5:
        if segment.transform_fit_confidence < MIN_SCALE_CONFIDENCE and segment.peak_flow_px > 5:
            return "compound (multiple independent elements)"
        return "local/in-place (typing, pop, morph)"
    if dominant == "rotate":
        return "rotate-clockwise" if segment.mean_rotation_deg_per_frame > 0 else "rotate-counter-clockwise"
    if dominant == "scale":
        return "scale-up/zoom-in" if segment.mean_scale_pct_per_frame > 0 else "scale-down/zoom-out"
    if horizontal > 2 * vertical:
        return "slide-right" if segment.mean_dx_px > 0 else "slide-left"
    if vertical > 2 * horizontal:
        return "slide-down/scroll-up" if segment.mean_dy_px > 0 else "slide-up/scroll-down"
    return "diagonal/compound"


def classify_easing(velocity: list[float], directions: list[float]) -> str:
    if len(velocity) < 5 or max(velocity) <= 0:
        return "too-short"
    profile = np.asarray(median_smooth(velocity)) / max(velocity)
    peak_position = int(np.argmax(profile)) / (len(profile) - 1)
    reversals = count_direction_reversals(directions)
    if reversals >= 2:
        return "spring/oscillating"
    if reversals == 1 and peak_position < 0.7:
        return "overshoot/back"
    if profile.std() < 0.15:
        return "linear"
    if peak_position < 0.3:
        return "ease-out (fast start)"
    if peak_position > 0.7:
        return "ease-in (fast end)"
    return "ease-in-out"


MIN_SCALE_CONFIDENCE = 0.5
MIN_ROTATION_CONFIDENCE = 0.8
BEAT_VALLEY_RATIO = 0.35  # split where speed falls below this fraction of both neighbouring peaks
BEAT_MIN_PEAK_PX = 2.0


def median_smooth(values: list[float], radius: int = 1) -> list[float]:
    return [float(np.median(values[max(0, i - radius):i + radius + 1])) for i in range(len(values))]


def split_into_beats(frames: list[FrameMetrics], start: int, end: int, fps: float) -> list[tuple[int, int]]:
    """Recursively split [start, end] at deep speed valleys so each piece is one animation beat."""
    speed = median_smooth([f.flow_p95_px for f in frames[start:end + 1]])
    min_beat_frames = frames_for(MIN_BEAT_MS, fps)

    def split(low: int, high: int) -> list[tuple[int, int]]:
        if high - low + 1 < 2 * min_beat_frames:
            return [(low, high)]
        best_index, best_ratio = -1, 1.0
        for index in range(low + min_beat_frames, high - min_beat_frames + 2):
            left_peak = max(speed[low - start:index - start])
            right_peak = max(speed[index - start:high - start + 1])
            smaller_peak = min(left_peak, right_peak)
            if smaller_peak < BEAT_MIN_PEAK_PX:
                continue
            ratio = speed[index - start] / smaller_peak
            if ratio < best_ratio:
                best_index, best_ratio = index, ratio
        if best_index < 0 or best_ratio >= BEAT_VALLEY_RATIO:
            return [(low, high)]
        return split(low, best_index - 1) + split(best_index, high)

    return split(start, end)


def count_direction_reversals(directions: list[float], min_magnitude: float = 0.5) -> int:
    """Count sign flips of a smoothed direction signal that persist for at least two frames."""
    smoothed = median_smooth(directions)
    signs = [0 if abs(v) < min_magnitude else (1 if v > 0 else -1) for v in smoothed]
    stable: list[int] = []
    for index, sign in enumerate(signs):
        if sign != 0 and index + 1 < len(signs) and signs[index + 1] == sign:
            if not stable or stable[-1] != sign:
                stable.append(sign)
    return max(0, len(stable) - 1)


def describe_motion(segment: Segment, frames: list[FrameMetrics]) -> None:
    window = frames[segment.start_frame:segment.end_frame + 1]
    segment.peak_changed_pct = round(max(f.changed_pct for f in window), 3)
    segment.peak_flow_px = round(max(f.flow_p95_px for f in window), 3)
    weights = np.array([f.changed_pct for f in window]) + 1e-6
    segment.mean_dx_px = round(float(np.average([f.flow_dx_px for f in window], weights=weights)), 3)
    segment.mean_dy_px = round(float(np.average([f.flow_dy_px for f in window], weights=weights)), 3)
    segment.mean_divergence = round(float(np.average([f.flow_divergence for f in window], weights=weights)), 4)
    segment.mean_curl = round(float(np.average([f.flow_curl for f in window], weights=weights)), 4)
    segment.mean_scale_pct_per_frame = round(float(np.average([f.affine_scale_pct for f in window], weights=weights)), 4)
    segment.mean_rotation_deg_per_frame = round(float(np.average([f.affine_rotation_deg for f in window], weights=weights)), 4)
    flowing = [f for f in window if f.flow_mean_px > 0]
    if flowing:
        mean_residual = float(np.mean([f.affine_fit_residual_px for f in flowing]))
        mean_speed = float(np.mean([f.flow_mean_px for f in flowing]))
        segment.transform_fit_confidence = round(max(0.0, 1 - mean_residual / mean_speed), 3)
    segment.velocity_profile = [round(f.flow_p95_px if f.flow_p95_px > 0 else f.mean_abs_diff, 3) for f in window]
    dominant_axis = "flow_dx_px" if abs(segment.mean_dx_px) >= abs(segment.mean_dy_px) else "flow_dy_px"
    segment.motion_type = classify_motion(segment, frames)
    segment.easing = classify_easing(segment.velocity_profile, [getattr(f, dominant_axis) for f in window])


def build_beats(frames: list[FrameMetrics], runs: list[Segment], fps: float) -> list[Segment]:
    beats: list[Segment] = []
    for run_number, run in enumerate(runs):
        pieces = [(run.start_frame, run.end_frame)] if run.kind == "hold" else split_into_beats(frames, run.start_frame, run.end_frame, fps)
        for start, end in pieces:
            window = frames[start:end + 1]
            beat = Segment(
                kind=run.kind, start_frame=start, end_frame=end,
                start_ms=window[0].time_ms, end_ms=window[-1].time_ms,
                duration_ms=round(window[-1].time_ms - window[0].time_ms + 1000 / fps, 3),
                frames=len(window), scene=window[0].scene, parent_run=run_number,
            )
            if beat.kind == "motion":
                describe_motion(beat, frames)
            beats.append(beat)
    return beats


def build_segments(frames: list[FrameMetrics], fps: float) -> list[Segment]:
    moving = [f.frame > 0 and f.changed_pct >= MOTION_ON_PCT for f in frames]
    min_hold_frames = frames_for(MIN_HOLD_MS, fps)
    # Merge short holds into motion so a single still frame mid-animation does not split it.
    run_start = 0
    for index in range(1, len(moving) + 1):
        if index == len(moving) or moving[index] != moving[run_start]:
            if not moving[run_start] and index - run_start < min_hold_frames and run_start > 0 and index < len(moving):
                for j in range(run_start, index):
                    moving[j] = True
            run_start = index
    segments: list[Segment] = []
    run_start = 0
    for index in range(1, len(moving) + 1):
        if index < len(moving) and moving[index] == moving[run_start]:
            continue
        window = frames[run_start:index]
        segment = Segment(
            kind="motion" if moving[run_start] else "hold",
            start_frame=run_start, end_frame=index - 1,
            start_ms=window[0].time_ms, end_ms=window[-1].time_ms,
            duration_ms=round(window[-1].time_ms - window[0].time_ms + 1000 / fps, 3),
            frames=len(window), scene=window[0].scene,
        )
        segment.parent_run = len(segments)
        if segment.kind == "motion":
            describe_motion(segment, frames)
        segments.append(segment)
        run_start = index
    return segments


def read_pts(pts_csv: Path, time_base: float) -> list[tuple[int, int]]:
    """Return (pts, time_us) per frame from `ffprobe -show_entries frame=key_frame,best_effort_timestamp,...` CSV."""
    rows: list[tuple[int, int]] = []
    with pts_csv.open() as handle:
        for row in csv.reader(handle):
            pts = int(row[1])
            rows.append((pts, round(pts * time_base * 1_000_000)))
    return rows


def probe_stream(video: Path) -> tuple[float, float]:
    """(fps, seconds per pts tick) of the first video stream, from ffprobe."""
    output = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=avg_frame_rate,time_base",
         "-of", "json", str(video)], check=True, capture_output=True, text=True).stdout
    stream = json.loads(output)["streams"][0]
    return float(Fraction(stream["avg_frame_rate"])), float(Fraction(stream["time_base"]))


def load_frames_csv(path: Path) -> list[FrameMetrics]:
    converters = {"int": int, "float": float, "str": str}
    field_types = {name: converters[str(spec.type)] for name, spec in FrameMetrics.__dataclass_fields__.items()}
    with path.open() as handle:
        return [FrameMetrics(**{key: field_types[key](value) for key, value in row.items()}) for row in csv.DictReader(handle)]


def write_csv(path: Path, rows: list[dict[str, object]]) -> None:
    with path.open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--video", type=Path, required=True)
    parser.add_argument("--pts-csv", type=Path, required=True)
    parser.add_argument("--out-dir", type=Path, required=True)
    parser.add_argument("--fps", type=float, help="override; read from the video by default")
    parser.add_argument("--time-base", type=float, help="seconds per pts tick; read from the video by default")
    parser.add_argument("--storyboard", type=Path, help="JSON list of {start_s, label} approximate scene starts")
    parser.add_argument("--from-frames-csv", type=Path,
                        help="skip decoding; rebuild scenes/runs/beats from a previous frames.csv")
    options = parser.parse_args()
    options.out_dir.mkdir(parents=True, exist_ok=True)
    probed_fps, probed_time_base = probe_stream(options.video)
    options.fps = options.fps or probed_fps
    options.time_base = options.time_base or probed_time_base

    if options.from_frames_csv:
        frames = load_frames_csv(options.from_frames_csv)
    else:
        pts_rows = read_pts(options.pts_csv, options.time_base)
        frames = analyze_frames(options.video, pts_rows, options.fps)

    scene_starts = snap_scene_starts(frames, load_storyboard(options.storyboard), options.fps)
    scene_rows: list[dict[str, object]] = []
    for position, (start_frame, label) in enumerate(scene_starts):
        end_frame = scene_starts[position + 1][0] - 1 if position + 1 < len(scene_starts) else len(frames) - 1
        for frame in frames[start_frame:end_frame + 1]:
            frame.scene = f"{position + 1:02d}-{label}"
        scene_rows.append({
            "scene": f"{position + 1:02d}-{label}", "start_frame": start_frame, "end_frame": end_frame,
            "start_ms": frames[start_frame].time_ms, "end_ms": frames[end_frame].time_ms,
            "frames": end_frame - start_frame + 1,
        })

    runs = build_segments(frames, options.fps)
    beats = build_beats(frames, runs, options.fps)

    def segment_rows(segments: list[Segment]) -> list[dict[str, object]]:
        return [{**asdict(s), "velocity_profile": " ".join(map(str, s.velocity_profile))} for s in segments]

    write_csv(options.out_dir / "frames.csv", [asdict(f) for f in frames])
    write_csv(options.out_dir / "runs.csv", segment_rows(runs))
    write_csv(options.out_dir / "beats.csv", segment_rows(beats))
    write_csv(options.out_dir / "scenes.csv", scene_rows)
    manifest = {
        "source": options.video.name, "fps": options.fps, "frame_count": len(frames),
        "frame_duration_ms": round(1000 / options.fps, 4), "time_base": options.time_base,
        "metric_notes": {
            "mean_abs_diff": "mean |luma(t) - luma(t-1)|, 0-255",
            "changed_pct": f"% pixels whose luma changed by more than {DIFF_THRESHOLD}",
            "motion_bbox_*": "bounding box (full-res px) of all changed pixels vs previous frame; -1 = no change",
            "flow_*_px": f"Farneback optical flow at {FLOW_WIDTH}px wide, rescaled to full-res px per frame; dx>0 right, dy>0 down",
            "flow_divergence": ">0 expanding (zoom in / scale up / pop), <0 contracting",
            "flow_curl": ">0 clockwise-ish rotation in image coords, <0 counter-clockwise",
            "segments.motion_type / easing": "heuristic labels from flow + diff; verify visually",
        },
        "scenes": scene_rows,
        "runs": [asdict(s) for s in runs],
        "beats": [asdict(s) for s in beats],
        "frames": [asdict(f) for f in frames],
    }
    (options.out_dir / "manifest.json").write_text(json.dumps(manifest))
    moving_frames = sum(s.frames for s in runs if s.kind == "motion")
    motion_beats = sum(1 for s in beats if s.kind == "motion")
    print(f"done: {len(frames)} frames, {len(runs)} runs, {motion_beats} motion beats, {moving_frames} moving frames")


if __name__ == "__main__":
    main()

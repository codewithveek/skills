"""Write beat-curves.json: one signed motion curve per motion beat, ready for preset fitting."""
from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path

from analyze_motion import load_frames_csv
from motion_curves import build_beat_curve, load_beat_rows

# A sample count, not a duration: a curve needs at least this many frames to fit reliably. At 30 fps
# that leaves beats under 200 ms counted in beats.csv but not fitted (100 ms at 60 fps).
MIN_BEAT_FRAMES = 6
STANDARD_FRAME_RATES = (23.976, 24.0, 25.0, 29.97, 30.0, 50.0, 59.94, 60.0)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--motion-dir", type=Path, required=True, help="folder with frames.csv and beats.csv")
    parser.add_argument("--out", type=Path, required=True)
    options = parser.parse_args()

    frames = load_frames_csv(options.motion_dir / "frames.csv")
    beats = [b for b in load_beat_rows(options.motion_dir / "beats.csv") if b.end_frame - b.start_frame + 1 >= MIN_BEAT_FRAMES]
    curves = [build_beat_curve(frames, beat) for beat in beats]
    # The frame rate comes from the frame timestamps, so 24, 30 and 60 fps references all fit correctly
    measured_fps = 1000 / (frames[1].time_ms - frames[0].time_ms) if len(frames) > 1 else 60.0
    fps = next((rate for rate in STANDARD_FRAME_RATES if abs(rate - measured_fps) < 0.01), round(measured_fps, 3))
    options.out.write_text(json.dumps({"fps": fps, "curves": [c.to_json() for c in curves]}, indent=1))
    print(f"wrote {len(curves)} curves at {fps} fps -> {options.out}")
    print("channels:", dict(Counter(c.channel for c in curves)))
    print("signal_quality >= 0.6:", sum(1 for c in curves if c.signal_quality >= 0.6))


if __name__ == "__main__":
    main()

"""Write beat-curves.json: one signed motion curve per motion beat, ready for preset fitting."""
from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path

from analyze_motion import load_frames_csv
from motion_curves import build_beat_curve, load_beat_rows

MIN_BEAT_FRAMES = 6


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--motion-dir", type=Path, required=True, help="folder with frames.csv and beats.csv")
    parser.add_argument("--out", type=Path, required=True)
    options = parser.parse_args()

    frames = load_frames_csv(options.motion_dir / "frames.csv")
    beats = [b for b in load_beat_rows(options.motion_dir / "beats.csv") if b.end_frame - b.start_frame + 1 >= MIN_BEAT_FRAMES]
    curves = [build_beat_curve(frames, beat) for beat in beats]
    options.out.write_text(json.dumps({"fps": 60, "curves": [c.to_json() for c in curves]}, indent=1))
    print(f"wrote {len(curves)} curves -> {options.out}")
    print("channels:", dict(Counter(c.channel for c in curves)))
    print("signal_quality >= 0.6:", sum(1 for c in curves if c.signal_quality >= 0.6))


if __name__ == "__main__":
    main()

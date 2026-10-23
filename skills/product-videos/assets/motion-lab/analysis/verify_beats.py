"""Render-and-compare verification for fitted presets (step 4 of the training pipeline).

For each beat: render its fitted preset (and controls) with Remotion, score each render against the
reference beat, and mark the beat verified when the fitted render scores at least --min-score.

  python3 analysis/verify_beats.py --top 8 --easings best,linear
  python3 analysis/verify_beats.py --beat-ids 94,147 --easings best,linear,named:css-ease
"""
from __future__ import annotations

import argparse
import csv
import json
import subprocess
from pathlib import Path

from score_render import score_render

PROJECT_ROOT = Path(__file__).resolve().parent.parent


def pick_beats(options: argparse.Namespace) -> list[int]:
    if options.beat_ids:
        return [int(value) for value in options.beat_ids.split(",")]
    fitted = json.loads(options.fitted.read_text())
    eligible = [b for b in fitted if b["signalQuality"] >= 0.8 and b["channel"] != "progress" and b["best"]["progressRmse"] <= 0.03]
    eligible.sort(key=lambda b: (-b["signalQuality"], b["best"]["progressRmse"]))
    return [b["beatId"] for b in eligible[:options.top]]


def render(beat_id: int, easing: str, options: argparse.Namespace) -> Path:
    out = options.renders_dir / f"beat-{beat_id}-{easing.replace(':', '-')}.mp4"
    subprocess.run(
        ["npm", "run", "-s", "render-check", "--", "--fitted", str(options.fitted), "--beat-id", str(beat_id),
         "--easing", easing, "--out", str(out)],
        cwd=PROJECT_ROOT, check=True, capture_output=True, text=True)
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--fitted", type=Path, default=PROJECT_ROOT / "data/saas-launch/presets/fitted-beats.json")
    parser.add_argument("--reference-curves", type=Path, default=PROJECT_ROOT / "data/saas-launch/beat-curves.json")
    parser.add_argument("--renders-dir", type=Path, default=PROJECT_ROOT / "renders")
    parser.add_argument("--beat-ids", help="comma-separated beat ids (default: --top best-quality beats)")
    parser.add_argument("--top", type=int, default=8)
    parser.add_argument("--easings", default="best,linear", help="first entry is the candidate; the rest are controls")
    parser.add_argument("--min-score", type=float, default=85.0)
    parser.add_argument("--out", type=Path, default=PROJECT_ROOT / "data/saas-launch/verification.csv")
    options = parser.parse_args()
    options.fitted = options.fitted.resolve()
    options.renders_dir = options.renders_dir.resolve()
    easings = options.easings.split(",")

    rows: list[dict[str, object]] = []
    for beat_id in pick_beats(options):
        scores: dict[str, float] = {}
        for easing in easings:
            render_path = render(beat_id, easing, options)
            report = score_render(argparse.Namespace(render=render_path, reference_curves=options.reference_curves,
                                                     beat_id=beat_id, render_range=None))
            scores[easing] = float(report["score"])
            rows.append({"beat_id": beat_id, "easing": easing, "score": report["score"],
                         "progress_rmse": report["progress_rmse"], "duration_ratio": report["duration_ratio"],
                         "travel_ratio": report["travel_ratio"], "direction_match": report["direction_match"],
                         "render": render_path.name})
        candidate = easings[0]
        verified = scores[candidate] >= options.min_score
        beats_controls = all(scores[candidate] > scores[e] for e in easings[1:])
        print(f"beat {beat_id:>4}: " + "  ".join(f"{e}={s:.1f}" for e, s in scores.items())
              + f"  -> {'VERIFIED' if verified else 'rejected'}{'' if beats_controls else ' (a control scored higher)'}")
        for row in rows[-len(easings):]:
            row["verified"] = verified
    with options.out.open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"wrote {options.out}")


if __name__ == "__main__":
    main()

import unittest

from motion_curves import BeatCurve, compare_curves, progress_from_velocity, scale_rates_to_velocity


def make_curve(velocity: list[float], channel: str = "translate_x") -> BeatCurve:
    progress = progress_from_velocity(velocity)
    return BeatCurve(
        beat_id=0, scene="test", start_frame=0, end_frame=len(velocity) - 1, duration_frames=len(velocity),
        channel=channel, unit="px", travel=sum(velocity), peak_speed=max(abs(v) for v in velocity),
        directional_consistency=1.0, signal_quality=1.0, motion_type="slide-left", region=(0, 0, 10, 10),
        velocity=tuple(velocity), progress=tuple(progress),
    )


class CompareCurvesTest(unittest.TestCase):
    def test_identical_curves_score_100(self) -> None:
        curve = make_curve([-1, -4, -9, -4, -1])
        self.assertEqual(compare_curves(curve, curve).score, 100.0)

    def test_opposite_direction_loses_direction_and_travel_points(self) -> None:
        reference = make_curve([-1, -4, -9, -4, -1])
        flipped = make_curve([1, 4, 9, 4, 1])
        comparison = compare_curves(reference, flipped)
        self.assertFalse(comparison.direction_match)
        self.assertEqual(comparison.score_breakdown["direction"], 0.0)
        self.assertEqual(comparison.score_breakdown["shape"], 50.0)  # same normalised shape

    def test_double_duration_scores_zero_duration_points(self) -> None:
        reference = make_curve([-2.0] * 10)
        longer = make_curve([-1.0] * 20)
        self.assertEqual(compare_curves(reference, longer).score_breakdown["duration"], 0.0)

    def test_linear_vs_ease_out_is_penalised(self) -> None:
        ease_out = make_curve([-9, -7, -5, -3, -1])
        linear = make_curve([-5, -5, -5, -5, -5])
        self.assertLess(compare_curves(ease_out, linear).score_breakdown["shape"], 50.0)


class ScaleCompoundingTest(unittest.TestCase):
    def test_compounded_rates_reach_true_final_size(self) -> None:
        # Shrinking 1.0 -> 0.6 in 4 equal relative steps: each step is (0.6 ** 0.25 - 1) of the current size.
        step_pct = (0.6 ** 0.25 - 1) * 100
        velocity = scale_rates_to_velocity([step_pct] * 4)
        self.assertAlmostEqual(sum(velocity), -40.0, places=6)
        self.assertAlmostEqual(sum([step_pct] * 4), 4 * step_pct)  # naive sum would be ~-47.9


if __name__ == "__main__":
    unittest.main()

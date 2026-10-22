/**
 * Progress-curve error, identical to analysis/motion_curves.py: resample both curves to 101 points
 * on normalised time [0, 1] with linear interpolation, then take the RMSE.
 */
export const RESAMPLE_POINTS = 101;

export function resampleProgress(progress: readonly number[], points: number = RESAMPLE_POINTS): number[] {
  if (progress.length < 2) {
    throw new Error(`A progress curve needs at least 2 samples, got ${progress.length}`);
  }
  const lastIndex = progress.length - 1;
  return Array.from({ length: points }, (_, pointIndex) => {
    const position = (pointIndex / (points - 1)) * lastIndex;
    const lower = Math.floor(position);
    const upper = Math.min(lastIndex, lower + 1);
    const fraction = position - lower;
    const lowerValue = progress[lower] ?? 0;
    const upperValue = progress[upper] ?? lowerValue;
    return lowerValue + (upperValue - lowerValue) * fraction;
  });
}

export function progressRmse(reference: readonly number[], candidate: readonly number[]): number {
  const referenceSamples = resampleProgress(reference);
  const candidateSamples = resampleProgress(candidate);
  const squaredErrorSum = referenceSamples.reduce((sum, value, index) => {
    const difference = value - (candidateSamples[index] ?? 0);
    return sum + difference * difference;
  }, 0);
  return Math.sqrt(squaredErrorSum / referenceSamples.length);
}

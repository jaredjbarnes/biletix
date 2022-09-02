// Error Function - Sigmoid Function

function t(x: number) {
  return (1 / (1 / 2)) * Math.abs(x);
}

function r(x: number) {
  const tx = t(x);
  return Math.exp(
    -(x * x) -
      1.26551223 +
      1.00002368 * tx +
      0.37409196 * tx * tx +
      0.09678418 * tx * tx * tx -
      0.18628806 * tx * tx * tx * tx +
      0.27886807 * tx * tx * tx * tx * tx -
      1.13520398 * tx * tx * tx * tx * tx * tx +
      1.48851587 * tx * tx * tx * tx * tx * tx * tx -
      0.82215223 * tx * tx * tx * tx * tx * tx * tx * tx +
      0.17087277 * tx * tx * tx * tx * tx * tx * tx * tx * tx
  );
}

export function erf(x: number) {
  return x >= 0 ? 1 - r(x) : r(x) - 1;
}

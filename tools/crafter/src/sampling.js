// Reuse the published per-request PCG64 stream without advancing game RNG.
export async function referenceSamplingDraws(pyodide, worldSeed, step) {
  if (!Number.isSafeInteger(worldSeed) || worldSeed < 0 || worldSeed >= 2 ** 31) {
    throw new Error('Sampling requires an integer world seed from 0 to 2147483647.');
  }
  if (!Number.isSafeInteger(step) || step < 0) {
    throw new Error('Sampling requires a nonnegative integer environment step.');
  }
  const seed = 424242 + worldSeed * 10000 + step;
  if (!Number.isSafeInteger(seed)) throw new Error('The sampling seed exceeds exact integer precision.');
  // Only validated integer data is interpolated. Generator() owns independent
  // state; np.random.seed() would alter the original Crafter world's stream.
  const proxy = await pyodide.runPythonAsync(
    `__import__('numpy').random.Generator(__import__('numpy').random.PCG64(${seed})).random(1024)`,
  );
  try {
    const draws = Float64Array.from(proxy.toJs());
    if (draws.length !== 1024 || draws.some((value) => !Number.isFinite(value) || value < 0 || value >= 1)) {
      throw new Error('NumPy returned an invalid sampling stream.');
    }
    return { seed, draws };
  } finally {
    proxy.destroy();
  }
}

// Full-vocabulary categorical sampling. The explicit uniform lets native and
// WASM runs use the same draws while retaining the browser's validated math.
export function sample(logits, temperature, uniform) {
  if (!logits.length) throw new Error('Cannot sample empty logits.');
  if (!Number.isFinite(temperature) || temperature < 0) throw new Error('Invalid sampling temperature.');
  let best = 0;
  for (let i = 1; i < logits.length; i += 1) if (logits[i] > logits[best]) best = i;
  if (temperature === 0) return best;
  if (!Number.isFinite(uniform) || uniform < 0 || uniform >= 1) {
    throw new Error('A sampling draw must be finite and in [0, 1).');
  }
  const probabilities = new Float64Array(logits.length);
  let total = 0;
  for (let i = 0; i < logits.length; i += 1) {
    probabilities[i] = Math.exp((logits[i] - logits[best]) / temperature);
    total += probabilities[i];
  }
  if (!Number.isFinite(total) || total <= 0) throw new Error('The model returned invalid sampling logits.');
  let draw = uniform * total;
  for (let i = 0; i < probabilities.length; i += 1) {
    draw -= probabilities[i];
    if (draw < 0) return i;
  }
  return best;
}

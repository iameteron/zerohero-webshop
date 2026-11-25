// src/sampling.js
async function referenceSamplingDraws(pyodide, worldSeed, step) {
  if (!Number.isSafeInteger(worldSeed) || worldSeed < 0 || worldSeed >= 2 ** 31) {
    throw new Error("Sampling requires an integer world seed from 0 to 2147483647.");
  }
  if (!Number.isSafeInteger(step) || step < 0) {
    throw new Error("Sampling requires a nonnegative integer environment step.");
  }
  const seed = 424242 + worldSeed * 1e4 + step;
  if (!Number.isSafeInteger(seed)) throw new Error("The sampling seed exceeds exact integer precision.");
  const proxy = await pyodide.runPythonAsync(
    `__import__('numpy').random.Generator(__import__('numpy').random.PCG64(${seed})).random(1024)`
  );
  try {
    const draws = Float64Array.from(proxy.toJs());
    if (draws.length !== 1024 || draws.some((value) => !Number.isFinite(value) || value < 0 || value >= 1)) {
      throw new Error("NumPy returned an invalid sampling stream.");
    }
    return { seed, draws };
  } finally {
    proxy.destroy();
  }
}

// src/world-worker.js
var runtime;
var queue = Promise.resolve();
var episodeDone = false;
var EPISODE_STEP_LIMIT = 512;
var root = new URL("../", import.meta.url);
var status = (message) => self.postMessage({ type: "status", message });
async function initialize() {
  status("Loading the Crafter WebAssembly runtime\u2026");
  const { loadPyodide } = await import(new URL("vendor/pyodide/pyodide.mjs", root).href);
  const pyodide = await loadPyodide({
    indexURL: new URL("vendor/pyodide/", root).href,
    stdout: () => {
    },
    stderr: (message) => console.debug("[Crafter]", message)
  });
  status("Loading NumPy, Pillow and SciPy into WebAssembly\u2026");
  await pyodide.loadPackage(["numpy", "pillow", "scipy"]);
  status("Loading original Crafter game assets\u2026");
  const response = await fetch(new URL("assets/world.zip", root));
  if (!response.ok) throw new Error(`Crafter assets: HTTP ${response.status}`);
  pyodide.unpackArchive(await response.arrayBuffer(), "zip", { extractDir: "/crafter" });
  await pyodide.runPythonAsync(`
import sys
sys.path.insert(0, '/crafter')
exec(compile(open('/crafter/world.py').read(), '/crafter/world.py', 'exec'))
`);
  return pyodide;
}
async function handle(message) {
  if (!["init", "reset", "step"].includes(message.type)) {
    throw new Error(`Unknown Crafter worker command: ${message.type}`);
  }
  if (message.type === "step" && episodeDone) {
    throw new Error("The episode has ended. Start a new world to continue.");
  }
  runtime ??= initialize();
  const pyodide = await runtime;
  if (message.type !== "step") status("Generating the Crafter world\u2026");
  pyodide.globals.set("world_message", JSON.stringify(message));
  const metadata = JSON.parse(await pyodide.runPythonAsync("world_dispatch(world_message)"));
  metadata.terminated = Boolean(metadata.done);
  metadata.truncated = !metadata.terminated && metadata.stats.steps >= EPISODE_STEP_LIMIT;
  metadata.done = metadata.terminated || metadata.truncated;
  metadata.episodeLimit = EPISODE_STEP_LIMIT;
  episodeDone = metadata.done;
  const proxy = pyodide.globals.get("world_frame");
  let bytes;
  try {
    bytes = Uint8Array.from(proxy.toJs());
  } finally {
    proxy.destroy();
  }
  metadata.frame = { rgba: bytes.buffer, width: metadata.width, height: metadata.height };
  metadata.sampling = await referenceSamplingDraws(pyodide, metadata.stats.seed, metadata.stats.steps);
  delete metadata.width;
  delete metadata.height;
  self.postMessage(metadata, [bytes.buffer, metadata.sampling.draws.buffer]);
}
self.onmessage = ({ data }) => {
  queue = queue.then(() => handle(data)).catch((error) => {
    self.postMessage({ type: "error", message: error.stack || String(error) });
  });
};

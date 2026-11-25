// The entire original Crafter simulation lives in this Pyodide WASM worker.
import { referenceSamplingDraws } from './sampling.js';

let runtime;
let queue = Promise.resolve();
let episodeDone = false;
const EPISODE_STEP_LIMIT = 512;
const root = new URL('../', import.meta.url);

const status = (message) => self.postMessage({ type: 'status', message });

async function initialize() {
  status('Loading the Crafter WebAssembly runtime…');
  const { loadPyodide } = await import(new URL('vendor/pyodide/pyodide.mjs', root).href);
  const pyodide = await loadPyodide({
    indexURL: new URL('vendor/pyodide/', root).href,
    stdout: () => {},
    stderr: (message) => console.debug('[Crafter]', message),
  });
  status('Loading NumPy, Pillow and SciPy into WebAssembly…');
  await pyodide.loadPackage(['numpy', 'pillow', 'scipy']);
  status('Loading original Crafter game assets…');
  const response = await fetch(new URL('assets/world.zip', root));
  if (!response.ok) throw new Error(`Crafter assets: HTTP ${response.status}`);
  pyodide.unpackArchive(await response.arrayBuffer(), 'zip', { extractDir: '/crafter' });
  await pyodide.runPythonAsync(`
import sys
sys.path.insert(0, '/crafter')
exec(compile(open('/crafter/world.py').read(), '/crafter/world.py', 'exec'))
`);
  return pyodide;
}

async function handle(message) {
  if (!['init', 'reset', 'step'].includes(message.type)) {
    throw new Error(`Unknown Crafter worker command: ${message.type}`);
  }
  if (message.type === 'step' && episodeDone) {
    throw new Error('The episode has ended. Start a new world to continue.');
  }
  runtime ??= initialize();
  const pyodide = await runtime;
  if (message.type !== 'step') status('Generating the Crafter world…');
  pyodide.globals.set('world_message', JSON.stringify(message));
  const metadata = JSON.parse(await pyodide.runPythonAsync('world_dispatch(world_message)'));
  metadata.terminated = Boolean(metadata.done);
  metadata.truncated = !metadata.terminated && metadata.stats.steps >= EPISODE_STEP_LIMIT;
  metadata.done = metadata.terminated || metadata.truncated;
  metadata.episodeLimit = EPISODE_STEP_LIMIT;
  episodeDone = metadata.done;
  const proxy = pyodide.globals.get('world_frame');
  let bytes;
  try {
    bytes = Uint8Array.from(proxy.toJs());
  } finally {
    proxy.destroy();
  }
  metadata.frame = { rgba: bytes.buffer, width: metadata.width, height: metadata.height };
  // Use an independent generator so model sampling never advances game RNG.
  metadata.sampling = await referenceSamplingDraws(pyodide, metadata.stats.seed, metadata.stats.steps);
  delete metadata.width;
  delete metadata.height;
  self.postMessage(metadata, [bytes.buffer, metadata.sampling.draws.buffer]);
}

self.onmessage = ({ data }) => {
  queue = queue.then(() => handle(data)).catch((error) => {
    self.postMessage({ type: 'error', message: error.stack || String(error) });
  });
};

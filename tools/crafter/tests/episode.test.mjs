import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = (await readFile(new URL('../src/world-worker.js', import.meta.url), 'utf8'))
  .replace("import { referenceSamplingDraws } from './sampling.js';", '')
  .replaceAll('import.meta.url', JSON.stringify('https://tviskaron.github.io/zero-wasm/built/world-worker.js'));

function boot(deathAt = Infinity) {
  let input;
  let steps = 0;
  let stepCalls = 0;
  const messages = [];
  const self = { postMessage: message => messages.push(message) };
  const fakePyodide = {
    globals: {
      set(_key, value) { input = JSON.parse(value); },
      get() { return { toJs: () => new Uint8Array(4), destroy() {} }; },
    },
    async runPythonAsync() {
      if (input.type === 'step') { steps++; stepCalls++; }
      else steps = 0;
      return JSON.stringify({ done: steps >= deathAt, stats: { steps }, width: 1, height: 1 });
    },
  };
  const context = vm.createContext({ self, URL, fakePyodide, referenceSamplingDraws: async () => ({ draws: new Float64Array(1) }) });
  vm.runInContext(`${source}\nruntime = Promise.resolve(fakePyodide);`, context);
  return {
    async send(type) {
      self.onmessage({ data: { type, seed: 0, action: 'Noop' } });
      await vm.runInContext('queue', context);
      return messages.at(-1);
    },
    stepCalls: () => stepCalls,
  };
}

test('the world worker truncates at 512 decisions, rejects later actions, and resets', async () => {
  const worker = boot();
  const initial = await worker.send('init');
  assert.equal(initial.stats.steps, 0);
  assert.equal(initial.done, false);
  assert.equal(initial.episodeLimit, 512);
  for (let step = 1; step <= 512; step++) {
    const result = await worker.send('step');
    assert.equal(result.stats.steps, step);
    assert.equal(result.done, step === 512);
    assert.equal(result.truncated, step === 512);
    assert.equal(result.terminated, false);
  }
  const rejected = await worker.send('step');
  assert.equal(rejected.type, 'error');
  assert.equal(worker.stepCalls(), 512, 'No world step is applied after truncation');
  const reset = await worker.send('reset');
  assert.equal(reset.done, false);
  assert.equal(reset.truncated, false);
  assert.equal(reset.stats.steps, 0);
  assert.equal((await worker.send('step')).stats.steps, 1);
});

test('natural termination takes precedence, including on the last allowed step', async () => {
  for (const deathAt of [3, 512]) {
    const worker = boot(deathAt);
    await worker.send('init');
    let result;
    for (let step = 1; step <= deathAt; step++) result = await worker.send('step');
    assert.equal(result.done, true);
    assert.equal(result.terminated, true);
    assert.equal(result.truncated, false);
    assert.equal((await worker.send('step')).type, 'error');
    assert.equal(worker.stepCalls(), deathAt);
  }
});

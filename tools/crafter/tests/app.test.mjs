import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { parseHTML } from 'linkedom';
import { ResponseView } from '../src/response-view.js';

// The DOM harness has no layout engine; browser checks cover resize behavior.
globalThis.ResizeObserver = class { observe() {} };

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const source = (await readFile(new URL('../src/app.js', import.meta.url), 'utf8'))
  .replace("import { ResponseView } from './response-view.js';", '')
  .replaceAll('import.meta.url', JSON.stringify('https://tviskaron.github.io/zero-wasm/built/app.js'));

function boot() {
  const { window, document } = parseHTML(html);
  const workers = [];
  const fetches = [];
  const timers = new Map();
  const timerDelays = new Map();
  let timer = 0;
  let random = 100;
  for (const select of document.querySelectorAll('select')) {
    let value = select.querySelector('option[selected]')?.value || select.querySelector('option')?.value || '';
    Object.defineProperty(select, 'value', { get: () => value, set: (next) => { value = String(next); } });
  }
  document.getElementById('world').getContext = () => ({ putImageData() {} });
  class FakeWorker {
    constructor(url) {
      this.url = url.href;
      this.kind = /\/(vision|text)-worker\.js$/.test(this.url) ? 'model' : 'world';
      this.messages = [];
      this.terminated = false;
      workers.push(this);
    }
    postMessage(message) {
      assert.equal(this.terminated, false, 'No messages may be sent to a terminated worker');
      this.messages.push(message);
    }
    terminate() { this.terminated = true; }
    emit(data) { this.onmessage?.({ data }); }
  }
  vm.runInNewContext(source, {
    document, window, Worker: FakeWorker, ResponseView, URL, Uint32Array,
    ImageData: class {},
    crypto: { getRandomValues(array) { array[0] = ++random; return array; } },
    fetch(url) { fetches.push(url); throw new Error('Unexpected fetch from the page'); },
    setTimeout(callback, delay) { timers.set(++timer, callback); timerDelays.set(timer, delay); return timer; },
    clearTimeout(id) { timers.delete(id); timerDelays.delete(id); },
  });
  const get = (id) => document.getElementById(id);
  const click = (id) => { const button = get(id); if (!button.disabled) button.onclick(); };
  const world = workers[0];
  const snapshot = (seed = 103000000, steps = 0) => ({
    type: 'world', done: false, action: steps ? 'Move East' : null, reward: 0,
    text: { long_term_context: 'A tree is to the east.', short_term_context: 'Choose an action.' },
    history: [], instructions: 'Crafter rules', prompt: 'Original public prompt',
    actions: ['Noop', 'Move East', 'Move West', 'Move North', 'Move South', 'Do', 'Sleep'],
    stats: { seed, steps, inventory: { health: 9 }, achievements: {} },
    frame: { rgba: new ArrayBuffer(4), width: 1, height: 1 },
    sampling: { seed: 424242 + seed * 10000 + steps, draws: new Float64Array(1024).fill(0.4) },
  });
  const models = () => workers.filter((worker) => worker.kind === 'model');
  const ready = (worker) => worker.emit({ type: 'ready', threads: 1, manifest: { label: 'Vision memory PPO' } });
  const result = (worker, extra = {}) => {
    const request = worker.messages.findLast((message) => message.type === 'generate');
    worker.emit({ type: 'result', id: request.id, text: '<action>Move East</action><memory>Tree east</memory>', tokens: 4, seconds: 1, cancelled: false, capHit: false, ...extra });
  };
  const steps = () => world.messages.filter((message) => message.type === 'step');
  return { document, window, get, click, world, snapshot, models, ready, result, steps, fetches, workers, timers, timerDelays };
}

test('the default PPO loads alongside the world without starting the agent', () => {
  const ui = boot();
  assert.equal(ui.workers.length, 2);
  assert.equal(ui.world.kind, 'world');
  assert.equal(ui.world.url, 'https://tviskaron.github.io/zero-wasm/built/world-worker.js');
  assert.equal(ui.world.messages[0].seed, 0);
  const worker = ui.models()[0];
  assert.equal(worker.messages[0].type, 'load');
  assert.equal(ui.get('world-loading').hidden, false);
  worker.emit({ type: 'download', loaded: 1024, total: 2048 });
  assert.equal(ui.get('model-loading-progress').getAttribute('value'), '0.5');
  assert.match(ui.get('model-loading-detail').textContent, /50%/);
  ui.world.emit(ui.snapshot());
  assert.equal(ui.get('run').disabled, true);
  assert.equal(ui.get('step').disabled, true);
  assert.equal(ui.get('world-loading-row').dataset.state, 'ready');
  assert.equal(ui.get('world-loading').hidden, false);
  ui.get('temperature').value = '0';
  ui.get('token-limit').value = '512';
  assert.equal(ui.get('token-stats').hidden, true);
  assert.equal(ui.get('action-footer').hidden, true);
  ui.get('show-stats').checked = true;
  ui.get('show-stats').onchange();
  assert.equal(ui.get('token-stats').hidden, false);
  assert.equal(ui.get('action-footer').hidden, false);
  ui.click('step');
  ui.get('step').onclick();
  ui.get('seed').value = '123';
  ui.click('reset');
  assert.equal(ui.world.messages.at(-1).type, 'reset');
  ui.world.emit(ui.snapshot(123));
  ui.document.querySelector('[data-action="Do"]').onclick();
  assert.equal(ui.steps().at(-1).action, 'Do');
  ui.world.emit(ui.snapshot(123, 1));
  assert.equal(ui.models().length, 1);
  assert.equal(ui.fetches.length, 0);
  ui.ready(worker);
  assert.equal(worker.messages.length, 1, 'Autoload never requests a decision');
  assert.equal(ui.timers.size, 0);
  assert.equal(ui.get('run').disabled, false);
  assert.equal(ui.get('step').disabled, false);
  assert.equal(ui.get('world-loading').hidden, true);
  assert.equal(ui.get('model').options.length, 4);
  const preloads = [...ui.document.querySelectorAll('[rel="prefetch"], [rel="preload"], [rel="modulepreload"]')];
  assert.deepEqual(preloads.map(node => [node.getAttribute('as'), node.getAttribute('href')]), [
    ['font', './vendor/fonts/inter-latin-wght-normal.woff2'],
  ], 'Model downloads are managed by the model worker');
});

test('model readiness before world readiness does not start play or dismiss the loader', () => {
  const ui = boot();
  ui.ready(ui.models()[0]);
  assert.equal(ui.get('model-loading-row').dataset.state, 'ready');
  assert.equal(ui.get('world-loading').hidden, false);
  assert.equal(ui.get('run').disabled, true);
  ui.world.emit(ui.snapshot());
  assert.equal(ui.get('world-loading').hidden, true);
  assert.equal(ui.get('run').disabled, false);
  assert.equal(ui.models()[0].messages.length, 1);
  assert.equal(ui.steps().length, 0);
});

test('Step makes exactly one decision after the first load without pressing Run', () => {
  const ui = boot();
  ui.world.emit(ui.snapshot());
  const worker = ui.models()[0];
  ui.ready(worker);
  assert.equal(ui.get('step').disabled, false);
  assert.equal(worker.messages.length, 1);
  ui.click('step');
  assert.equal(worker.messages.at(-1).type, 'generate');
  ui.result(worker);
  assert.equal(ui.steps().length, 1);
  ui.world.emit(ui.snapshot(0, 1));
  assert.equal(ui.timers.size, 0, 'Step must not start continuous play');
  assert.equal(worker.messages.filter(message => message.type === 'generate').length, 1);
  assert.equal(ui.get('step').disabled, false);
});

test('Run reuses the preloaded model and preserves sampling and step-delay settings', () => {
  const ui = boot();
  const state = ui.snapshot();
  ui.world.emit(state);
  const worker = ui.models()[0];
  assert.equal(worker.url, 'https://tviskaron.github.io/zero-wasm/built/vision-worker.js');
  assert.equal(worker.messages[0].type, 'load');
  ui.ready(worker);
  ui.click('run');
  ui.get('run').onclick(); // An already queued double-click is ignored too.
  assert.equal(ui.models().length, 1);
  assert.equal(worker.messages.length, 2);
  assert.equal(ui.get('stop').disabled, false);
  const request = worker.messages[1];
  assert.equal(request.type, 'generate');
  assert.equal(request.temperature, 1);
  assert.equal(request.maxNewTokens, 512);
  assert.equal(request.samplingSeed, state.sampling.seed);
  assert.equal(request.samplingDraws, state.sampling.draws);
  ui.result(worker);
  assert.equal(ui.steps().length, 1);
  assert.equal(ui.steps()[0].action, 'Move East');
  ui.result(worker);
  assert.equal(ui.steps().length, 1, 'A duplicate response cannot apply an action twice');
  ui.world.emit(ui.snapshot(103000000, 1));
  assert.equal(ui.timers.size, 1);
  assert.equal([...ui.timerDelays.values()][0], 500);
  ui.click('stop');
  assert.equal(ui.timers.size, 0);
  ui.get('step-delay').value = '1000';
  ui.click('run');
  assert.equal(ui.models().length, 1, 'A loaded model is reused after Stop');
  ui.result(worker);
  ui.world.emit(ui.snapshot(103000000, 2));
  assert.equal([...ui.timerDelays.values()][0], 1000);
});

test('Stop aborts a model download, ignores stale messages, and permits an explicit retry', () => {
  const ui = boot();
  ui.world.emit(ui.snapshot());
  const old = ui.models()[0];
  const queued = old.onmessage;
  ui.click('stop');
  assert.equal(old.terminated, true);
  assert.equal(ui.get('run').disabled, false);
  assert.equal(ui.get('step').disabled, true);
  queued({ data: { type: 'ready', threads: 1, manifest: { label: 'stale' } } });
  queued({ data: { type: 'result', id: 1, text: 'ACTION: Do', tokens: 4, seconds: 1 } });
  assert.equal(old.messages.length, 1);
  assert.equal(ui.steps().length, 0);
  ui.click('run');
  const fresh = ui.models()[1];
  queued({ data: { type: 'ready', threads: 1, manifest: { label: 'stale' } } });
  assert.equal(fresh.messages.length, 1);
  ui.ready(fresh);
  assert.equal(fresh.messages.at(-1).type, 'generate');
});

test('Reset preserves an in-progress model download and waits for the new world', () => {
  const ui = boot();
  ui.world.emit(ui.snapshot());
  const old = ui.models()[0];
  assert.equal(ui.get('seed').disabled, false);
  ui.get('seed').value = '99';
  ui.click('reset');
  assert.equal(old.terminated, false);
  assert.equal(ui.world.messages.at(-1).seed, 99);
  assert.equal(ui.get('run').disabled, true);
  ui.ready(old);
  assert.equal(ui.get('run').disabled, true, 'Model readiness cannot finish a world reset');
  assert.equal(ui.get('world-loading').hidden, false);
  ui.world.emit(ui.snapshot(99));
  assert.equal(ui.get('run').disabled, false);
  assert.equal(ui.get('step').disabled, false);
  assert.equal(ui.get('world-loading').hidden, true);
  assert.equal(old.messages.length, 1);
  assert.equal(ui.models().length, 1);
  assert.equal(ui.steps().length, 0);
});

test('download/network errors wait for Run before retrying', () => {
  const ui = boot();
  ui.world.emit(ui.snapshot());
  const failed = ui.models()[0];
  failed.emit({ type: 'error', id: null, message: 'Failed to fetch' });
  assert.equal(failed.terminated, true);
  assert.equal(ui.get('run').disabled, false);
  assert.match(ui.get('notice').textContent, /retry/);
  assert.equal(ui.models().length, 1);
  ui.click('run');
  const retry = ui.models()[1];
  retry.onerror({ message: 'Network error loading worker module' });
  assert.equal(retry.terminated, true);
  assert.equal(ui.get('run').disabled, false);
  assert.equal(ui.models().length, 2);
  ui.click('run');
  assert.equal(ui.models().length, 3);
});

test('Stop suppresses an already queued result even if the worker finished before cancellation', () => {
  const ui = boot();
  ui.world.emit(ui.snapshot());
  const worker = ui.models()[0];
  ui.ready(worker);
  ui.click('run');
  ui.click('stop');
  assert.equal(worker.messages.at(-1).type, 'cancel');
  ui.result(worker, { cancelled: false });
  assert.equal(ui.steps().length, 0);
  assert.equal(ui.get('run').disabled, false);
  assert.equal(ui.get('step').disabled, false);
  ui.click('step');
  assert.equal(worker.messages.at(-1).type, 'generate');
  assert.equal(ui.models().length, 1);
});

test('reset during generation cancels the old action while retaining an already loaded model', () => {
  const ui = boot();
  ui.world.emit(ui.snapshot());
  const worker = ui.models()[0];
  ui.ready(worker);
  ui.click('run');
  ui.click('new-world');
  assert.equal(worker.messages.at(-1).type, 'cancel');
  ui.result(worker);
  assert.equal(ui.steps().length, 0);
  assert.equal(ui.world.messages.at(-1).type, 'reset');
  ui.world.emit(ui.snapshot(ui.world.messages.at(-1).seed));
  assert.equal(ui.get('step').disabled, false);
  assert.equal(ui.models().length, 1);
  assert.equal(worker.messages.filter((message) => message.type === 'generate').length, 1);
});

test('background model readiness and failures do not release an in-flight world action', () => {
  for (const outcome of ['ready', 'error']) {
    const ui = boot();
    ui.world.emit(ui.snapshot());
    ui.document.querySelector('[data-action="Do"]').onclick();
    const worker = ui.models()[0];
    if (outcome === 'ready') ui.ready(worker);
    else worker.emit({ type: 'error', id: null, message: 'Network error' });
    assert.equal(ui.get('manual-go').disabled, true);
    assert.equal(ui.get('run').disabled, true);
    ui.world.emit(ui.snapshot(0, 1));
    assert.equal(ui.get('manual-go').disabled, false);
    assert.equal(ui.get('run').disabled, false);
  }
});

test('natural endings and time truncation show distinct overlays and stop the agent', () => {
  for (const truncated of [false, true]) {
    const ui = boot();
    ui.world.emit(ui.snapshot());
    const worker = ui.models()[0];
    ui.ready(worker);
    ui.click('run');
    ui.result(worker);
    ui.world.emit({ ...ui.snapshot(0, truncated ? 512 : 8), done: true, truncated, episodeLimit: 512 });
    assert.equal(ui.get('episode-end').hidden, false);
    assert.equal(ui.get('episode-end-title').textContent, truncated ? 'Time limit reached' : 'Game over');
    if (truncated) assert.match(ui.get('episode-end-detail').textContent, /ended by time: 512 steps/);
    assert.equal(ui.get('run').disabled, true);
    assert.equal(ui.get('step').disabled, true);
    assert.equal(ui.timers.size, 0);
    ui.get('run').onclick();
    ui.get('step').onclick();
    assert.equal(worker.messages.length, 2);
    ui.click('restart');
    assert.equal(ui.get('episode-end').hidden, true);
    assert.equal(ui.world.messages.at(-1).type, 'reset');
    ui.world.emit(ui.snapshot(ui.world.messages.at(-1).seed));
    assert.equal(ui.get('run').disabled, false);
    assert.equal(ui.models().length, 1);
    assert.equal(worker.messages.length, 2);
  }
});

test('HTML uses relative assets for GitHub project Pages', () => {
  const { document } = parseHTML(html);
  assert.equal(document.querySelector('link[rel="stylesheet"]').getAttribute('href'), './styles.css');
  assert.equal(document.querySelector('script[type="module"]').getAttribute('src'), './built/app.js');
});

 test('switching from visual to text unloads the old worker and clears episode memory', () => {
  const ui=boot();ui.world.emit(ui.snapshot());const old=ui.models()[0];ui.ready(old);
  ui.click('step');ui.result(old);ui.world.emit(ui.snapshot(0,1));
  ui.get('model').value='text-ppo-ra';ui.get('model').onchange();
  assert.equal(old.terminated,true);
  const fresh=ui.models().at(-1);
  assert.match(fresh.url,/text-worker\.js$/);
  assert.equal(fresh.messages[0].directory,'text-ppo-ra');
  assert.equal(ui.get('token-limit').value,'1024');
  assert.equal(ui.world.messages.at(-1).type,'reset');
  ui.world.emit(ui.snapshot(0));ui.ready(fresh);ui.click('step');
  const request=fresh.messages.at(-1);
  assert.equal(request.type,'generate');
  assert.equal(request.memoryTokens.length,0);
  assert.equal(request.history.length,0);
  assert.equal(request.text.long_term_context,'A tree is to the east.');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import vm from 'node:vm';
import { parseHTML } from 'linkedom';
import { ResponseView } from '../src/response-view.js';

globalThis.ResizeObserver = class { observe() {} };

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const source = (await readFile(new URL('../src/app.js', import.meta.url), 'utf8'))
  .replace("import { ResponseView } from './response-view.js';", '')
  .replaceAll('import.meta.url', JSON.stringify('https://tviskaron.github.io/zero-wasm/built/app.js'));

function boot(page = html) {
  const { window, document } = parseHTML(page);
  const workers = [];
  for (const select of document.querySelectorAll('select')) {
    let value = select.querySelector('option[selected]')?.value || select.querySelector('option')?.value || '';
    Object.defineProperty(select, 'value', { get: () => value, set: (next) => { value = String(next); } });
  }
  document.getElementById('world').getContext = () => ({ putImageData() {} });
  class FakeWorker {
    constructor(url) { this.url = url.href; this.messages = []; workers.push(this); }
    postMessage(message) { this.messages.push(message); }
    terminate() {}
    emit(data) { this.onmessage?.({ data }); }
  }
  vm.runInNewContext(source, {
    document, window, Worker: FakeWorker, ResponseView, URL, Uint32Array, ImageData: class {},
    crypto: { getRandomValues(array) { array[0] = 7; return array; } },
    fetch() { throw new Error('Unexpected fetch from the page'); },
    setTimeout() { return 1; }, clearTimeout() {},
  });
  return { document, workers, get: (id) => document.getElementById(id) };
}

test('older page links redirect to the single demo', async () => {
  for (const page of ['vision.html', 'text.html', 'vision-memory.html']) {
    const { document } = parseHTML(await readFile(new URL('../' + page, import.meta.url), 'utf8'));
    assert.equal(document.querySelector('meta[http-equiv="refresh"]').getAttribute('content'), '0; url=./');
    assert.equal(document.querySelector('script'), null);
  }
});

test('the default page runs the memory student: tagged answers, its memory carried to the next prompt', () => {
  const ui = boot();
  const [world, model] = ui.workers;
  assert.equal(model.url, 'https://tviskaron.github.io/zero-wasm/built/vision-worker.js');
  assert.equal(model.messages[0].type, 'load');
  assert.equal(ui.get('agent'), null);
  const frame = { rgba: new ArrayBuffer(256 * 256 * 4), width: 256, height: 256 };
  const state = (action) => ({
    type: 'world', done: false, action, reward: 0, frame,
    text: { long_term_context: 'unused', short_term_context: 'unused' }, history: [], instructions: '', prompt: '',
    actions: ['Noop', 'Move East'], stats: { seed: 0, steps: 0, inventory: {}, achievements: { collect_wood: 1 } },
    sampling: { seed: 1, draws: new Float64Array(1024).fill(0.5) },
  });
  world.emit(state(null));
  model.emit({ type: 'ready', threads: 1, manifest: { label: 'Vision memory PPO', parameters: 12593280 } });
  const decide = (text) => {
    ui.get('step').onclick();
    const request = model.messages.filter((message) => message.type === 'generate').at(-1);
    model.emit({ type: 'result', id: request.id, text, tokens: 20, seconds: 1 });
    const step = world.messages.filter((message) => message.type === 'step').at(-1);
    world.emit(state(step.action || 'Noop'));
    return { request, step };
  };
  const first = decide('<reasoning>\nTable east.\n</reasoning>\n<action>Move East</action>\n<memory>Table: 1 east.\nGoal: pickaxe.</memory>');
  assert.equal(first.request.frame, frame);
  assert.equal(first.request.maxNewTokens, 512);
  assert.equal(first.request.instructions, undefined);
  assert.equal(first.request.accomplished,
    'Accomplished achievements: collect_wood\nYour memory (written by you at the previous step):\n(empty: this is the first step)');
  assert.equal(first.step.action, 'Move East');
  const second = decide('<reasoning>\nRambling without an action');
  assert.match(second.request.accomplished, /step\):\nTable: 1 east\.\nGoal: pickaxe\.$/);
  assert.equal(second.step.action, '');  // invalid: the world plays Noop
  const third = decide('<reasoning>\nx\n</reasoning>\n<action>Noop</action>\n<memory>new</memory>');
  assert.match(third.request.accomplished, /Goal: pickaxe\.$/);  // an invalid answer keeps the old memory
  ui.get('reset').onclick();
  world.emit(state(null));
  const fourth = decide('<reasoning>\nx\n</reasoning>\n<action>Noop</action>\n<memory>after reset</memory>');
  assert.match(fourth.request.accomplished, /\(empty: this is the first step\)$/);  // a new game starts empty
});

test('the memory student gets back its own memory tokens when the worker reads its answers', () => {
  const ui = boot();
  const [world, model] = ui.workers;
  const frame = { rgba: new ArrayBuffer(256 * 256 * 4), width: 256, height: 256 };
  const state = (action) => ({
    type: 'world', done: false, action, reward: 0, frame,
    text: { long_term_context: 'unused', short_term_context: 'unused' }, history: [], instructions: '', prompt: '',
    actions: ['Noop', 'Move East'], stats: { seed: 0, steps: 0, inventory: {}, achievements: { place_table: 1, collect_wood: 2 } },
    sampling: { seed: 1, draws: new Float64Array(1024).fill(0.5) },
  });
  world.emit(state(null));
  model.emit({ type: 'ready', threads: 1, manifest: { label: 'Vision memory PPO', parameters: 12593280 } });
  const decide = (answer) => {
    ui.get('step').onclick();
    const request = model.messages.filter((message) => message.type === 'generate').at(-1);
    model.emit({ type: 'result', id: request.id, text: 'x', tokens: 20, seconds: 1, answer });
    const step = world.messages.filter((message) => message.type === 'step').at(-1);
    world.emit(state(step.action || 'Noop'));
    return { request, step };
  };
  const first = decide({ action: 'Move East', memory: [11, 12, 13], memoryText: 'Table east.' });
  const list = (value) => Array.from(value);  // arrays from the page's own realm
  assert.deepEqual(list(first.request.achievements), ['collect_wood', 'place_table']);
  assert.deepEqual(list(first.request.memoryTokens), []);
  assert.equal(first.step.action, 'Move East');
  const second = decide(null);  // invalid: Noop, the memory stays
  assert.deepEqual(list(second.request.memoryTokens), [11, 12, 13]);
  assert.match(second.request.accomplished, /Table east\.$/);
  assert.equal(second.step.action, '');
  const third = decide({ action: 'Noop', memory: [], memoryText: '' });
  assert.deepEqual(list(third.request.memoryTokens), [11, 12, 13]);
  ui.get('reset').onclick();
  world.emit(state(null));
  assert.deepEqual(list(decide(null).request.memoryTokens), []);  // a new game starts empty
});

test('while asleep with energy below the maximum the vision agents are not asked and the world sleeps', () => {
  const ui = boot();
  const [world, model] = ui.workers;
  const frame = { rgba: new ArrayBuffer(256 * 256 * 4), width: 256, height: 256 };
  const state = (energy, text) => ({
    type: 'world', done: false, action: null, reward: 0, frame,
    text: { long_term_context: text, short_term_context: 'unused' }, history: [], instructions: '', prompt: '',
    actions: ['Noop', 'Sleep'], stats: { seed: 0, steps: 0, inventory: { energy }, achievements: {} },
    sampling: { seed: 1, draws: new Float64Array(1024).fill(0.5) },
  });
  world.emit(state(3, 'You are sleeping, and will not be able take actions until energy is full.'));
  model.emit({ type: 'ready', threads: 1, manifest: { label: 'Vision memory PPO', parameters: 12593280 } });
  ui.get('step').onclick();
  assert.equal(model.messages.filter((message) => message.type === 'generate').length, 0);
  assert.equal(world.messages.filter((message) => message.type === 'step').at(-1).action, 'Sleep');
  world.emit(state(9, 'You are sleeping, and will not be able take actions until energy is full.'));
  ui.get('step').onclick();  // energy full: this step wakes the player and its action counts again
  assert.equal(model.messages.filter((message) => message.type === 'generate').length, 1);
});

test('vision assets match their manifest and the page uses relative paths', async () => {
  const models = await readdir(new URL('../../../crafter/assets/models/', import.meta.url));
  assert.deepEqual(models.sort(), ['text-ppo-ra','vision-memory','visual-ppo-ra-100m','visual-ppo-ra-1b'].sort());
  const directory = new URL('../../../crafter/assets/models/vision-memory/', import.meta.url);
  const manifest = JSON.parse(await readFile(new URL('manifest.json', directory), 'utf8'));
  for (const key of ['vision', 'decoder']) {
    const bytes = await readFile(new URL(key + '.onnx', directory));
    assert.equal(bytes.length, manifest[`${key}_bytes`]);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), manifest[`${key}_sha256`]);
  }
  const { document } = parseHTML(html);
  assert.equal(document.querySelector('script[type="module"]').getAttribute('src'), './built/app.js');
  assert.equal(document.querySelector('link[rel="stylesheet"]').getAttribute('href'), './styles.css');
});

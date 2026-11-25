// Run the screen-and-memory student in browser WebAssembly.
import * as ort from 'onnxruntime-web/wasm';
import { Tokenizer } from '@huggingface/tokenizers';
import { sample } from './sampling.js';
import { memoryPrompt, readAnswer, tokenTable } from './memory-tokens.js';

let vision;
let decoder;
let tokenizer;
let manifest;
let table = null;  // token bytes, for the memory student's answers read as in training
let activeId = null;
let cancelled = false;
let loading = false;
const threads = self.crossOriginIsolated ? Math.min(4, navigator.hardwareConcurrency || 1) : 1;
const siteRoot = new URL('../', import.meta.url);
let modelRoot = new URL('assets/models/vision-memory/', siteRoot);
ort.env.wasm.wasmPaths = new URL('vendor/ort/', siteRoot).href;
ort.env.wasm.numThreads = threads;
ort.env.wasm.proxy = false;

function status(message) { self.postMessage({ type: 'status', message }); }

async function readJson(name) {
  const response = await fetch(new URL(name, modelRoot));
  if (!response.ok) throw new Error(`Cannot download ${name} (HTTP ${response.status}).`);
  return response.json();
}

async function sha256(bytes) {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (x) => x.toString(16).padStart(2, '0')).join('');
}

// Both graphs download together; progress reports their combined decoded bytes.
async function downloadAll(files) {
  const total = files.reduce((sum, file) => sum + file.bytes, 0);
  const loaded = files.map(() => 0);
  let lastUpdate = 0;
  const report = () => {
    const now = performance.now();
    const sum = loaded.reduce((a, b) => a + b, 0);
    if (now - lastUpdate > 100 || sum === total) { self.postMessage({ type: 'download', loaded: sum, total }); lastUpdate = now; }
  };
  return Promise.all(files.map(async (file, index) => {
    const url = new URL(file.name, modelRoot);
    url.searchParams.set('sha256', file.sha256);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Model download failed (HTTP ${response.status}).`);
    if (!response.body?.getReader) return response.arrayBuffer();
    const reader = response.body.getReader();
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded[index] += value.byteLength;
      report();
    }
    const bytes = new Uint8Array(loaded[index]);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return bytes.buffer;
  }));
}

async function load(directory = 'vision-memory') {
  modelRoot = new URL(`assets/models/${directory}/`, siteRoot);
  if (loading || activeId !== null) throw new Error('The model is busy.');
  loading = true;
  try {
    status('Downloading the vision model…');
    const [metadata, tokenizerJson, tokenizerConfig] = await Promise.all([
      readJson('manifest.json'), readJson('tokenizer.json'), readJson('tokenizer_config.json'),
    ]);
    const [visionBytes, decoderBytes] = await downloadAll([
      { name: 'vision.onnx', bytes: metadata.vision_bytes, sha256: metadata.vision_sha256 },
      { name: 'decoder.onnx', bytes: metadata.decoder_bytes, sha256: metadata.decoder_sha256 },
    ]);
    if (await sha256(visionBytes) !== metadata.vision_sha256 || await sha256(decoderBytes) !== metadata.decoder_sha256) {
      throw new Error('The model download failed its integrity check. Reload the page and try Run again.');
    }
    tokenizer = new Tokenizer(tokenizerJson, tokenizerConfig);
    table = tokenTable(tokenizerJson);
    const check = tokenizer.encode(metadata.tokenizer_check.text, { add_special_tokens: false }).ids;
    if (JSON.stringify(check) !== JSON.stringify(metadata.tokenizer_check.ids)) {
      throw new Error('Browser tokenizer differs from the exported student tokenizer.');
    }
    status('Starting ONNX WebAssembly…');
    const options = { executionProviders: ['wasm'], graphOptimizationLevel: 'all' };
    vision = await ort.InferenceSession.create(visionBytes, options);
    decoder = await ort.InferenceSession.create(decoderBytes, options);
    manifest = metadata;
    self.postMessage({ type: 'ready', manifest, threads });
  } finally {
    loading = false;
  }
}

// Qwen2-VL image processor math: (x / 255 - 0.5) / 0.5, two temporal copies, 2x2 merge order.
function patchify(rgba, width) {
  const { size: p, merge: m, image } = manifest.patch;
  const grid = image / p;
  const out = new Float32Array(grid * grid * 3 * 2 * p * p);
  let row = 0;
  for (let bh = 0; bh < grid / m; bh += 1) for (let bw = 0; bw < grid / m; bw += 1) {
    for (let mh = 0; mh < m; mh += 1) for (let mw = 0; mw < m; mw += 1) {
      const y0 = (bh * m + mh) * p;
      const x0 = (bw * m + mw) * p;
      let col = row * 3 * 2 * p * p;
      for (let c = 0; c < 3; c += 1) for (let t = 0; t < 2; t += 1) {
        for (let py = 0; py < p; py += 1) for (let px = 0; px < p; px += 1) {
          out[col++] = (rgba[((y0 + py) * width + x0 + px) * 4 + c] / 255 - 0.5) / 0.5;
        }
      }
      row += 1;
    }
  }
  return out;
}

// MRoPE positions for one image (Qwen3VLModel.get_rope_index).
function positions(ids) {
  const start = ids.indexOf(manifest.image_token_id);
  const side = Math.round(Math.sqrt(manifest.vision_tokens));
  const out = [[], [], []];
  for (let i = 0; i < start; i += 1) out.forEach((axis) => axis.push(i));
  for (let h = 0; h < side; h += 1) for (let w = 0; w < side; w += 1) {
    out[0].push(start); out[1].push(start + h); out[2].push(start + w);
  }
  for (let i = start + manifest.vision_tokens; i < ids.length; i += 1) {
    const value = start + side + (i - start - manifest.vision_tokens);
    out.forEach((axis) => axis.push(value));
  }
  return out;
}

async function generate(message) {
  if (!decoder || loading) throw new Error('Model is not ready');
  if (activeId !== null) throw new Error('Another response is still being generated');
  activeId = message.id;
  cancelled = false;
  const started = performance.now();
  const L = manifest.layers;
  const H = manifest.hidden;
  const tensors = [];
  const keep = (t) => { tensors.push(t); return t; };
  let cache = Array.from({ length: 2 * L }, () => new ort.Tensor('float32', new Float32Array(0), [1, manifest.kv_heads, 0, manifest.head_dim]));
  let output;
  try {
    const temperature = Number(message.temperature);
    if (![0, 1].includes(temperature)) throw new Error('Unsupported sampling temperature');
    const cap = Math.max(1, Math.min(Number(message.maxNewTokens), message.samplingDraws?.length ?? 0));
    const pixels = keep(new ort.Tensor('float32', patchify(new Uint8Array(message.frame.rgba), message.frame.width), [256, 1536]));
    const seen = await vision.run({ pixel_values: pixels });
    Object.values(seen).forEach(keep);
    const ids = memoryPrompt(manifest.memory_prompt, message.achievements, message.memoryTokens);
    const S = ids.length;
    const start = ids.indexOf(manifest.image_token_id);
    const mask = new Float32Array(S);
    const embeds = new Float32Array(S * H);
    const deep0 = new Float32Array(S * H);
    const deep1 = new Float32Array(S * H);
    for (let i = 0; i < manifest.vision_tokens; i += 1) mask[start + i] = 1;
    embeds.set(seen.image_embeds.data, start * H);
    deep0.set(seen.deepstack_0.data, start * H);
    deep1.set(seen.deepstack_1.data, start * H);
    const pos = positions(ids);
    let lastPosition = Math.max(...pos.flat());

    // One decoder call on top of the key/value cache `past` (left untouched): the last position's logits and the
    // extended cache.
    async function run(tokens, positionRows, maskRows, embedRows, d0, d1, past) {
      const n = tokens.length;
      const feeds = {
        input_ids: keep(new ort.Tensor('int64', BigInt64Array.from(tokens, BigInt), [1, n])),
        position_ids: keep(new ort.Tensor('int64', BigInt64Array.from(positionRows.flat(), BigInt), [3, 1, n])),
        visual_mask: keep(new ort.Tensor('float32', maskRows, [1, n, 1])),
        visual_embeds: keep(new ort.Tensor('float32', embedRows, [1, n, H])),
        deepstack_0: keep(new ort.Tensor('float32', d0, [1, n, H])),
        deepstack_1: keep(new ort.Tensor('float32', d1, [1, n, H])),
      };
      for (let i = 0; i < L; i += 1) { feeds[`past_key_${i}`] = past[2 * i]; feeds[`past_value_${i}`] = past[2 * i + 1]; }
      const result = await decoder.run(feeds);
      const present = [];
      for (let i = 0; i < L; i += 1) present.push(result[`present_key_${i}`], result[`present_value_${i}`]);
      return { logits: result.logits, cache: present };
    }

    async function forward(tokens, positionRows, maskRows, embedRows, d0, d1) {
      const result = await run(tokens, positionRows, maskRows, embedRows, d0, d1, cache);
      cache.forEach((t) => t.dispose?.());
      cache = result.cache;
      return result.logits;
    }

    // Probability of every action name where the answer starts its action: each name is scored as a continuation
    // (the rest of the action marker, the name, then the closing tag or the end of the answer) on top of the cache,
    // and the scores are normalized over the names. Names share their first tokens ("Move", "Make", "Place"), so the
    // continuations form a tree and each shared prefix runs once.
    async function actionDistribution(names, rest, first, past, position) {
      const sequences = names.map((name) =>
        tokenizer.encode(rest + name + '</action>', { add_special_tokens: false }).ids);
      const root = { children: new Map(), ends: [] };
      sequences.forEach((tokens, index) => {
        let node = root;
        for (const token of tokens) {
          if (!node.children.has(token)) node.children.set(token, { children: new Map(), ends: [] });
          node = node.children.get(token);
        }
        node.ends.push(index);
      });
      const scores = new Array(names.length).fill(-Infinity);
      const zeros = new Float32Array(H);
      async function visit(node, logp, logits, before, at) {
        let top = -Infinity;
        for (let i = 0; i < manifest.image_token_id; i += 1) if (logits[i] > top) top = logits[i];
        let total = 0;
        for (let i = 0; i < manifest.image_token_id; i += 1) total += Math.exp(logits[i] - top);
        const normalizer = top + Math.log(total);
        for (const [token, child] of node.children) {
          const value = logp + logits[token] - normalizer;
          for (const index of child.ends) scores[index] = value;
          if (child.children.size) {
            const next = await run([token], [[at + 1], [at + 1], [at + 1]], new Float32Array(1), zeros, zeros, zeros, before);
            const data = Float32Array.from(next.logits.data);
            next.logits.dispose?.();
            await visit(child, value, data, next.cache, at + 1);
            next.cache.forEach((t) => t.dispose?.());
          }
        }
      }
      await visit(root, 0, first, past, position);
      const mass = scores.reduce((sum, value) => sum + Math.exp(value), 0);
      return { actions: names.map((name, index) => ({ name, p: mass > 0 ? Math.exp(scores[index]) / mass : 0 }))
        .sort((a, b) => b.p - a.p), mass };
    }

    self.postMessage({ type: 'prefill', id: activeId, completed: 0, total: S });
    let logits = await forward(ids, pos, mask, embeds, deep0, deep1);
    const generated = [];
    const zeros = new Float32Array(H);
    const decodeStart = performance.now();
    let finished = false;
    let capHit = false;
    const names = Array.isArray(message.actions) ? message.actions : [];
    let scored = names.length === 0;
    for (let i = 0; i < cap && !cancelled; i += 1) {
      // Responses are text: the multimodal marker ids are never valid outputs (PPO trained with this mask).
      logits.data.fill(-Infinity, manifest.image_token_id);
      const token = sample(logits.data, temperature, message.samplingDraws[i]);
      const here = scored ? null : Float32Array.from(logits.data);  // the distribution this token was drawn from
      logits.dispose();
      if (token === manifest.eos_token_id) { finished = true; break; }
      generated.push(token);
      if (!scored && />/.test(tokenizer.decode([token], { skip_special_tokens: true }))) {
        const text = tokenizer.decode(generated, { skip_special_tokens: true });
        const marker = '<action>';
        const index = text.indexOf(marker);
        if (index >= 0) {
          scored = true;
          const before = tokenizer.decode(generated.slice(0, -1), { skip_special_tokens: true });
          const rest = text.slice(before.length, index + marker.length);
          const result = await actionDistribution(names, rest, here, cache, lastPosition);
          self.postMessage({ type: 'actions', id: activeId, ...result });
        }
      }
      if (i % 4 === 0 || i === cap - 1) {
        self.postMessage({ type: 'tokens', id: activeId, text: tokenizer.decode(generated, { skip_special_tokens: true }),
          tokens: generated.length, tokensPerSecond: generated.length / Math.max(0.001, (performance.now() - decodeStart) / 1000) });
      }
      if (i === cap - 1) { capHit = true; break; }
      lastPosition += 1;
      logits = await forward([token], [[lastPosition], [lastPosition], [lastPosition]], new Float32Array(1), zeros, zeros, zeros);
      // Give the cancel message an opportunity to interrupt the decode loop.
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    const text = generated.length ? tokenizer.decode(generated, { skip_special_tokens: true }) : '';
    output = { type: 'result', id: activeId, text, tokens: generated.length, seconds: (performance.now() - started) / 1000,
      cancelled, capHit: capHit && !finished };
    output.answer = readAnswer(generated, table, names, manifest.memory?.chars ?? 300);
  } finally {
    tensors.forEach((t) => t.dispose?.());
    cache.forEach((t) => t.dispose?.());
    activeId = null;
  }
  self.postMessage(output);
}

self.onmessage = ({ data }) => {
  if (data.type === 'cancel') { if (data.id === activeId) cancelled = true; return; }
  const task = data.type === 'load' ? load(data.directory) : data.type === 'generate' ? generate(data) : Promise.reject(new Error('Unknown model command'));
  task.catch((error) => self.postMessage({ type: 'error', id: data.id ?? null, message: error.stack || String(error) }));
};

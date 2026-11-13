import * as ort from "./vendor/ort.wasm.min.mjs";
import { Tokenizer } from "./vendor/tokenizers.mjs";
import { compressed } from "./shop.js";

ort.env.wasm.numThreads = 1;
ort.env.wasm.wasmPaths = new URL("./vendor/", import.meta.url).href;
let session,
  tok,
  meta,
  seeds,
  active = null,
  cancel = false;
const send = (type, other = {}) => postMessage({ type, ...other });
const pause = () => new Promise((r) => setTimeout(r, 0));
async function json(path) {
  const r = await fetch(path);
  if (!r.ok) throw Error("Could not load " + path);
  return r.json();
}
async function load(directory = "model") {
  const [m, t, c, s] = await Promise.all([
    json(directory + "/manifest.json"),
    json(directory + "/tokenizer.json"),
    json(directory + "/tokenizer_config.json"),
    compressed("assets/sampling.bin.gz"),
  ]);
  meta = m;
  tok = new Tokenizer(t, c);
  seeds = new DataView(await s.arrayBuffer());
  const r = await fetch(directory + "/decoder.onnx");
  if (!r.ok) throw Error("Weights unavailable");
  const reader = r.body.getReader(),
    bytes = new Uint8Array(m.bytes);
  let pos = 0;
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    bytes.set(part.value, pos);
    pos += part.value.length;
    send("loading", { progress: Math.round((100 * pos) / m.bytes) });
  }
  const hash = Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
    (x) => x.toString(16).padStart(2, "0"),
  ).join("");
  if (hash !== m.onnx_sha256) throw Error("Checkpoint checksum mismatch");
  session = await ort.InferenceSession.create(bytes, {
    executionProviders: ["wasm"],
  });
  send("ready");
}
const mask64 = (1n << 64n) - 1n,
  mask128 = (1n << 128n) - 1n;
function rng(goal, step) {
  const at = (goal * 50 + step) * 32;
  const u128 = (i) =>
    seeds.getBigUint64(i, true) + (seeds.getBigUint64(i + 8, true) << 64n);
  let state = u128(at);
  const inc = u128(at + 16);
  return () => {
    state = (state * 47026247687942121848144207491837523525n + inc) & mask128;
    const hi = state >> 64n,
      x = (hi ^ state) & mask64,
      rot = hi >> 58n;
    return (
      Number((((x >> rot) | (x << ((64n - rot) & 63n))) & mask64) >> 11n) /
      9007199254740992
    );
  };
}
function sample(logits, greedy, draw) {
  let best = 0;
  for (let i = 1; i < logits.length; i++)
    if (logits[i] > logits[best]) best = i;
  if (greedy) return best;
  const mass = new Float64Array(logits.length);
  let sum = 0;
  for (let i = 0; i < logits.length; i++) {
    sum += Math.exp(logits[i] - logits[best]);
    mass[i] = sum;
  }
  let lo = 0,
    hi = mass.length - 1;
  const target = draw() * sum;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (mass[mid] >= target) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
function promptIds(m) {
  const h = m.history.slice(-4),
    encode = (text) => tok.encode(text, { add_special_tokens: false }).ids;
  const render = (obs) =>
    [
      m.rules,
      "\nRecent history:",
      ...h.flatMap((x) => [
        "Observation: " + x.observation,
        "Action: " + x.action,
      ]),
      "\nCurrent observation:",
      obs,
      "\nResponse:\n",
    ].join("\n");
  let ids = encode(render(m.observation));
  while (h.length && ids.length + meta.response_cap > meta.context) {
    h.shift();
    ids = encode(render(m.observation));
  }
  if (ids.length >= meta.context) {
    const keep =
      m.observation.match(
        /^[\s\S]*?Instruction:\s*\[SEP\][\s\S]*?\[SEP\]/,
      )?.[0] || "";
    const body = m.observation.slice(keep.length),
      marker = "\n[Page text omitted to fit context]\n";
    let n = body.length;
    do {
      n = Math.floor(n * 0.8);
      const k = Math.ceil(n * 0.75);
      ids = encode(
        render(
          keep + body.slice(0, k) + marker + (n > k ? body.slice(k - n) : ""),
        ),
      );
    } while (ids.length > meta.context - meta.response_cap && n > 0);
  }
  return ids;
}
async function generate(m) {
  active = m.id;
  cancel = false;
  let cache = [],
    out;
  for (let i = 0; i < meta.layers * 2; i++)
    cache.push(
      new ort.Tensor("float32", new Float32Array(0), [
        1,
        meta.kv_heads,
        0,
        meta.head_dim,
      ]),
    );
  async function forward(ids) {
    const tensor = new ort.Tensor("int64", BigInt64Array.from(ids, BigInt), [
        1,
        ids.length,
      ]),
      feeds = { input_ids: tensor };
    for (let i = 0; i < meta.layers; i++) {
      feeds["past_key_" + i] = cache[2 * i];
      feeds["past_value_" + i] = cache[2 * i + 1];
    }
    try {
      const result = await session.run(feeds);
      cache.forEach((t) => t.dispose());
      cache = [];
      for (let i = 0; i < meta.layers; i++)
        cache.push(result["present_key_" + i], result["present_value_" + i]);
      out?.dispose();
      out = result.logits;
    } finally {
      tensor.dispose();
    }
  }
  try {
    if (m.type === "verify") {
      const ids = tok.encode(m.phrase, { add_special_tokens: false }).ids;
      await forward(ids.slice(0, 5));
      await forward(ids.slice(5));
      send("verified", { ids, logits: Array.from(out.data) });
      return;
    }
    const ids = promptIds(m),
      cap = Math.min(meta.response_cap, meta.context - ids.length),
      generated = [],
      draw = rng(m.goal, m.step);
    for (let i = 0; i < ids.length && !cancel; i += 96) {
      await forward(ids.slice(i, i + 96));
      await pause();
    }
    let text = "",
      ended = false;
    for (let i = 0; i < cap && !cancel; i++) {
      const token = sample(out.data, m.greedy, draw);
      if (token === meta.eos) {
        ended = true;
        break;
      }
      generated.push(token);
      if (i % 5 === 0) {
        text = tok.decode(generated, {
          skip_special_tokens: true,
          clean_up_tokenization_spaces: false,
        });
        send("tokens", { id: m.id, text, count: generated.length });
        await pause();
      }
      if (i + 1 < cap) await forward([token]);
    }
    text = generated.length
      ? tok.decode(generated, {
          skip_special_tokens: true,
          clean_up_tokenization_spaces: false,
        })
      : "";
    send("result", {
      id: m.id,
      text,
      count: generated.length,
      cancelled: cancel,
      capped: !ended && generated.length === cap,
    });
  } finally {
    out?.dispose();
    cache.forEach((t) => t.dispose());
    active = null;
  }
}
self.onmessage = ({ data: m }) => {
  if (m.type === "stop") {
    cancel = true;
    return;
  }
  if (active !== null) return;
  (m.type === "load" ? load(m.directory) : generate(m)).catch((e) =>
    send("error", { message: e.message, id: m.id }),
  );
};

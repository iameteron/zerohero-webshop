// The memory student's prompt and carried memory as token ids, as PPO trained it
// (ZeroHero zerohero.rl.crafter_memory_tokens.MemoryTokens): the prompt joins fixed token pieces from the manifest
// (`memory_prompt`) around the achievements, and the memory is the model's own answer tokens, not its text encoded
// again. Encoding the text again gives the same text with different tokens at the memory's edges, which the student
// never saw in training (its answers broke more often).

const WHITESPACE = new Set([32, 9, 10, 13, 11, 12, 28, 29, 30, 31]);  // what Python's str.strip() removes from ASCII
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// GPT-2 byte-level alphabet: each byte is written as one printable character in the tokenizer's vocabulary.
function byteAlphabet() {
  const bytes = [];
  for (let b = 33; b <= 126; b += 1) bytes.push(b);
  for (let b = 161; b <= 172; b += 1) bytes.push(b);
  for (let b = 174; b <= 255; b += 1) bytes.push(b);
  const chars = bytes.map((b) => String.fromCodePoint(b));
  let extra = 0;
  for (let b = 0; b < 256; b += 1) {
    if (!bytes.includes(b)) { bytes.push(b); chars.push(String.fromCodePoint(256 + extra)); extra += 1; }
  }
  return new Map(chars.map((c, i) => [c, bytes[i]]));
}

// Bytes of every token id (special tokens: none) and the id of each single-byte token, from tokenizer.json.
export function tokenTable(tokenizerJson) {
  const alphabet = byteAlphabet();
  const special = new Set(tokenizerJson.added_tokens.filter((t) => t.special).map((t) => t.id));
  const size = Math.max(...Object.values(tokenizerJson.model.vocab), ...tokenizerJson.added_tokens.map((t) => t.id)) + 1;
  const bytes = Array.from({ length: size }, () => new Uint8Array(0));
  const single = new Int32Array(256).fill(-1);
  for (const [token, id] of Object.entries(tokenizerJson.model.vocab)) {
    if (special.has(id)) continue;
    bytes[id] = Uint8Array.from(Array.from(token, (c) => alphabet.get(c)));
    if (bytes[id].length === 1) single[bytes[id][0]] = id;
  }
  return { bytes, single };
}

// Prompt ids for the achievements done (names) and the carried memory tokens; a memory that would make the prompt
// longer than the training width is dropped, as in training (the prompt then shows an empty memory).
export function memoryPrompt(spec, achievements, memory) {
  const done = new Set(achievements);
  const chosen = spec.achievements.filter(([name]) => done.has(name));
  const ach = chosen.length ? chosen.flatMap(([, first, later], i) => (i === 0 ? first : later)) : spec.none;
  const build = (tokens) => [...spec.prefix, ...ach, ...spec.middle, ...(tokens.length ? tokens : spec.empty), ...spec.suffix];
  const ids = build(memory);
  return ids.length > spec.width && memory.length ? build([]) : ids;
}

function find(text, pattern, from) {
  outer: for (let i = Math.max(0, from); i + pattern.length <= text.length; i += 1) {
    for (let j = 0; j < pattern.length; j += 1) if (text[i + j] !== pattern[j]) continue outer;
    return i;
  }
  return -1;
}

// The answer read as training reads it: the first <action> holding (between whitespace) one of `actions`, then the
// first <memory>...</memory> after it, stripped and cut to `chars` characters. Returns { action, memory (token ids),
// memoryText }, or null for an invalid answer (played as Noop, the old memory kept). Memory tokens are the answer's
// own tokens inside the memory; a token that straddles its edge gives its bytes inside as single-byte tokens.
export function readAnswer(tokens, table, actions, chars = 300) {
  const parts = tokens.map((t) => table.bytes[t] || new Uint8Array(0));
  const starts = [];
  let total = 0;
  for (const part of parts) { starts.push(total); total += part.length; }
  const text = new Uint8Array(total);
  parts.forEach((part, i) => text.set(part, starts[i]));
  const [open, close, memoryOpen, memoryClose] = ['<action>', '</action>', '<memory>', '</memory>'].map((s) => encoder.encode(s));
  const names = new Map(actions.map((name) => [name, name]));
  let action = null;
  let after = -1;
  for (let at = find(text, open, 0); at >= 0; at = find(text, open, at + 1)) {
    const end = find(text, close, at + open.length);
    if (end < 0) break;
    let a = at + open.length;
    let b = end;
    while (a < b && WHITESPACE.has(text[a])) a += 1;
    while (b > a && WHITESPACE.has(text[b - 1])) b -= 1;
    const name = decoder.decode(text.subarray(a, b));
    if (names.has(name)) { action = name; after = end + close.length; break; }
  }
  if (action === null) return null;
  const blockOpen = find(text, memoryOpen, after);
  if (blockOpen < 0) return null;
  const blockClose = find(text, memoryClose, blockOpen + memoryOpen.length);
  if (blockClose < 0) return null;
  let low = blockOpen + memoryOpen.length;
  let high = blockClose;
  while (low < high && WHITESPACE.has(text[low])) low += 1;
  while (high > low && WHITESPACE.has(text[high - 1])) high -= 1;
  let count = 0;  // the character limit counts UTF-8 characters
  for (let i = low; i < high; i += 1) {
    if ((text[i] & 0xc0) !== 0x80) {
      count += 1;
      if (count > chars) { high = i; break; }
    }
  }
  const memory = [];
  tokens.forEach((token, i) => {
    const s = starts[i];
    const e = s + parts[i].length;
    if (s >= low && e <= high && e > s) memory.push(token);
    else if (s < high && e > low) {
      for (let b = Math.max(s, low); b < Math.min(e, high); b += 1) if (table.single[text[b]] >= 0) memory.push(table.single[text[b]]);
    }
  });
  return { action, memory, memoryText: decoder.decode(text.subarray(low, high)) };
}

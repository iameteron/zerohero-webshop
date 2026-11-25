import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { memoryPrompt, readAnswer, tokenTable } from '../src/memory-tokens.js';

// Expected values from the training code (ZeroHero scripts/make_wasm_memory_fixture.py: MemoryTokens.parse and
// MemoryTokens.prompts on the same tokenizer).
const fixture = JSON.parse(await readFile(new URL('./fixtures/memory-tokens.json', import.meta.url), 'utf8'));
const tokenizer = JSON.parse(await readFile(new URL('../assets/models/vision-memory/tokenizer.json', import.meta.url), 'utf8'));
const table = tokenTable(tokenizer);

test('answers are read as in training: action, memory tokens, invalid answers', () => {
  for (const expected of fixture.answers) {
    const got = readAnswer(expected.tokens, table, fixture.actions);
    if (expected.action === null) {
      assert.equal(got, null);
    } else {
      assert.equal(got.action, expected.action);
      assert.deepEqual(got.memory, expected.memory);
    }
  }
});

test('prompts join the training pieces with the carried memory tokens', () => {
  for (const expected of fixture.prompts) {
    assert.deepEqual(memoryPrompt(fixture.memory_prompt, expected.achievements, expected.memory), expected.ids);
  }
});

test('a memory that would not fit is dropped, as in training', () => {
  const spec = fixture.memory_prompt;
  const long = Array(spec.width).fill(spec.empty[0]);
  assert.deepEqual(memoryPrompt(spec, [], long), memoryPrompt(spec, [], []));
});

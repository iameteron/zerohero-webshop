import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { ResponseView, parseBlocks } from '../src/response-view.js';

globalThis.ResizeObserver = class { observe() {} };

const kinds = (text) => parseBlocks(text).map((block) => [block.kind, block.text.trim(), block.open]);

test('a tagged answer splits into reasoning, action and memory, with text outside the tags as other', () => {
  const answer = '<reasoning>\nTree ahead.\n</reasoning>\n<action>Do</action>\n<memory>Wood 1.</memory>\n<memory>again</memory>';
  assert.deepEqual(kinds(answer), [
    ['reasoning', 'Tree ahead.', false], ['action', 'Do', false], ['memory', 'Wood 1.', false], ['memory', 'again', false],
  ]);
  assert.deepEqual(kinds('Sure.\n<reasoning>Go.</reasoning>\n<action>Do</action> done'), [
    ['other', 'Sure.', false], ['reasoning', 'Go.', false], ['action', 'Do', false], ['other', 'done', false],
  ]);
});

test('while streaming the last block stays open and a half-written tag is not shown', () => {
  assert.deepEqual(kinds('<reasoning>\nTree ahead.\n</reas'), [['reasoning', 'Tree ahead.', true]]);
  assert.deepEqual(kinds('<reasoning>Go.</reasoning>\n<act'), [['reasoning', 'Go.', false]]);
});

test('a plain answer splits at its final ACTION line', () => {
  assert.deepEqual(kinds('Wood first.\nACTION: Do'), [['reasoning', 'Wood first.', false], ['action', 'Do', false]]);
  assert.deepEqual(kinds('Still thinking'), [['reasoning', 'Still thinking', true]]);
});

test('the action block shows the action with its probability', () => {
  const { document } = parseHTML('<div class="wrap"><pre id="response"></pre></div>');
  const view = new ResponseView(document.getElementById('response'), document.querySelector('.wrap'));
  view.begin();
  view.append('<reasoning>Go.</reasoning>\n<action>Do</action>\n<memory>m</memory>');
  view.setActions([{ name: 'Do', p: 0.7 }, { name: 'Move West', p: 0.3 }], 1);
  const labels = [...document.querySelectorAll('.response-block-label')].map((el) => el.textContent);
  assert.deepEqual(labels, ['Reasoning', 'Action', 'Memory']);
  const action = () => document.querySelector('.response-block-action .response-block-body').textContent;
  assert.equal(action(), 'Do (70%)');
  view.append('<reasoning>Go.</reasoning>\n<action>Fly</action>');  // not an action: the game plays Noop
  assert.equal(action(), 'Fly');
  view.reset('Manual control.');
  assert.equal(document.getElementById('response').textContent, 'Manual control.');
});

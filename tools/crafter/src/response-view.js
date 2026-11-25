const LABELS = { reasoning: 'Reasoning', action: 'Action', memory: 'Memory', other: 'Other text' };
const TAGGED = /<(reasoning|action|memory)>/g;

/**
 * Split a model answer into blocks: tagged answers ("<reasoning>...</reasoning><action>...</action><memory>...
 * </memory>") by their tags, with any text outside them as "other"; plain answers into the reasoning and the final
 * "ACTION:" line. While streaming, the last block may still be open and a tag may be cut in the middle.
 */
export function parseBlocks(text) {
  const blocks = [];
  const add = (kind, body, open = false) => {
    if (kind === 'other' && !body.trim()) return;
    blocks.push({ kind, text: body, open });
  };
  if (/<(reasoning|action|memory)>/.test(text)) {
    let at = 0;
    while (at < text.length) {
      TAGGED.lastIndex = at;
      const tag = TAGGED.exec(text);
      if (!tag) { add('other', text.slice(at).replace(/<\/?[a-z]*$/, '')); break; }
      add('other', text.slice(at, tag.index));
      const start = tag.index + tag[0].length;
      const close = text.indexOf(`</${tag[1]}>`, start);
      if (close < 0) { add(tag[1], text.slice(start).replace(/<\/?[a-z]*$/, ''), true); break; }
      add(tag[1], text.slice(start, close));
      at = close + tag[1].length + 3;
    }
  } else {
    const action = text.lastIndexOf('ACTION:');
    if (action < 0) {
      add('reasoning', text, true);
    } else {
      add('reasoning', text.slice(0, action));
      add('action', text.slice(action + 'ACTION:'.length));
    }
  }
  return blocks;
}

/** Render real model updates as reasoning, action, memory and other blocks; the action with its probability. */
export class ResponseView {
  constructor(element, container) {
    this.element = element;
    this.container = container;
    this.document = element.ownerDocument;
    this.text = '';
    this.follow = true;
    this.onScroll = () => { this.follow = this.atBottom(); };
    container.addEventListener('scroll', this.onScroll, { passive: true });
    // Resizing does not fire scroll events; keep the latest line in view.
    new ResizeObserver(() => {
      if (this.follow) container.scrollTop = container.scrollHeight;
    }).observe(container);
  }

  atBottom() {
    return this.container.scrollHeight - this.container.clientHeight - this.container.scrollTop < 28;
  }

  update(render) {
    const follow = this.follow || this.atBottom();
    const position = this.container.scrollTop;
    render();
    this.container.scrollTop = follow ? this.container.scrollHeight : position;
    this.follow = follow;
  }

  begin() {
    this.text = '';
    this.actions = null;
    this.follow = true;
    this.element.replaceChildren();
    this.element.classList.add('active', 'response-streaming');
    this.container.classList.add('is-streaming');
    this.container.scrollTop = 0;
  }

  append(fullText) {
    const next = String(fullText ?? '');
    if (next === this.text) return;
    this.text = next;
    this.update(() => this.render());
  }

  /** The probability of each action name where the answer started its action ({name, p}, best first). */
  setActions(actions, mass) {
    this.actions = actions;
    this.mass = mass;
    this.update(() => this.render());
  }

  render() {
    const fragment = this.document.createDocumentFragment();
    for (const block of parseBlocks(this.text)) {
      const section = this.document.createElement('div');
      section.className = `response-block response-block-${block.kind}`;
      const label = this.document.createElement('div');
      label.className = 'response-block-label';
      label.textContent = LABELS[block.kind];
      const body = this.document.createElement('div');
      body.className = 'response-block-body';
      this.appendInline(body, block.text.trim());
      if (block.kind === 'action') this.appendProbability(body, block.text.trim());
      section.append(label, body);
      fragment.append(section);
    }
    this.element.replaceChildren(fragment);
  }

  /** The model's probability of the action written in the answer, after its name (nothing for a name that is not an
   * action: the game plays Noop then). */
  appendProbability(body, written) {
    const action = this.actions?.find((a) => a.name === written);
    if (!action) return;
    const p = action.p < 0.001 ? '<0.1%' : `${(100 * action.p).toFixed(action.p < 0.1 ? 1 : 0)}%`;
    body.append(this.document.createTextNode(` (${p})`));
  }

  appendInline(parent, text) {
    // Support a small, safe Markdown subset. Model text never becomes HTML.
    let position = 0;
    for (const match of text.matchAll(/\*\*([^*\n]+)\*\*/g)) {
      parent.append(this.document.createTextNode(text.slice(position, match.index)));
      const strong = this.document.createElement('strong');
      strong.textContent = match[1];
      parent.append(strong);
      position = match.index + match[0].length;
    }
    parent.append(this.document.createTextNode(text.slice(position)));
  }

  finish(fullText) {
    this.text = String(fullText ?? '');
    this.update(() => this.render());
    this.stopStreaming();
  }

  reset(text) {
    this.text = String(text ?? '');
    this.actions = null;
    this.follow = true;
    this.element.textContent = this.text;
    this.element.classList.remove('active');
    this.stopStreaming();
    this.container.scrollTop = 0;
  }

  stopStreaming() {
    this.element.classList.remove('response-streaming');
    this.container.classList.remove('is-streaming');
  }
}

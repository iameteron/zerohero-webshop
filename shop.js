import { stemmer } from "./vendor/stemmer.mjs";

const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );
export async function compressed(path) {
  const response = await fetch(path);
  if (!response.ok)
    throw Error("Could not load " + path + " (" + response.status + ")");
  const bytes = await response.arrayBuffer();
  if (new Uint8Array(bytes)[0] !== 31) return new Response(bytes);
  return new Response(
    new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip")),
  );
}
export function ranked(data, query) {
  const q = query.toLowerCase().trim();
  if (q.startsWith("<c> ") || q.startsWith("<q> ") || q.startsWith("<a> ")) {
    const [prefix, ...words] = q.split(/\s+/),
      term = words.join(" ");
    return data.catalog.flatMap((p, i) =>
      (
        prefix === "<c>"
          ? p.category === term
          : prefix === "<q>"
            ? p.query === term
            : p.attributes.includes(term)
      )
        ? [i]
        : [],
    );
  }
  if (q === "<r>") {
    const all = data.catalog.map((_, i) => i);
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all.slice(0, 50);
  }
  const scores = new Map();
  for (const word of q.match(/[\p{L}\p{N}]+(?:['’.,][\p{L}\p{N}]+)*/gu) || []) {
    const terms = Object.hasOwn(data.norm, word)
      ? data.norm[word]
      : [stemmer(word)];
    for (const term of terms) {
      if (!Object.hasOwn(data.scores, term)) continue;
      for (const [i, weight] of data.scores[term])
        scores.set(i, (scores.get(i) || 0) + weight);
    }
  }
  return [...scores.keys()]
    .sort(
      (a, b) =>
        Math.fround(scores.get(b)) - Math.fround(scores.get(a)) ||
        (data.catalog[a].asin < data.catalog[b].asin ? -1 : 1),
    )
    .slice(0, 50);
}
export class Store {
  constructor(data, id) {
    this.data = data;
    this.id = id;
    this.task = data.tasks[id];
    this.steps = 0;
    this.history = [];
    this.reward = 0;
    this.resetSearch();
  }
  resetSearch() {
    this.page = "search";
    this.hits = [];
    this.number = 1;
    this.product = null;
    this.options = {};
  }
  get item() {
    return this.product === null ? null : this.data.catalog[this.product];
  }
  markup() {
    const d = this.data,
      p = this.item;
    if (this.page === "done")
      return (
        '<div class="container text-center"><div id="thankyou"><h1>Thank you for shopping with us!</h1></div><h3>Your score (min 0.0, max 1.0)</h3><pre>' +
        this.reward.toFixed(3) +
        "</pre><p>" +
        escape(p.title) +
        "</p><p>" +
        Object.values(this.options).map(escape).join(" · ") +
        "</p></div>"
      );
    let source;
    if (this.page === "search") source = d.search;
    else if (this.page === "results") {
      const cards = this.hits
        .slice((this.number - 1) * 10, this.number * 10)
        .map((i) => {
          const x = d.catalog[i];
          return d.card
            .replace("https://example.invalid/", () => escape(x.image))
            .replace("__ASIN__", () => escape(x.asin))
            .replace("__TITLE__", () => escape(x.title))
            .replace("__PRICE__", () => escape(x.price));
        })
        .join("");
      source = d.shell[this.number === 1 ? 1 : 2]
        .replace(/<template id="cards"><\/template>/, () => cards)
        .replace("__PAGE__", this.number)
        .replace("__TOTAL__", this.hits.length);
    } else source = p.pages[this.page];
    return source.replaceAll("__TASK__", () => escape(this.task.text));
  }
  frame() {
    const doc = new DOMParser().parseFromString(this.markup(), "text/html");
    for (const node of doc.querySelectorAll(
      "script,style,link,base,iframe,object,embed",
    ))
      node.remove();
    for (const n of doc.body.querySelectorAll("*")) {
      for (const a of [...n.attributes])
        if (
          a.name.startsWith("on") ||
          ["href", "action", "data-url", "srcset", "formaction"].includes(
            a.name,
          )
        )
          n.removeAttribute(a.name);
      if (n.tagName === "IMG") {
        if (!/^https?:\/\//i.test(n.getAttribute("src") || ""))
          n.removeAttribute("src");
        n.alt = "Product photo";
        n.loading = "lazy";
        n.referrerPolicy = "no-referrer";
      }
    }
    const image = doc.querySelector("#product-image");
    for (const radio of doc.querySelectorAll("input[type=radio]")) {
      if (
        this.options[radio.name.toLowerCase()] === radio.value.toLowerCase()
      ) {
        radio.setAttribute("checked", "");
        const mapped = this.item.optionImages[radio.value];
        if (image && /^https?:\/\//i.test(mapped || "")) image.src = mapped;
      }
    }
    const parts = [],
      walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const text = walker.currentNode.textContent.trim();
      if (text) parts.push(text);
    }
    const choices = new Map();
    for (const n of doc.querySelectorAll(
      ".btn,.product-link,input[type=radio]",
    )) {
      const value = n.type === "radio" ? n.value : n.textContent.trim();
      n.dataset.choice = value;
      if (n.matches(".product-link")) n.setAttribute("href", "#");
      choices.set(
        value.toLowerCase(),
        n.type === "radio" ? n.name.toLowerCase() : null,
      );
    }
    return { html: doc.body.innerHTML, text: parts.join(" [SEP] "), choices };
  }
  apply(action, frame) {
    const m = /^(search|click)\[([^\]\n]*)\]$/.exec(action),
      value = m?.[2].toLowerCase();
    let valid = false;
    if (m?.[1] === "search" && value?.includes("[")) {
      valid = true; // Native parser splits nested brackets at the last opening bracket.
    } else if (m?.[1] === "search" && value?.length) {
      this.resetSearch();
      this.page = "results";
      this.hits = ranked(this.data, value);
      valid = true;
    } else if (m?.[1] === "click" && frame.choices.has(value)) {
      valid = true;
      if (value === "back to search") this.resetSearch();
      else if (value === "next >") {
        this.number++;
        this.product = null;
        this.options = {};
      } else if (value === "< prev") {
        if (this.page === "results") this.number = Math.max(1, this.number - 1);
        else if (this.page === "item") {
          this.page = "results";
          this.options = {};
          this.product = null;
        } else this.page = "item";
      } else if (value === "buy now") {
        const chosen = Object.values(this.options);
        const matches = this.task.optionKeys.filter((k) =>
          chosen.some((v) => this.data.optionMatches[k].includes(v)),
        ).length;
        this.reward =
          ((this.task.matched[this.product] + matches) / this.task.divisor) *
          this.data.types[this.task.kind][this.product];
        this.page = "done";
      } else if (this.page === "results") {
        const product = this.hits.find(
          (i) => this.data.catalog[i].asin.toLowerCase() === value,
        );
        if (product !== undefined) {
          this.product = product;
          this.page = "item";
          this.options = {};
        }
      } else if (this.page === "item" && frame.choices.get(value) !== null)
        this.options[frame.choices.get(value)] = value;
      else if (
        this.page === "item" &&
        ["description", "features", "reviews"].includes(value)
      )
        this.page = value === "reviews" ? "review" : value;
    }
    this.history.push({ observation: frame.text, action });
    this.steps++;
    return valid;
  }
}

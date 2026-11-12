import { compressed, Store } from "./shop.js";

const el = (id) => document.getElementById(id);
const iframe = el("store"),
  log = el("log");
let data,
  store,
  frame,
  worker,
  pending,
  entry,
  request = 0;
let ready = false,
  continuous = false;
const atEnd = () => store?.page === "done" || store?.steps >= 50;

function status(message) {
  el("status").textContent = message;
  el("status").hidden = message === "Ready";
}
function controls() {
  const busy = Boolean(pending) || continuous;
  for (const key of ["step", "run"])
    el(key).disabled = !ready || !store || busy || atEnd();
  el("stop").disabled = !busy;
  el("goal").disabled = !data;
  el("reset").disabled = !data;
  el("policy").disabled = busy;
}
function draw() {
  frame = store.frame();
  const doc = iframe.contentDocument;
  if (!doc.documentElement.lang) {
    doc.addEventListener("pointerdown", () => { el("settings").open = false; });
    doc.documentElement.lang = "en";
    for (const name of ["bootstrap.min", "native", "store"]) {
      const link = doc.createElement("link");
      link.rel = "stylesheet";
      link.href = new URL("assets/" + name + ".css", location.href);
      doc.head.append(link);
    }
    function doAction(action) {
      if (pending || continuous || atEnd()) return;
      entry = addEntry("Manual");
      act(action);
      entry = null;
    }
    doc.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = event.target.querySelector("[name=search_query]");
      if (input?.value.trim()) doAction("search[" + input.value.trim() + "]");
    });
    doc.addEventListener("click", (event) => {
      const button = event.target.closest("[data-choice]");
      if (!button || button.closest("#form-buscar")) return;
      event.preventDefault();
      doAction("click[" + button.dataset.choice + "]");
    });
    // Sandboxed forms cannot submit natively. Handle both keyboard and pointer search.
    function search(event) {
      const form = event.target.closest("#form-buscar");
      if (!form) return;
      event.preventDefault();
      const q = form.querySelector("input").value.trim();
      if (q) doAction("search[" + q + "]");
    }
    doc.addEventListener("click", (event) => {
      if (event.target.closest("#form-buscar button")) search(event);
    });
    doc.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && event.target.matches("#form-buscar input"))
        search(event);
    });
  }
  doc.body.innerHTML = frame.html;
  doc.scrollingElement.scrollTop = 0;
  el("steps").textContent = "Step " + store.steps + " / 50";
  el("score").hidden = store.page !== "done";
  el("score").textContent = "Reward " + Number(store.reward.toFixed(3));
  controls();
}
function addEntry(owner) {
  log.querySelector(".empty")?.remove();
  el("action").hidden = true;
  if (log.lastElementChild) log.lastElementChild.open = false;
  const details = document.createElement("details");
  details.open = true;
  details.className = "decision";
  const summary = document.createElement("summary"),
    note = document.createElement("p"),
    code = document.createElement("code");
  summary.textContent = owner + " · Step " + (store.steps + 1);
  details.append(summary, note, code);
  log.append(details);
  log.scrollTop = log.scrollHeight;
  return { summary, note, code };
}
function displayOutput(text) {
  const at = text.toUpperCase().lastIndexOf("ACTION:");
  if (text && !pending?.cancel) el("status").hidden = true;
  entry.note.textContent = at < 0 ? text : text.slice(0, at).trim();
  entry.code.textContent = at < 0 ? "" : text.slice(at + 7).trim();
}
function act(action) {
  const valid = store.apply(action, frame);
  entry.code.textContent = action || "(no action)";
  if (!valid) entry.summary.textContent += " · invalid action";
  el("last-action").textContent = entry.code.textContent + (valid ? "" : " (invalid)");
  el("action").hidden = false;
  draw();
  if (atEnd()) {
    continuous = false;
    status(
      store.page === "done"
        ? "Purchase complete"
        : "Step limit reached",
    );
  } else if (!continuous)
    status(ready ? "Ready" : el("status").textContent);
  controls();
}
function stop() {
  continuous = false;
  if (pending) {
    pending.cancel = true;
    worker.postMessage({ type: "stop" });
    status("Stopping…");
  } else if (ready) status("Paused");
  controls();
}
function reset() {
  if (pending || continuous) stop();
  store = new Store(data, Number(el("goal").value));
  entry = null;
  log.innerHTML =
    '<p class="empty">Press Run to start, or Step for one decision.</p>';
  el("action").hidden = true;
  if (ready) status("Ready");
  draw();
}
function generate() {
  if (pending || atEnd() || !ready) {
    continuous = false;
    controls();
    return;
  }
  entry = addEntry("Agent");
  pending = { id: ++request, store, cancel: false };
  worker.postMessage({
    type: "generate",
    id: request,
    rules: data.instructions,
    history: store.history,
    observation: frame.text,
    goal: store.id,
    step: store.steps,
    greedy: el("policy").value === "greedy",
  });
  status("Generating decision…");
  controls();
}
function fail(message) {
  pending = null;
  continuous = false;
  ready = false;
  status(message);
  el("retry").hidden = false;
  controls();
}
function initWorker() {
  worker?.terminate();
  ready = false;
  el("retry").hidden = true;
  status("Loading model…");
  controls();
  worker = new Worker(new URL("./worker.js", import.meta.url), {
    type: "module",
  });
  worker.onerror = (e) => fail(e.message || "Model worker failed");
  worker.onmessage = ({ data: m }) => {
    if (m.type === "loading") {
      status(
        m.progress === 100
          ? "Starting inference engine…"
          : "Loading model · " + m.progress + "%",
      );
      return;
    }
    if (m.type === "ready") {
      ready = true;
      status("Ready");
      controls();
      return;
    }
    if (m.type === "error") {
      fail(m.message || "Model inference failed");
      return;
    }
    if (!pending || pending.id !== m.id) return;
    const current = !pending.cancel && pending.store === store;
    if (m.type === "tokens") {
      if (current && entry) displayOutput(m.text);
      return;
    }
    if (m.type !== "result") return;
    pending = null;
    if (!current || m.cancelled) {
      if (entry) {
        entry.summary.textContent += " · paused";
        entry = null;
      }
      status("Paused");
      controls();
      return;
    }
    displayOutput(m.text);
    const tail = m.text.split("ACTION:").at(-1).trim();
    const action = /^(?:search|click)\[[^\]\n]*\]$/.test(tail)
      ? tail
      : "invalid[]";
    act(action);
    entry = null;
    if (continuous && !atEnd())
      setTimeout(() => {
        if (continuous && !pending) generate();
      }, 200);
  };
  worker.postMessage({ type: "load" });
}
const settings = el("settings");
document.addEventListener("pointerdown", (event) => {
  if (!settings.contains(event.target)) settings.open = false;
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && settings.open) {
    settings.open = false;
    settings.querySelector("summary").focus();
  }
});
el("history").onchange = (event) => {
  log.classList.toggle("history", event.target.checked);
  log.lastElementChild?.scrollIntoView({ block: "nearest" });
};
el("goal").onchange = reset;
el("reset").onclick = reset;
el("step").onclick = generate;
el("run").onclick = () => {
  continuous = true;
  generate();
};
el("stop").onclick = stop;
el("retry").onclick = () => {
  if (!data) location.reload();
  else initWorker();
};
initWorker();
try {
  data = await (await compressed("assets/shop.json.gz")).json();
  for (let i = 0; i < data.tasks.length; i++)
    el("goal").add(new Option("#" + i, i));
  reset();
} catch (e) {
  worker.terminate();
  fail(e.message);
}

import { compressed, Store } from "./shop.js";

const el = (id) => document.getElementById(id);
const iframe = el("store");
const dialog = el("task-dialog");
let renderVersion = 0;
let data, store, worker, pending;
let timeline = [],
  cursor = 0,
  request = 0;
let ready = false,
  continuous = false,
  modelStatus = "Loading model…";
const manual = () => el("mode").value === "manual";
const live = () => cursor === timeline.length - 1;
const ended = () => store?.page === "done" || store?.steps >= 50;
const mayInteract = () => Boolean(store && manual() && live() && !ended());

function controls() {
  const busy = Boolean(pending) || continuous;
  for (const key of ["step", "run", "stop"]) el(key).hidden = manual();
  for (const key of ["step", "run"])
    el(key).disabled = !store || !ready || busy || !live() || ended();
  el("stop").disabled = !busy;
  el("goal").disabled = el("reset").disabled = !store;
  el("prev-task").disabled = !store || store.id === 0;
  el("next-task").disabled = !store || store.id === data.tasks.length - 1;
  el("back").disabled = cursor === 0;
  el("forward").disabled = !store || live();
  el("latest").hidden = !store || live();
  el("policy").disabled = busy;
  const message = !data
    ? catalogError || "Loading catalog…"
    : manual() && store && !live()
      ? "Recorded step. Choose Latest to continue shopping."
      : !manual() && !ready
        ? modelStatus
        : !manual() && live() && pending && !pending.cancel && !pending.text
          ? "Generating decision…"
          : "";
  el("status").textContent = message;
  el("status").hidden = !message;
  el("retry").hidden = !catalogError && (manual() || !modelError);
}

function trace(text, action, actor) {
  el("log").textContent = text;
  el("action").hidden = !action;
  el("actor").textContent = actor === "Manual" ? "Manual action" : "Action";
  el("last-action").textContent = action;
}

function showStep(index) {
  cursor = index;
  const step = timeline[index];
  paintStore();
  el("steps").textContent = "Step " + index + " / " + (timeline.length - 1);
  el("steps").title = "Selected step / recorded steps (episode limit 50)";
  el("score").hidden = step.reward === null;
  el("score").textContent =
    step.reward === null ? "" : "Reward " + Number(step.reward.toFixed(3));
  const hint =
    !index && live()
      ? manual()
        ? "Type a query in the store to start shopping."
        : "Press Run to start, or Step for one decision."
      : "";
  trace(step.reason || hint, step.action, step.actor);
  el("log").scrollTop = 0;
  controls();
}

function record(action, reason, actor) {
  const valid = store.apply(action, timeline.at(-1).frame);
  timeline.push({
    frame: store.frame(),
    reason,
    actor,
    action: action + (valid ? "" : " (invalid)"),
    reward: store.page === "done" || store.steps >= 50 ? store.reward : null,
  });
  if (ended()) continuous = false;
  showStep(timeline.length - 1);
}

function stop() {
  continuous = false;
  if (pending && !pending.cancel) {
    pending.cancel = true;
    worker.postMessage({ type: "stop" });
  }
  controls();
}
function review(index) {
  stop();
  showStep(index);
}

function selectTask(id) {
  stop();
  store = new Store(data, id);
  timeline = [
    { frame: store.frame(), reason: "", action: "", actor: "", reward: null },
  ];
  el("goal").textContent = "Task #" + id + " · " + store.task.text;
  el("goal").title = store.task.text;
  showStep(0);
}

function listTasks() {
  const term = el("task-filter").value.trim().toLowerCase();
  const rows = document.createDocumentFragment();
  data.tasks.forEach((task, id) => {
    const label = "#" + id + " · " + task.text;
    if (!label.toLowerCase().includes(term)) return;
    const button = document.createElement("button");
    button.textContent = label;
    button.dataset.id = id;
    if (id === store.id) button.setAttribute("aria-current", "true");
    rows.append(button);
  });
  if (!rows.childNodes.length) rows.append("No matching tasks.");
  el("task-list").replaceChildren(rows);
}
el("goal").onclick = () => {
  el("task-filter").value = "";
  listTasks();
  dialog.showModal();
  el("task-list")
    .querySelector("[aria-current]")
    ?.scrollIntoView({ block: "nearest" });
};
el("task-filter").oninput = listTasks;
el("task-list").onclick = (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;
  const id = Number(button.dataset.id);
  dialog.close();
  if (store.id !== id) selectTask(id);
};
el("close-tasks").onclick = () => dialog.close();
el("prev-task").onclick = () => selectTask(store.id - 1);
el("next-task").onclick = () => selectTask(store.id + 1);
el("reset").onclick = () => selectTask(store.id);
el("back").onclick = () => review(cursor - 1);
el("forward").onclick = () => review(cursor + 1);
el("latest").onclick = () => review(timeline.length - 1);
el("mode").onchange = () => {
  stop();
  if (store) showStep(manual() ? timeline.length - 1 : cursor);
};

const settings = el("settings");
function paintStore() {
  if (!store) return;
  // The sandbox gives the child an opaque origin, so address its window directly.
  iframe.contentWindow.postMessage(
    {
      type: "render",
      version: ++renderVersion,
      html: timeline[cursor].frame.html,
      interactive: mayInteract(),
    },
    "*",
  );
}
window.addEventListener("message", ({ source, origin, data: event }) => {
  if (source !== iframe.contentWindow || origin !== "null") return;
  if (event?.type === "store-ready") {
    paintStore();
    return;
  }
  if (event?.version !== renderVersion) return;
  if (event.type === "store-focus") settings.open = false;
  if (
    event.type === "manual-action" &&
    mayInteract() &&
    typeof event.action === "string"
  ) {
    record(event.action, "", "Manual");
  }
});
iframe.contentWindow.postMessage({ type: "connect" }, "*");
document.addEventListener("pointerdown", (event) => {
  if (!settings.contains(event.target)) settings.open = false;
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && settings.open) {
    settings.open = false;
    settings.querySelector("summary").focus();
  }
});

function generate() {
  if (!ready || pending || !live() || ended() || manual()) return;
  pending = { id: ++request, store, cancel: false, text: "" };
  trace("", "", "Agent");
  controls();
  worker.postMessage({
    type: "generate",
    id: request,
    rules: data.instructions,
    history: store.history,
    observation: timeline.at(-1).frame.text,
    goal: store.id,
    step: store.steps,
    greedy: el("policy").value === "greedy",
  });
}
el("step").onclick = generate;
el("run").onclick = () => {
  continuous = true;
  generate();
};
el("stop").onclick = () => {
  stop();
  showStep(cursor);
};

let modelError = false,
  catalogError = "";
function fail(message) {
  modelStatus = message;
  modelError = true;
  ready = continuous = false;
  pending = null;
  controls();
}
function initWorker() {
  worker?.terminate();
  modelError = ready = false;
  modelStatus = "Loading model…";
  controls();
  worker = new Worker(new URL("./worker.js", import.meta.url), {
    type: "module",
  });
  worker.onerror = (e) => fail(e.message || "Model worker failed");
  worker.onmessage = ({ data: m }) => {
    if (m.type === "loading") {
      modelStatus =
        m.progress === 100
          ? "Starting inference engine…"
          : "Loading model · " + m.progress + "%";
      controls();
      return;
    }
    if (m.type === "ready") {
      ready = true;
      controls();
      return;
    }
    if (m.type === "error") {
      fail(m.message || "Model inference failed");
      return;
    }
    if (!pending || pending.id !== m.id) return;
    const current =
      !pending.cancel && pending.store === store && live() && !manual();
    if (m.type === "tokens" && current) {
      pending.text = m.text;
      trace(m.text.split("ACTION:")[0].trim(), "", "Agent");
      controls();
    }
    if (m.type !== "result") return;
    pending = null;
    if (!current || m.cancelled) {
      controls();
      return;
    }
    const tail = m.text.split("ACTION:").at(-1).trim();
    const action = /^(?:search|click)\[[^\]\n]*\]$/.test(tail)
      ? tail
      : "invalid[]";
    const marker = m.text.lastIndexOf("ACTION:");
    record(
      action,
      marker >= 0 ? m.text.slice(0, marker).trim() : m.text,
      "Agent",
    );
    if (continuous)
      setTimeout(() => {
        if (continuous) generate();
      }, 200);
  };
  worker.postMessage({ type: "load" });
}
el("retry").onclick = () => {
  if (catalogError) location.reload();
  else initWorker();
};
initWorker();
try {
  data = await (await compressed("assets/shop.json.gz")).json();
  selectTask(0);
} catch (error) {
  catalogError = error.message;
  controls();
}

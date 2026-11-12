// This frame has an opaque origin. Only the embedding app can provide a storefront.
const appOrigin = new URL(location.href).origin;
let version = 0;
let interactive = false;
function notify(type, fields = {}) {
  parent.postMessage({ type, version, ...fields }, appOrigin);
}
window.addEventListener("message", ({ source, origin, data }) => {
  if (source !== parent || origin !== appOrigin) return;
  if (data?.type === "connect") {
    notify("store-ready");
    return;
  }
  if (data?.type !== "render" || data.version <= version) return;
  version = data.version;
  interactive = data.interactive;
  document.body.innerHTML = data.html;
  document.body.classList.toggle("manual", interactive);
  document.querySelector("#form-buscar .glyphicon")?.remove();
  for (const button of document.querySelectorAll("button")) {
    button.type = "button";
    button.disabled = !interactive;
  }
  for (const input of document.querySelectorAll("input"))
    input.disabled = !interactive;
  if (!interactive) {
    for (const link of document.querySelectorAll("a"))
      link.removeAttribute("href");
  }
  window.scrollTo(0, 0);
});
function search() {
  const query = document.querySelector("#search_input")?.value.trim();
  if (interactive && query)
    notify("manual-action", { action: "search[" + query + "]" });
}
document.addEventListener("pointerdown", () => notify("store-focus"));
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Enter" &&
    !event.isComposing &&
    event.target.matches("#search_input")
  ) {
    event.preventDefault();
    search();
  }
});
document.addEventListener("submit", (event) => {
  event.preventDefault();
  if (event.target.id === "form-buscar") search();
});
document.addEventListener("click", (event) => {
  const target = event.target;
  const choice =
    target.closest("[data-choice]") ||
    target.closest("label")?.control ||
    target.closest(".list-group-item")?.querySelector(".product-link");
  if (!choice) return;
  event.preventDefault();
  if (!interactive) return;
  if (choice.closest("#form-buscar")) search();
  else
    notify("manual-action", { action: "click[" + choice.dataset.choice + "]" });
});
notify("store-ready");

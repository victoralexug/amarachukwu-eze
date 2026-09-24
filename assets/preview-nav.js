/*
  Preview-only helper for the hero designs. Remove the <script> tag that loads this
  file when the site goes live.
  - Adds a small "All designs" pill in the bottom-left corner, linking back to designs.html.
  - Links to pages that aren't built yet show a short note instead of a missing page.
*/
(function () {
  var HOME = "designs.html";
  var BUILT = ["index.html", "designs.html", "hero-2-clean.html"];

  var css =
    ".pv-tab{position:fixed;left:16px;bottom:16px;z-index:9999;display:inline-flex;align-items:center;gap:6px;" +
    "padding:7px 14px;border-radius:999px;background:#16110f;color:#faf8f6;font:500 12px/1.2 Inter,system-ui,sans-serif;" +
    "text-decoration:none;box-shadow:0 6px 16px -8px rgba(0,0,0,.5);transition:background .2s}" +
    ".pv-tab:hover{background:#3a302c}" +
    ".pv-tab:focus-visible{outline:2px solid #c8261c;outline-offset:2px}" +
    ".pv-note{position:fixed;left:50%;bottom:24px;transform:translate(-50%,12px);z-index:9999;display:flex;align-items:center;gap:12px;" +
    "max-width:calc(100% - 32px);padding:10px 10px 10px 18px;border-radius:999px;background:#16110f;color:#faf8f6;" +
    "font:400 14px/1.4 Inter,system-ui,sans-serif;box-shadow:0 16px 32px -12px rgba(0,0,0,.5);opacity:0;pointer-events:none;transition:opacity .25s,transform .25s}" +
    ".pv-note.show{opacity:1;transform:translate(-50%,0);pointer-events:auto}" +
    ".pv-note a{flex-shrink:0;padding:8px 14px;border-radius:999px;background:#c8261c;color:#fff;font-weight:500;text-decoration:none}" +
    "@media (prefers-reduced-motion:reduce){.pv-tab,.pv-note{transition:none}}";

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var tab = document.createElement("a");
  tab.className = "pv-tab";
  tab.href = HOME;
  tab.innerHTML = '<span aria-hidden="true">←</span> All designs';
  document.body.appendChild(tab);

  var note = document.createElement("div");
  note.className = "pv-note";
  note.setAttribute("role", "status");
  note.innerHTML = '<span>That page isn’t built yet.</span><a href="' + HOME + '">All designs</a>';
  document.body.appendChild(note);

  var timer;
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || a.target === "_blank") return;
    var href = a.getAttribute("href");
    if (/^(https?:|mailto:|tel:|#)/i.test(href)) return;
    var file = href.split(/[?#]/)[0].split("/").pop();
    if (BUILT.indexOf(file) !== -1) return;
    e.preventDefault();
    note.classList.add("show");
    clearTimeout(timer);
    timer = setTimeout(function () { note.classList.remove("show"); }, 3500);
  });
})();

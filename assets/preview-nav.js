/*
  Preview-only helper. Remove the <script> tag that loads this file when the site goes live.
  Links to pages that aren't built yet show a short note instead of a missing page.
*/
(function () {
  var BUILT = ["index.html", "about.html", "features.html", "awards.html", "speaking.html", "books.html", "contact.html"];

  var css =
    ".pv-note{position:fixed;left:50%;bottom:24px;transform:translate(-50%,12px);z-index:9999;max-width:calc(100% - 32px);" +
    "padding:12px 20px;border-radius:999px;background:#16110f;color:#faf8f6;font:400 14px/1.4 Inter,system-ui,sans-serif;" +
    "box-shadow:0 16px 32px -12px rgba(0,0,0,.5);opacity:0;pointer-events:none;transition:opacity .25s,transform .25s}" +
    ".pv-note.show{opacity:1;transform:translate(-50%,0)}" +
    "@media (prefers-reduced-motion:reduce){.pv-note{transition:none}}";

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var note = document.createElement("div");
  note.className = "pv-note";
  note.setAttribute("role", "status");
  note.textContent = "That page isn’t built yet.";
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

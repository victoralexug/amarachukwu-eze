// Shared behaviour for the inner pages: menu, letter roll, scroll reveal, footer year, contact form.
document.documentElement.classList.add("js");

// Focus ring for keyboard users only: on with Tab, off with any click or tap
window.addEventListener("keydown", function (e) { if (e.key === "Tab") document.documentElement.classList.add("kbd"); });
window.addEventListener("pointerdown", function () { document.documentElement.classList.remove("kbd"); });

document.addEventListener("DOMContentLoaded", function () {
  // Menu (tablet and mobile): opens from the button as a growing circle; Esc, a link or the button closes it
  (function () {
    var nav = document.querySelector(".nav");
    var menu = document.getElementById("menu");
    if (!nav || !menu) return;
    var btn = nav.querySelector(".menu-btn");
    nav.classList.add("has-menu");

    function isOpen() { return menu.classList.contains("open"); }
    function set(open) {
      if (open === isOpen()) return;
      var r = btn.getBoundingClientRect();
      menu.style.setProperty("--mx", r.left + r.width / 2 + "px");
      menu.style.setProperty("--my", r.top + r.height / 2 + "px");
      menu.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open);
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.documentElement.classList.toggle("menu-open", open);
      if (open && document.documentElement.classList.contains("kbd")) menu.querySelector("a").focus({ preventScroll: true });
    }

    btn.addEventListener("click", function () { set(!isOpen()); });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) {
        set(false);
        btn.focus({ preventScroll: true });
      }
    });
    window.matchMedia("(min-width: 1101px)").addEventListener("change", function (e) { if (e.matches) set(false); });
  })();

  // Letter roll: split the labels of the nav CTA and primary buttons into letters
  document.querySelectorAll(".nav-cta, .btn-primary").forEach(function (a) {
    var node = [].find.call(a.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); });
    if (!node) return;
    var text = node.textContent.trim();
    var wrap = document.createElement("span");
    wrap.className = "roll";
    wrap.setAttribute("aria-hidden", "true");
    text.split("").forEach(function (c, i) {
      var sp = document.createElement("span");
      sp.textContent = c;
      sp.setAttribute("data-c", c);
      sp.style.setProperty("--i", i);
      wrap.appendChild(sp);
    });
    if (!a.hasAttribute("aria-label")) a.setAttribute("aria-label", text);
    a.replaceChild(wrap, node);
    a.insertBefore(document.createTextNode(" "), wrap.nextSibling);
  });

  // Scroll reveal: blocks rise in as they enter the screen; siblings are staggered
  (function () {
    var items = document.querySelectorAll(".r");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) {
      var sibs = el.parentElement ? [].filter.call(el.parentElement.children, function (c) { return c.classList.contains("r"); }) : [];
      var i = sibs.indexOf(el);
      if (i > 0) el.style.setProperty("--d", Math.min(i, 6) * 0.08 + "s");
      io.observe(el);
    });
  })();

  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Signature elements ([data-tilt]): follow the cursor on desktop, sway gently on touch.
  // Sets --rx/--ry (tilt) and --mx/--my (light position, in %) on the element.
  document.querySelectorAll("[data-tilt]").forEach(function (el) {
    if (still) return;
    var max = parseFloat(el.getAttribute("data-tilt")) || 10;
    var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var goal = { x: 0, y: 0 }, now = { x: 0, y: 0 }, running = false, visible = true;
    function clamp(v) { return Math.max(-1, Math.min(1, v)); }
    function tick(t) {
      if (!canHover) {
        goal.x = Math.sin(t * 0.0006) * 0.7;
        goal.y = Math.sin(t * 0.00041 + 1) * 0.4;
      }
      now.x += (goal.x - now.x) * 0.08;
      now.y += (goal.y - now.y) * 0.08;
      el.style.setProperty("--ry", (now.x * max).toFixed(2) + "deg");
      el.style.setProperty("--rx", (-now.y * max * 0.7).toFixed(2) + "deg");
      el.style.setProperty("--mx", (50 + now.x * 30).toFixed(1) + "%");
      el.style.setProperty("--my", (50 + now.y * 30).toFixed(1) + "%");
      if (visible && (!canHover || Math.abs(goal.x - now.x) + Math.abs(goal.y - now.y) > 0.001)) requestAnimationFrame(tick);
      else running = false;
    }
    function wake() { if (!running && visible) { running = true; requestAnimationFrame(tick); } }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) wake(); }).observe(el);
    }
    if (canHover) {
      window.addEventListener("pointermove", function (e) {
        if (e.pointerType !== "mouse") return;
        var r = el.getBoundingClientRect();
        goal.x = clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2));
        goal.y = clamp((e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2));
        wake();
      });
      document.documentElement.addEventListener("mouseleave", function () { goal.x = goal.y = 0; wake(); });
    } else {
      wake();
    }
  });

  // The 3D book opens on tap for touch screens (hover does it on desktop)
  document.querySelectorAll(".book-wow").forEach(function (el) {
    el.addEventListener("click", function () { el.classList.toggle("open"); });
  });

  // Count-up numbers ([data-count]) when they come into view
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var end = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    if (still || !("IntersectionObserver" in window)) { el.textContent = end.toLocaleString() + suffix; return; }
    el.textContent = "0" + suffix;
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      var start = performance.now(), dur = 1600;
      (function step(t) {
        var p = Math.min(1, (t - start) / dur);
        var eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(end * eased).toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(step);
      })(start);
    }, { threshold: 0.5 });
    io.observe(el);
  });

  // Journey line ([data-journey]): draws with scroll; each stop lights up as the line reaches it
  document.querySelectorAll("[data-journey]").forEach(function (el) {
    var track = el.querySelector(".journey-track");
    var stops = el.querySelectorAll("li");
    function update() {
      var r = track.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = still ? 1 : Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (vh * 0.5 + r.height * 0.6)));
      track.style.setProperty("--p", p.toFixed(3));
      stops.forEach(function (s, i) { s.classList.toggle("on", p >= i / (stops.length - 1) - 0.001); });
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  });

  // Latest Medium posts ([data-medium="username"]): read her Medium feed and rebuild the cards,
  // newest first. Medium's feed can't be read directly from a browser, so it goes through rss2json.com.
  // If anything fails, the cards already in the page stay as they are. Cached for 3 hours per visitor.
  document.querySelectorAll("[data-medium]").forEach(function (grid) {
    var user = grid.getAttribute("data-medium");
    var limit = parseInt(grid.getAttribute("data-limit"), 10) || 6;
    var exclude = (grid.getAttribute("data-exclude") || "").split(",").map(function (w) { return w.trim().toLowerCase(); }).filter(Boolean);
    var key = "ae-medium-" + user, ttl = 3 * 60 * 60 * 1000;
    var feed = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent("https://medium.com/feed/@" + user);

    function esc(t) { var d = document.createElement("div"); d.textContent = t; return d.innerHTML; }
    function label(cats) {
      var c = (cats || []).filter(function (x) { return x !== "amarachukwu-eze"; })[0];
      return c ? c.replace(/-/g, " ").replace(/^./, function (m) { return m.toUpperCase(); }) : "";
    }
    function render(items) {
      var posts = items.filter(function (it) {
        var hay = (it.title + " " + it.link).toLowerCase();
        return !exclude.some(function (w) { return hay.indexOf(w) !== -1; });
      }).slice(0, limit);
      if (!posts.length) return;
      grid.innerHTML = posts.map(function (it) {
        var img = ((it.content || it.description || "").match(/<img[^>]+src="([^"]+)"/) || [])[1] || it.thumbnail;
        var date = new Date(it.pubDate.replace(" ", "T") + "Z");
        var when = isNaN(date) ? "" : date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
        var topic = label(it.categories);
        var meta = '<span class="tag">Article</span>' + esc(when + (topic ? " · " + topic : ""));
        var link = it.link.split("?")[0];
        var shot = img
          ? '<div class="shot"><img class="fill" src="' + esc(img) + '" alt="" aria-hidden="true" loading="lazy" /><img class="pic" src="' + esc(img) + '" alt="" loading="lazy" /></div>'
          : '<div class="shot ph"><span>' + esc(it.title) + "</span></div>";
        return '<a class="proof r in" href="' + esc(link) + '" target="_blank" rel="noopener">' + shot +
          '<p class="meta">' + meta + "</p><h3>" + esc(it.title) + "</h3>" +
          '<span class="link-arrow">Read on Medium <i aria-hidden="true">↗</i></span></a>';
      }).join("");
    }

    try {
      var cached = JSON.parse(localStorage.getItem(key) || "null");
      if (cached && Date.now() - cached.t < ttl && cached.items && cached.items.length) { render(cached.items); return; }
    } catch (e) {}

    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 8000);
    fetch(feed, ctrl ? { signal: ctrl.signal } : {})
      .then(function (r) { return r.json(); })
      .then(function (d) {
        clearTimeout(timer);
        if (d.status !== "ok" || !d.items) return;
        var items = d.items.map(function (it) {
          return { title: it.title, link: it.link, pubDate: it.pubDate, categories: it.categories, thumbnail: it.thumbnail,
                   content: ((it.content || it.description || "").match(/<img[^>]+src="[^"]+"/) || [""])[0] };
        }).sort(function (a, b) { return a.pubDate < b.pubDate ? 1 : -1; });
        render(items);
        try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), items: items })); } catch (e) {}
      })
      .catch(function () { clearTimeout(timer); });
  });

  // Footer year
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Contact form (Netlify Forms): sends in the background and confirms on the page.
  // Without JavaScript the form posts normally and Netlify returns to contact.html?sent=1.
  (function () {
    var form = document.querySelector("form[data-netlify]");
    if (!form) return;
    var note = form.querySelector(".form-note");
    var btn = form.querySelector('button[type="submit"]');
    var original = note ? note.textContent : "";
    // links such as contact.html?type=speaking pick the matching topic
    var params = new URLSearchParams(location.search);
    var key = params.get("type");
    var opt = key && form.querySelector('option[data-key="' + key.replace(/[^a-z]/g, "") + '"]');
    if (opt) opt.selected = true;
    if (params.get("sent") && note) note.textContent = "Thank you, your message has been sent. I'll be in touch soon.";

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var d = new FormData(form);
      d.set("subject", d.get("type") + " from " + d.get("name") + " (amarachukwueze.com)");
      btn.disabled = true;
      if (note) note.textContent = "Sending…";
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(d).toString()
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        form.reset();
        if (opt) opt.selected = true;
        if (note) note.textContent = "Thank you, your message has been sent. I'll be in touch soon.";
      }).catch(function () {
        if (note) note.innerHTML = 'Sorry, that didn’t send. Please email <a href="mailto:amarachukwu.eze@gmail.com">amarachukwu.eze@gmail.com</a>.';
      }).then(function () {
        btn.disabled = false;
        setTimeout(function () { if (note && /Thank you/.test(note.textContent)) note.textContent = original; }, 8000);
      });
    });
  })();
});

/* The Workbench — shared page behaviour. Every feature checks for its own
   markup first, so one file serves every page. Nothing here is required to
   read a page: without JS you still get all the words and pictures. */
(function () {
  "use strict";

  // Reading order and the contents drawer are both built from this one list.
  // [file, title, group, one-line blurb]
  var PAGES = [
    ["index.html", "Start here", "Start here", "Who I am, and five months of building"],
    ["garden.html", "The Garden", "Featured builds", "A yard that knows where the sun lands"],
    ["crm.html", "The Business System", "Featured builds", "Runs a cleaning company, and any other"],
    ["lightning.html", "Heat & Lightning", "Featured builds", "Game-day calls from a satellite"],
    ["woodshop.html", "The Woodshop", "Featured builds", "Measuring with a phone scan"],
    ["music.html", "The Music Hub", "For fun, built seriously", "Theory for the instrument in your hands"],
    ["dnd.html", "The D&D Table", "For fun, built seriously", "A rules codex and a secret-keeping logbook"],
    ["multimeter.html", "The Multimeter Tutor", "For fun, built seriously", "A meter you can't break"],
    ["workbench.html", "More From the Bench", "For fun, built seriously", "Ten smaller tools"],
    ["aios.html", "How I Build", "How & why", "One person, an AI partner, and a home server"],
    ["build-for-you.html", "Got a Problem Like These?", "How & why", "What I could build with you"]
  ];

  var root = document.documentElement;

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { return null; }
    return null;
  }

  // ── theme lamp ─────────────────────────────────────────────────────────
  var saved = store("wb-theme");
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

  function isDark() {
    var t = root.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  }

  document.querySelectorAll(".lamp").forEach(function (btn) {
    function label() { btn.setAttribute("aria-label", isDark() ? "Switch to paper (light)" : "Switch to blueprint (dark)"); }
    label();
    btn.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      store("wb-theme", next);
      label();
    });
  });

  // ── contents drawer ───────────────────────────────────────────────────
  var here = location.pathname.split("/").pop() || "index.html";
  var nav = document.querySelector(".topbar nav");
  if (nav) {
    var openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.className = "contents-btn";
    openBtn.setAttribute("aria-expanded", "false");
    openBtn.setAttribute("aria-controls", "contents");
    openBtn.innerHTML = '<svg class="doodle" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h11"/></svg><span>Contents</span>';
    nav.insertBefore(openBtn, nav.firstChild);

    var shade = document.createElement("div");
    shade.className = "contents-shade";
    var panel = document.createElement("aside");
    panel.id = "contents";
    panel.className = "contents";
    panel.setAttribute("aria-label", "Contents");
    panel.setAttribute("aria-hidden", "true");
    var html = '<div class="contents-head"><span class="hand">Contents</span>' +
      '<button type="button" class="contents-x" aria-label="Close contents">✕</button></div><nav>';
    var group = null;
    PAGES.forEach(function (p, n) {
      if (p[2] !== group) {
        if (group !== null) html += "</ol>";
        group = p[2];
        html += '<div class="contents-group">' + group + '</div><ol start="' + (n + 1) + '">';
      }
      var cur = p[0] === here ? ' aria-current="page"' : "";
      html += '<li><a href="' + p[0] + '"' + cur + '><b>' + p[1] + '</b><small>' + p[3] + "</small></a></li>";
    });
    html += "</ol></nav>" +
      '<p class="contents-contact"><a data-contact href="#contact"><span data-contact-text>Email me</span></a></p>';
    panel.innerHTML = html;
    document.body.appendChild(shade);
    document.body.appendChild(panel);

    var closeBtn = panel.querySelector(".contents-x");
    function setOpen(open) {
      document.body.classList.toggle("contents-open", open);
      openBtn.setAttribute("aria-expanded", open ? "true" : "false");
      panel.setAttribute("aria-hidden", open ? "false" : "true");
      if (open) closeBtn.focus(); else openBtn.focus();
    }
    openBtn.addEventListener("click", function () { setOpen(true); });
    closeBtn.addEventListener("click", function () { setOpen(false); });
    shade.addEventListener("click", function () { setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("contents-open")) setOpen(false);
    });
  }

  // ── contact ───────────────────────────────────────────────────────────
  // Built from parts at runtime so the whole address never sits in the HTML.
  var mail = ["timothyjsquires", "+workbench", "@", "gmail", ".", "com"].join("");
  document.querySelectorAll("[data-contact]").forEach(function (a) {
    a.href = "mailto:" + mail + "?subject=" + encodeURIComponent("Saw your Workbench");
    var t = a.querySelector("[data-contact-text]");
    if (t) t.textContent = a.classList.contains("btn") ? "✉ Email me" : mail;
  });

  // ── pager ──────────────────────────────────────────────────────────────
  var pager = document.querySelector("[data-pager]");
  if (pager) {
    var i = PAGES.findIndex(function (p) { return p[0] === here; });
    if (i >= 0) {
      var prev = PAGES[(i - 1 + PAGES.length) % PAGES.length];
      var next = PAGES[(i + 1) % PAGES.length];
      // A slim bar pinned to the bottom of the screen: previous, where you are, next.
      pager.innerHTML =
        '<a class="prev" href="' + prev[0] + '" aria-label="Previous page: ' + prev[1] + '">' +
          '<span class="arrow" aria-hidden="true">‹</span><span class="t">' + prev[1] + "</span></a>" +
        '<span class="where">' + (i + 1) + " / " + PAGES.length + "</span>" +
        '<a class="next" href="' + next[0] + '" aria-label="Next page: ' + next[1] + '">' +
          '<span class="t">' + next[1] + '</span><span class="arrow" aria-hidden="true">›</span></a>';
      document.body.classList.add("has-pager");
      var n = document.querySelector("[data-pageno]");
      if (n) n.textContent = "p. " + (i + 1) + " of " + PAGES.length;
    }
  }

  // ── reveal on scroll (added by JS so no-JS readers see everything) ────
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".beat, .taped, .sticky, .honest, .toy, .card").forEach(function (el) {
      el.classList.add("reveal");
      io.observe(el);
    });
  }

  // ── lightbox ───────────────────────────────────────────────────────────
  document.addEventListener("click", function (ev) {
    var img = ev.target.closest && ev.target.closest("img[data-zoom]");
    if (!img) return;
    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", img.alt || "Enlarged image");
    var big = document.createElement("img");
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    box.appendChild(big);
    function close() { box.remove(); document.removeEventListener("keydown", onKey); }
    function onKey(e) { if (e.key === "Escape") close(); }
    box.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    document.body.appendChild(box);
  });

  // ── frame scrubber (garden sun) ────────────────────────────────────────
  document.querySelectorAll("[data-frames]").forEach(function (toy) {
    var imgs = toy.querySelectorAll(".frames img");
    var range = toy.querySelector("input[type=range]");
    var clock = toy.querySelector(".clock");
    var playBtn = toy.querySelector("[data-play]");
    var timer = null;
    if (!imgs.length || !range) return;
    function show(k) {
      imgs.forEach(function (im, j) { im.classList.toggle("on", j === k); });
      if (clock) clock.textContent = imgs[k].getAttribute("data-label");
      range.value = k;
    }
    range.max = imgs.length - 1;
    range.addEventListener("input", function () { stop(); show(+range.value); });
    function stop() { if (timer) { clearInterval(timer); timer = null; if (playBtn) playBtn.textContent = "▶ Play the day"; } }
    if (playBtn) playBtn.addEventListener("click", function () {
      if (timer) return stop();
      playBtn.textContent = "❚❚ Pause";
      timer = setInterval(function () { show((+range.value + 1) % imgs.length); }, 1100);
    });
    show(0);
  });

  // ── storm clock demo (lightning) ───────────────────────────────────────
  // Mirrors the real app's rule: a strike inside 10 miles starts (or restarts)
  // a 30-minute clock. Sped up 60x so a minute of rule passes each second.
  var storm = document.querySelector("[data-storm]");
  if (storm) {
    var RULE_MILES = 10, HOLD_MIN = 30, SPEEDUP = 60;
    var svg = storm.querySelector("svg");
    var cd = storm.querySelector(".countdown");
    var status = storm.querySelector(".status");
    var deadline = null, tick = null;
    var NS = "http://www.w3.org/2000/svg";
    var CX = 160, CY = 160, PX_PER_MILE = 12;

    function fmt(sec) {
      var m = Math.floor(sec / 60), s = Math.floor(sec % 60);
      return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
    }
    function render() {
      if (!deadline) { cd.textContent = "--:--"; status.textContent = "All clear. Waiting for weather."; return; }
      var left = (deadline - Date.now()) / 1000 * SPEEDUP;
      if (left <= 0) {
        cd.textContent = "00:00"; status.textContent = "30 minutes, nothing new inside 10 miles. Play resumes.";
        clearInterval(tick); tick = null; deadline = null; return;
      }
      cd.textContent = fmt(left);
    }
    function strike(miles) {
      var ang = Math.random() * Math.PI * 2;
      var x = CX + Math.cos(ang) * miles * PX_PER_MILE, y = CY + Math.sin(ang) * miles * PX_PER_MILE;
      var flash = document.createElementNS(NS, "circle");
      flash.setAttribute("cx", x); flash.setAttribute("cy", y); flash.setAttribute("r", 3);
      flash.setAttribute("class", "flash");
      var dot = document.createElementNS(NS, "path");
      dot.setAttribute("d", "M" + (x - 3) + " " + (y - 7) + " l5 0 l-3 5 l4 0 l-7 9 l2 -6 l-4 0 z");
      dot.setAttribute("class", "strike");
      svg.appendChild(flash); svg.appendChild(dot);
      setTimeout(function () { flash.remove(); }, 1000);
      if (miles <= RULE_MILES) {
        deadline = Date.now() + HOLD_MIN * 60 / SPEEDUP * 1000;
        status.textContent = "Strike " + miles.toFixed(1) + " mi out. Inside 10, so the clock " + (tick ? "restarts." : "starts.");
        if (!tick) tick = setInterval(render, 100);
        render();
      } else {
        status.textContent = "Strike " + miles.toFixed(1) + " mi out. Outside the 10-mile ring: noted, no hold.";
      }
    }
    storm.querySelectorAll("[data-strike]").forEach(function (b) {
      b.addEventListener("click", function () { strike(parseFloat(b.getAttribute("data-strike"))); });
    });
    var reset = storm.querySelector("[data-reset]");
    if (reset) reset.addEventListener("click", function () {
      deadline = null; if (tick) { clearInterval(tick); tick = null; }
      svg.querySelectorAll(".strike").forEach(function (s) { s.remove(); });
      render();
    });
    render();
  }

  // ── circle of fifths (music) ───────────────────────────────────────────
  var cof = document.querySelector("[data-cof]");
  if (cof) {
    var MAJ = ["C", "G", "D", "A", "E", "B", "F♯", "D♭", "A♭", "E♭", "B♭", "F"];
    var MIN = ["Am", "Em", "Bm", "F♯m", "C♯m", "G♯m", "D♯m", "B♭m", "Fm", "Cm", "Gm", "Dm"];
    var DIM = ["B°", "F♯°", "C♯°", "G♯°", "D♯°", "A♯°", "E♯°", "C°", "G°", "D°", "A°", "E°"];
    var S = cof.querySelector("svg"), NS2 = "http://www.w3.org/2000/svg";
    var out = cof.querySelector(".readout");
    var R1 = 150, R2 = 104, R3 = 62, C = 160;
    function pt(r, a) { return [C + r * Math.sin(a), C - r * Math.cos(a)]; }
    function wedge(r0, r1, k) {
      var a0 = (k - .5) * Math.PI / 6, a1 = (k + .5) * Math.PI / 6;
      var p = [pt(r1, a0), pt(r1, a1), pt(r0, a1), pt(r0, a0)];
      return "M" + p[0] + " A" + r1 + " " + r1 + " 0 0 1 " + p[1] + " L" + p[2] + " A" + r0 + " " + r0 + " 0 0 0 " + p[3] + " Z";
    }
    var wedges = [];
    for (var k = 0; k < 12; k++) {
      [[R2, R1, MAJ[k], ""], [R3, R2, MIN[k], "minor"]].forEach(function (ring) {
        var w = document.createElementNS(NS2, "path");
        w.setAttribute("d", wedge(ring[0], ring[1], k));
        w.setAttribute("class", "wedge");
        w.setAttribute("data-k", k);
        w.setAttribute("tabindex", "0");
        w.setAttribute("role", "button");
        w.setAttribute("aria-label", ring[2]);
        S.appendChild(w); wedges.push(w);
        var t = document.createElementNS(NS2, "text");
        var mid = pt((ring[0] + ring[1]) / 2, k * Math.PI / 6);
        t.setAttribute("x", mid[0]); t.setAttribute("y", mid[1]);
        if (ring[3]) t.setAttribute("class", ring[3]);
        t.textContent = ring[2];
        S.appendChild(t);
      });
    }
    function select(k) {
      var l = (k + 11) % 12, r = (k + 1) % 12;
      wedges.forEach(function (w) {
        var j = +w.getAttribute("data-k");
        w.classList.toggle("sel", j === k);
        w.classList.toggle("near", j === l || j === r);
      });
      var chords = [MAJ[k], MIN[l], MIN[r], MAJ[l], MAJ[r], MIN[k], DIM[k]];
      out.innerHTML = "<b>" + MAJ[k] + " major</b>" +
        "<p>Its closest neighbours are <strong>" + MAJ[l] + "</strong> and <strong>" + MAJ[r] +
        "</strong>, and it shares a key signature with <strong>" + MIN[k] + "</strong>. The seven chords that live in this key:</p>" +
        '<div class="chips">' + ["I " + chords[0], "ii " + chords[1], "iii " + chords[2], "IV " + chords[3], "V " + chords[4], "vi " + chords[5], "vii° " + chords[6]]
          .map(function (c) { return "<span>" + c + "</span>"; }).join("") + "</div>";
    }
    S.addEventListener("click", function (e) { var w = e.target.closest(".wedge"); if (w) select(+w.getAttribute("data-k")); });
    S.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("wedge")) { e.preventDefault(); select(+e.target.getAttribute("data-k")); }
    });
    select(0);
  }

  // ── swap (same app, two businesses) ────────────────────────────────────
  document.querySelectorAll("[data-swap]").forEach(function (group) {
    var target = document.querySelector(group.getAttribute("data-swap"));
    group.querySelectorAll("button").forEach(function (b, idx) {
      b.addEventListener("click", function () {
        group.querySelectorAll("button").forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
        target.classList.toggle("flipped", idx === 1);
        var cap = document.querySelector(group.getAttribute("data-caption"));
        if (cap) cap.textContent = b.getAttribute("data-url");
      });
    });
  });
})();

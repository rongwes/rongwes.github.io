/* ============================================================
   Morongwe Molaba — portfolio behaviour
   - role rotator (typewriter)
   - blinking cursor + footer clock
   - nav scroll-spy
   - animated circuit network in the hero (canvas)
   All motion is disabled when the visitor prefers reduced motion.
   ============================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- role rotator ---- */
  var roles = ["Cybersecurity", "IoT Security Research", "Software Engineering", "AI & Networks Tutor"];
  var rEl = document.getElementById("rotator");
  if (rEl) {
    if (reduce) {
      rEl.textContent = roles[0];
    } else {
      var ri = 0, ci = 0, deleting = false;
      rEl.textContent = "";
      (function type() {
        var word = roles[ri];
        rEl.textContent = deleting ? word.slice(0, ci--) : word.slice(0, ci++);
        var delay = deleting ? 45 : 85;
        if (!deleting && ci > word.length) {
          deleting = false; delay = 1500;
          setTimeout(function () { deleting = true; type(); }, delay);
          return;
        }
        if (deleting && ci < 0) {
          deleting = false; ci = 0; ri = (ri + 1) % roles.length; delay = 350;
        }
        setTimeout(type, delay);
      })();
    }
  }

  /* ---- blinking cursor ---- */
  var cur = document.getElementById("cursor");
  if (cur && !reduce) {
    setInterval(function () { cur.style.opacity = cur.style.opacity === "0" ? "1" : "0"; }, 530);
  }

  /* ---- footer clock ---- */
  var clock = document.getElementById("clock");
  function tick() {
    if (clock) {
      try { clock.textContent = " " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
      catch (e) {}
    }
  }
  tick();
  if (!reduce) setInterval(tick, 10000);

  /* ---- nav scroll-spy ---- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  var map = {};
  links.forEach(function (a) {
    var id = a.getAttribute("href").slice(1);
    var s = document.getElementById(id);
    if (s) map[id] = a;
  });
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var a = map[en.target.id];
          if (a) { links.forEach(function (l) { l.classList.remove("active"); }); a.classList.add("active"); }
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { spy.observe(document.getElementById(id)); });
  }

  /* ---- animated circuit network ---- */
  var canvas = document.getElementById("net");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var hero = canvas.parentElement;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var nodes = [], W = 0, H = 0, raf = null, mouse = { x: -9999, y: -9999 };

    function colors() {
      var cs = getComputedStyle(document.documentElement);
      return {
        dot: (cs.getPropertyValue("--net-dot") || "rgba(120,120,120,.4)").trim(),
        line: (cs.getPropertyValue("--net-line") || "rgba(120,120,120,.2)").trim(),
        accent: (cs.getPropertyValue("--accent") || "#dc8619").trim()
      };
    }
    var C = colors();

    function size() {
      W = hero.clientWidth; H = hero.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.max(26, Math.min(70, Math.round(W * H / 16000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 1
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var maxD = Math.min(150, W / 6);
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        for (var j = i + 1; j < nodes.length; j++) {
          var m = nodes[j], dx = n.x - m.x, dy = n.y - m.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxD) {
            ctx.globalAlpha = (1 - d / maxD);
            ctx.strokeStyle = C.line; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      for (var k = 0; k < nodes.length; k++) {
        var p = nodes[k];
        var md = Math.sqrt((p.x - mouse.x) * (p.x - mouse.x) + (p.y - mouse.y) * (p.y - mouse.y));
        ctx.fillStyle = md < 120 ? C.accent : C.dot;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
    }

    function step() {
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        var dx = n.x - mouse.x, dy = n.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120 && d > 0.1) { n.x += dx / d * 0.6; n.y += dy / d * 0.6; }
      }
      draw();
      raf = requestAnimationFrame(step);
    }

    hero.addEventListener("pointermove", function (e) {
      var rect = hero.getBoundingClientRect();
      mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top;
    });
    hero.addEventListener("pointerleave", function () { mouse.x = -9999; mouse.y = -9999; });

    function start() {
      size();
      if (reduce) { draw(); }
      else { if (raf) cancelAnimationFrame(raf); step(); }
    }

    var rt = null;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(start, 180); });

    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    try { mq.addEventListener("change", function () { C = colors(); if (reduce) draw(); }); } catch (e) {}
    if (window.MutationObserver) {
      new MutationObserver(function () { C = colors(); if (reduce) draw(); })
        .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    }

    start();
  }
})();

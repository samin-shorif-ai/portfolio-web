/* ============================================================
   SAMIN SHORIF — PORTFOLIO ©2026
   GSAP + ScrollTrigger + Lenis + Three.js
   ============================================================ */
(function () {
  "use strict";

  var EMAIL = "saminshorif.ai@gmail.com";
  var isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- graceful degradation if CDNs fail ---------- */
  if (!window.gsap) {
    document.body.removeAttribute("data-loading");
    var pre = document.getElementById("preloader");
    if (pre) pre.style.display = "none";
    return;
  }

  document.documentElement.classList.add("js");
  gsap.registerPlugin(ScrollTrigger);

  /* ============================================================
     SMOOTH SCROLL (Lenis)
     ============================================================ */
  var lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.stop();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  function scrollToTarget(sel) {
    var target = sel === "#top" ? 0 : document.querySelector(sel);
    if (target === null) return;
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.4 });
    } else if (target === 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }

  /* ============================================================
     TEXT SPLITTING HELPERS
     ============================================================ */
  function splitChars(el) {
    var text = el.textContent;
    el.textContent = "";
    var frag = document.createDocumentFragment();
    for (var i = 0; i < text.length; i++) {
      var s = document.createElement("span");
      s.className = "char";
      s.textContent = text[i];
      frag.appendChild(s);
    }
    el.appendChild(frag);
    return el.querySelectorAll(".char");
  }

  function splitWords(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    words.forEach(function (w, i) {
      var s = document.createElement("span");
      s.className = "word";
      s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
    return el.querySelectorAll(".word");
  }

  /* ============================================================
     HERO TITLE PREP
     ============================================================ */
  var heroChars = [];
  document.querySelectorAll("[data-split]").forEach(function (el) {
    var chars = splitChars(el);
    heroChars = heroChars.concat(Array.prototype.slice.call(chars));
  });
  gsap.set(heroChars, { yPercent: 115 });
  gsap.set("[data-hero-fade]", { opacity: 0, y: 24 });

  /* ============================================================
     PRELOADER → HERO INTRO
     ============================================================ */
  function heroIntro() {
    var tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.to(heroChars, { yPercent: 0, duration: 1.3, stagger: 0.04 })
      .to("[data-hero-fade]", { opacity: 1, y: 0, duration: 1, stagger: 0.07 }, "-=0.9");
  }

  var preloader = document.getElementById("preloader");
  var countEl = document.getElementById("preloaderCount");

  function finishLoad() {
    document.body.removeAttribute("data-loading");
    if (lenis) lenis.start();
    ScrollTrigger.refresh();
    heroIntro();
  }

  if (reduceMotion) {
    preloader.style.display = "none";
    document.body.removeAttribute("data-loading");
    gsap.set(heroChars, { yPercent: 0 });
    gsap.set("[data-hero-fade]", { opacity: 1, y: 0 });
    if (lenis) lenis.start();
  } else {
    var counter = { v: 0 };
    var loadTl = gsap.timeline({
      onComplete: function () {
        preloader.style.display = "none";
        finishLoad();
      }
    });
    loadTl
      .to(".preloader__name", { y: 0, yPercent: 0, duration: 0.9, ease: "expo.out", startAt: { yPercent: 110 } })
      .to(".preloader__tag", { opacity: 1, duration: 0.5 }, "-=0.4")
      .to(counter, {
        v: 100, duration: 1.5, ease: "power2.inOut",
        onUpdate: function () { countEl.textContent = Math.round(counter.v); }
      }, 0)
      .to(".preloader__inner, .preloader__count", { opacity: 0, duration: 0.35, ease: "power1.out" }, "+=0.1")
      .to(preloader, { yPercent: -100, duration: 0.85, ease: "expo.inOut" }, "-=0.1");
  }

  /* ============================================================
     CUSTOM CURSOR
     ============================================================ */
  var cursor = document.getElementById("cursor");
  var cursorLabel = document.getElementById("cursorLabel");

  if (!isTouch) {
    var cx = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3.out" });
    var cy = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3.out" });

    window.addEventListener("mousemove", function (e) {
      cx(e.clientX); cy(e.clientY);
      cursor.classList.remove("is-hidden");
    });
    document.documentElement.addEventListener("mouseleave", function () {
      cursor.classList.add("is-hidden");
    });

    document.addEventListener("mouseover", function (e) {
      var labelled = e.target.closest("[data-cursor]");
      if (labelled) {
        cursorLabel.textContent = labelled.getAttribute("data-cursor");
        cursor.classList.add("is-active");
        cursor.classList.remove("is-link");
        // hide the OS cursor so the hand/grab icon can't sit on top of the label
        document.documentElement.classList.add("hide-native-cursor");
        return;
      }
      var link = e.target.closest("a, button");
      cursor.classList.remove("is-active");
      cursor.classList.toggle("is-link", !!link);
      document.documentElement.classList.remove("hide-native-cursor");
    });
  }

  /* ============================================================
     NAV — scroll state, hide on scroll down
     ============================================================ */
  var nav = document.getElementById("nav");
  var lastY = 0;

  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: function (self) {
      var y = self.scroll();
      nav.classList.toggle("is-scrolled", y > 40);
      if (y > 300 && y > lastY + 4 && !menuOpen) nav.classList.add("is-hidden");
      else if (y < lastY - 4 || y <= 300) nav.classList.remove("is-hidden");
      lastY = y;
    }
  });

  /* ============================================================
     MOBILE MENU
     ============================================================ */
  var burger = document.getElementById("navBurger");
  var menu = document.getElementById("menu");
  var menuOpen = false;

  var menuTl = gsap.timeline({ paused: true });
  menuTl
    .set(menu, { visibility: "visible" })
    .to(menu, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "expo.inOut" })
    .to(".menu__links a", { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: "expo.out" }, "-=0.25");

  // fromHistory = the browser's back/forward button caused this, so history is already right
  function toggleMenu(force, fromHistory) {
    var next = typeof force === "boolean" ? force : !menuOpen;
    if (next === menuOpen) return;
    menuOpen = next;
    burger.classList.toggle("is-open", menuOpen);
    burger.setAttribute("aria-expanded", String(menuOpen));
    menu.setAttribute("aria-hidden", String(!menuOpen));
    if (menuOpen) {
      menuTl.timeScale(1).play();
      if (lenis) lenis.stop();
      // the open menu gets its own history entry, so the phone's back button closes it
      if (!fromHistory) history.pushState({ menu: true }, "");
    } else {
      menuTl.timeScale(1.5).reverse();
      if (lenis) lenis.start();
      // closed from inside the page: drop that entry too, or the next back press does nothing
      if (!fromHistory && history.state && history.state.menu) history.back();
    }
  }
  burger.addEventListener("click", function () { toggleMenu(); });
  window.addEventListener("popstate", function (e) {
    toggleMenu(!!(e.state && e.state.menu), true);
  });

  /* ============================================================
     ANCHOR SCROLLING
     ============================================================ */
  document.querySelectorAll("[data-scroll-to]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      var sel = el.getAttribute("data-scroll-to");
      if (menuOpen) {
        toggleMenu(false);
        setTimeout(function () { scrollToTarget(sel); }, 450);
      } else {
        scrollToTarget(sel);
      }
    });
  });

  /* ============================================================
     MARQUEE
     ============================================================ */
  if (!reduceMotion) {
    var track = document.getElementById("marqueeTrack");
    gsap.to(track, { xPercent: -50, duration: 22, ease: "none", repeat: -1 });
  }

  /* ============================================================
     GENERIC REVEALS
     ============================================================ */
  document.querySelectorAll("[data-reveal]").forEach(function (el) {
    gsap.to(el, {
      opacity: 1, y: 0,
      duration: 1.1, ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true }
    });
  });

  /* ============================================================
     ABOUT — word-by-word statement
     ============================================================ */
  var statement = document.getElementById("aboutStatement");
  if (statement) {
    var words = splitWords(statement);
    gsap.to(words, {
      opacity: 1, stagger: 0.06, ease: "none",
      scrollTrigger: {
        trigger: statement,
        start: "top 80%",
        end: "bottom 45%",
        scrub: 0.6
      }
    });
  }

  /* ============================================================
     CONTACT — line reveals
     ============================================================ */
  document.querySelectorAll("[data-split-line]").forEach(function (line, i) {
    var inner = document.createElement("span");
    while (line.firstChild) inner.appendChild(line.firstChild);
    line.appendChild(inner);
    gsap.fromTo(inner, { yPercent: 115 }, {
      yPercent: 0, duration: 1.2, ease: "expo.out", delay: i * 0.1,
      scrollTrigger: { trigger: line, start: "top 90%", once: true }
    });
  });

  /* ============================================================
     PROJECT ACCORDIONS
     ============================================================ */
  var projects = Array.prototype.slice.call(document.querySelectorAll(".project"));

  function closeProject(p) {
    p.classList.remove("is-open");
    p.querySelector(".project__head").setAttribute("aria-expanded", "false");
    gsap.to(p.querySelector(".project__body"), {
      height: 0, duration: 0.55, ease: "power3.inOut",
      onComplete: function () { ScrollTrigger.refresh(); }
    });
  }

  projects.forEach(function (p) {
    var head = p.querySelector(".project__head");
    var body = p.querySelector(".project__body");
    if (!isTouch) head.setAttribute("data-cursor", "VIEW");

    head.addEventListener("click", function () {
      var isOpen = p.classList.contains("is-open");
      projects.forEach(function (other) {
        if (other !== p && other.classList.contains("is-open")) closeProject(other);
      });
      if (isOpen) {
        closeProject(p);
      } else {
        p.classList.add("is-open");
        head.setAttribute("aria-expanded", "true");
        gsap.to(body, {
          height: "auto", duration: 0.65, ease: "power3.inOut",
          onComplete: function () { ScrollTrigger.refresh(); }
        });
      }
    });
  });

  /* ============================================================
     MAGNETIC ELEMENTS
     ============================================================ */
  if (!isTouch && !reduceMotion) {
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      var xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
      var yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
      });
      el.addEventListener("mouseleave", function () { xTo(0); yTo(0); });
    });
  }

  /* ============================================================
     TECH SPHERE — 3D rotating icon cloud (DOM-based)
     ============================================================ */
  var TOOLS = [
    ["Next.js", "nextdotjs"],       ["Tailwind CSS", "tailwindcss"],
    ["Supabase", "supabase"],       ["MongoDB", "mongodb"],
    ["Vercel", "vercel"],           ["Netlify", "netlify"],
    ["Claude API", "anthropic"],    ["n8n", "n8n"],
    ["Make", "make"],               ["Zapier", "zapier"],
    ["Excalidraw", "excalidraw"],   ["PostHog", "posthog"],
    ["Docker", "docker"],           ["Google Cloud", "googlecloud"],
    ["Git", "git"],                 ["GitHub", "github"],
    ["Hugging Face", "huggingface"],["Notion", "notion"],
    ["Postman", "postman"],         ["Linear", "linear"],
    ["Ngrok", "ngrok"],             ["Blender", "blender"],
    ["DaVinci Resolve", "davinciresolve"], ["GIMP", "gimp"]
  ];

  var sphereEl = document.getElementById("sphere");
  if (sphereEl) {
    var SVGNS = "http://www.w3.org/2000/svg";

    var items = TOOLS.map(function (tool, i) {
      var div = document.createElement("div");
      div.className = "sphere-item";
      div.setAttribute("data-cursor", tool[0].toUpperCase());
      div.title = tool[0];

      var img = document.createElement("img");
      img.alt = tool[0];
      img.loading = "lazy";
      img.src = "https://cdn.simpleicons.org/" + tool[1] + "/e8e6e1";
      img.onerror = function () {
        var initials = tool[0].replace(/[^A-Za-z0-9 ]/g, "").split(" ")
          .map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();
        var span = document.createElement("span");
        span.textContent = initials;
        div.replaceChild(span, img);
      };
      div.appendChild(img);
      sphereEl.appendChild(div);

      // Fibonacci sphere distribution
      var y = 1 - (i / (TOOLS.length - 1)) * 2;
      var rXZ = Math.sqrt(1 - y * y);
      var theta = Math.PI * (3 - Math.sqrt(5)) * i;
      return { el: div, x: Math.cos(theta) * rXZ, y: y, z: Math.sin(theta) * rXZ,
               px: 0, py: 0, pz: 0 };
    });

    // --- build the connecting web: link each node to its 3 nearest neighbours ---
    var edges = [];
    var edgeSet = {};
    var K = 3;
    for (var a = 0; a < items.length; a++) {
      var dists = [];
      for (var b = 0; b < items.length; b++) {
        if (a === b) continue;
        var dx = items[a].x - items[b].x,
            dy = items[a].y - items[b].y,
            dz = items[a].z - items[b].z;
        dists.push([b, dx * dx + dy * dy + dz * dz]);
      }
      dists.sort(function (m, n) { return m[1] - n[1]; });
      for (var k = 0; k < K; k++) {
        var nb = dists[k][0];
        var key = a < nb ? a + "_" + nb : nb + "_" + a;
        if (!edgeSet[key]) { edgeSet[key] = 1; edges.push([a, nb]); }
      }
    }

    var web = document.createElementNS(SVGNS, "svg");
    web.setAttribute("class", "stack__web");
    var lineEls = edges.map(function () {
      var ln = document.createElementNS(SVGNS, "line");
      web.appendChild(ln);
      return ln;
    });
    sphereEl.insertBefore(web, sphereEl.firstChild);

    var rotY = 0, rotX = -0.32;
    var velY = 0, velX = 0;
    var tiltPhase = Math.random() * Math.PI * 2;
    var baseSpeed = reduceMotion ? 0 : 0.0036;
    var dragging = false, lastPX = 0, lastPY = 0;
    var radius = 0, half = 0;
    var sphereVisible = true;

    function setRadius() {
      half = sphereEl.clientWidth / 2;
      radius = half - (window.innerWidth < 520 ? 36 : 52);
    }
    setRadius();
    window.addEventListener("resize", setRadius);

    sphereEl.addEventListener("pointerdown", function (e) {
      dragging = true;
      lastPX = e.clientX; lastPY = e.clientY;
      sphereEl.setPointerCapture(e.pointerId);
    });
    sphereEl.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      velY = (e.clientX - lastPX) * 0.0045;
      velX = -(e.clientY - lastPY) * 0.003;
      rotY += velY;
      rotX += velX;
      rotX = Math.max(-1.25, Math.min(1.25, rotX));
      lastPX = e.clientX; lastPY = e.clientY;
    });
    function endDrag() { dragging = false; }
    sphereEl.addEventListener("pointerup", endDrag);
    sphereEl.addEventListener("pointercancel", endDrag);

    function renderSphere() {
      if (!dragging) {
        velY *= 0.95;
        velX *= 0.9;
        rotY += baseSpeed + velY;
        // precess the tilt so the two pole icons are never frozen on the axis
        tiltPhase += reduceMotion ? 0 : 0.0042;
        var targetX = -0.32 + Math.sin(tiltPhase) * 0.6;
        rotX += velX + (targetX - rotX) * 0.025;
        rotX = Math.max(-1.25, Math.min(1.25, rotX));
      }
      var cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      var cosX = Math.cos(rotX), sinX = Math.sin(rotX);

      var i, p;
      for (i = 0; i < items.length; i++) {
        p = items[i];
        var x1 = p.x * cosY + p.z * sinY;
        var z1 = -p.x * sinY + p.z * cosY;
        var y2 = p.y * cosX - z1 * sinX;
        var z2 = p.y * sinX + z1 * cosX;
        p.px = x1; p.py = y2; p.pz = z2;

        var scale = 0.55 + ((z2 + 1) / 2) * 0.6;
        var opacity = 0.18 + ((z2 + 1) / 2) * 0.82;
        p.el.style.transform =
          "translate(-50%,-50%) translate3d(" + (x1 * radius).toFixed(1) + "px," +
          (y2 * radius).toFixed(1) + "px,0) scale(" + scale.toFixed(3) + ")";
        p.el.style.opacity = opacity.toFixed(2);
        p.el.style.zIndex = Math.round((z2 + 1) * 50) + 2;
      }

      // redraw the web
      for (i = 0; i < edges.length; i++) {
        var A = items[edges[i][0]], B = items[edges[i][1]];
        var ln = lineEls[i];
        ln.setAttribute("x1", (half + A.px * radius).toFixed(1));
        ln.setAttribute("y1", (half + A.py * radius).toFixed(1));
        ln.setAttribute("x2", (half + B.px * radius).toFixed(1));
        ln.setAttribute("y2", (half + B.py * radius).toFixed(1));
        var depth = (A.pz + B.pz) * 0.5;          // -1 (back) .. 1 (front)
        ln.setAttribute("stroke-opacity", (0.04 + ((depth + 1) / 2) * 0.2).toFixed(3));
      }
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        sphereVisible = entries[0].isIntersecting;
      }, { rootMargin: "100px" }).observe(sphereEl);
    }

    gsap.ticker.add(function () {
      if (sphereVisible) renderSphere();
    });
  }

  /* ============================================================
     HERO — Three.js particle wave
     ============================================================ */
  (function initThree() {
    if (!window.THREE || reduceMotion) return;
    var canvas = document.getElementById("heroCanvas");
    var hero = document.getElementById("hero");
    if (!canvas) return;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
    } catch (e) { return; }

    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0d0e0c, 10, 30);

    var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 60);
    camera.position.set(0, 5.4, 13);

    var isSmall = window.innerWidth < 820;
    var COLS = isSmall ? 70 : 120;
    var ROWS = isSmall ? 42 : 64;
    var SPACING = 0.6;

    var count = COLS * ROWS;
    var positions = new Float32Array(count * 3);
    var idx = 0;
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        positions[idx++] = (c - COLS / 2) * SPACING;
        positions[idx++] = 0;
        positions[idx++] = 4 - r * SPACING;
      }
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    var mat = new THREE.PointsMaterial({
      color: 0xd6fb41,
      size: 0.05,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
      depthWrite: false
    });
    scene.add(new THREE.Points(geo, mat));

    var mouseX = 0;
    if (!isTouch) {
      window.addEventListener("mousemove", function (e) {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      });
    }

    function resize() {
      var w = hero.clientWidth, h = hero.clientHeight;
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    var heroVisible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
      }).observe(hero);
    }

    var clock = new THREE.Clock();
    var pos = geo.attributes.position;

    gsap.ticker.add(function () {
      if (!heroVisible) return;
      var t = clock.getElapsedTime();
      for (var i = 0; i < count; i++) {
        var x = pos.array[i * 3];
        var z = pos.array[i * 3 + 2];
        pos.array[i * 3 + 1] =
          Math.sin(x * 0.45 + t * 1.1) * 0.32 +
          Math.cos(z * 0.38 + t * 0.9) * 0.32;
      }
      pos.needsUpdate = true;

      camera.position.x += (mouseX * 1.8 - camera.position.x) * 0.04;
      camera.lookAt(0, 0, -4);
      renderer.render(scene, camera);
    });

    // fade the wave out as the hero scrolls away
    gsap.to(canvas, {
      opacity: 0,
      scrollTrigger: { trigger: hero, start: "40% top", end: "bottom top", scrub: true }
    });
  })();

  /* ============================================================
     HERO PARALLAX ON SCROLL
     ============================================================ */
  if (!reduceMotion) {
    gsap.to(".hero__center", {
      yPercent: 18, opacity: 0.25, ease: "none",
      scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true }
    });
  }

  /* ============================================================
     COPY EMAIL
     ============================================================ */
  var copyBtn = document.getElementById("copyEmail");
  var copyText = document.getElementById("copyEmailText");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      function done() {
        copyText.textContent = "Copied ✓";
        setTimeout(function () { copyText.textContent = "Copy email"; }, 2000);
      }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(EMAIL).then(done).catch(done);
      } else {
        var ta = document.createElement("textarea");
        ta.value = EMAIL;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta);
        done();
      }
    });
  }

})();

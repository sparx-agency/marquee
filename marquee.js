/* Marq 1.0.0 MIT
   Minimal, dependency free marquee with clones, per breakpoint speed, hover pause, IO pause,
   fade in, vertical and horizontal modes, and a tiny public API. */

(function () {
  "use strict";

  // Public API container
  const Marq = {
    version: "1.0.0",
    initAll,
    init,
    // will be filled on auto init
    instances: []
  };

  // Auto initialize on DOM ready unless <html marq-no-auto> is present
  if (typeof window !== "undefined") {
    window.Marq = window.Marq || Marq;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", tryAutoInit);
    } else {
      tryAutoInit();
    }
  }

  function tryAutoInit() {
    if (document.documentElement.hasAttribute("marq-no-auto")) return;
    window.Marq.instances = initAll();
    // Optional log
    // console.info("[Marq] Initialized", window.Marq.instances.length, "instance(s).");
  }

  // ===== Public entry points =====

  function initAll() {
    const out = [];
    qsa('[marq-instance]').forEach(el => {
      const api = init(el);
      if (api) out.push(api);
    });
    return out;
  }

  function init(instanceEl) {
    const wrapper = qs('[marq-el="wrapper"]', instanceEl);
    const list = qs('[marq-el="list"]', instanceEl);
    const items = qsa('[marq-el="item"]', instanceEl);

    if (!wrapper || !list || items.length === 0) {
      console.warn("Marq: missing wrapper, list, or items");
      return null;
    }

    // Read options from attributes
    const dir = attr(instanceEl, "marq-direction", "ltr"); // ltr, rtl, ttb, btt
    const pauseOnHover = attr(instanceEl, "marq-pause", "false") === "true";
    const fadeMs = toInt(attr(instanceEl, "marq-fade"), 0);
    const easeMs = toInt(attr(instanceEl, "marq-easeout"), 0);
    const bpRaw = attr(instanceEl, "marq-breakpoints", "");
    const breakpoints = safeJSON(bpRaw) || { 1440: 80, 991: 100, 480: 120 };

    // State
    let raf = 0;
    let lastTs = 0;
    let pos = 0;
    let isPaused = false;
    let isStopping = false;
    let isStarting = false;
    let startTime = 0;
    let stopTime = 0;
    let io = null;
    let resizeObs = null;
    let inView = true;
    let destroyed = false;

    // Setup base styles and ARIA
    hardenInstance(instanceEl, wrapper, list, isVertical(dir));

    // Build once images are loaded so sizes are correct
    waitImages(list).then(() => {
      measureAndClone();
      setInitialPosition();
      fadeIn(instanceEl, fadeMs);
      bind();
      play();
    });

    // ====== internal helpers bound to this instance ======

    function isVertical(d) {
      return d === "ttb" || d === "btt";
    }

    function measureAndClone() {
      // Clear old clones
      qsa('[data-marq-clone=""]', list).forEach(n => n.remove());

      const baseItems = qsa('[marq-el="item"]', list).filter(n => !n.hasAttribute('data-marq-clone'));
      const sizes = itemSizes(baseItems, listGapPx(), isVertical(dir));
      const setSize = sizes.reduce((a, n) => a + n, 0);

      const vp = isVertical(dir)
        ? wrapper.getBoundingClientRect().height
        : wrapper.getBoundingClientRect().width;

      const clonesNeeded = Math.max(Math.ceil((vp + setSize) / setSize), 2);
      for (let i = 0; i < clonesNeeded; i++) {
        baseItems.forEach(item => {
          const clone = item.cloneNode(true);
          clone.setAttribute('data-marq-clone', '');
          list.appendChild(clone);
        });
      }

      // width or height of the list to contain all sets
      const totalSets = qsa('[data-marq-clone=""]', list).length / baseItems.length;
      const total = setSize * totalSets;
      if (isVertical(dir)) list.style.height = `${total}px`;
      else list.style.width = `${total}px`;
    }

    function setInitialPosition() {
      const setSize = oneSetSize();
      if (dir === "rtl" || dir === "ttb") pos = -setSize;
      else pos = 0;
      applyTransform();
    }

    function oneSetSize() {
      const baseItems = qsa('[marq-el="item"]', list).filter(n => !n.hasAttribute('data-marq-clone'));
      const sizes = itemSizes(baseItems, listGapPx(), isVertical(dir));
      return sizes.reduce((a, n) => a + n, 0);
    }

    function listGapPx() {
      const cs = getComputedStyle(list);
      const gap = cs.getPropertyValue('gap') || '0px';
      return parseCssLengthToPx(gap, list);
    }

    function bind() {
      if (pauseOnHover) {
        instanceEl.addEventListener('mouseenter', pause);
        instanceEl.addEventListener('mouseleave', play);
      }
      document.addEventListener('visibilitychange', onVis);

      io = new IntersectionObserver((entries) => {
        const e = entries[0];
        const was = inView;
        inView = e.isIntersecting;
        if (inView && !was && isPaused) {
          if (!document.hidden) play();
        } else if (!inView && was && !isPaused) {
          pause();
        }
      }, { threshold: 0, rootMargin: '50px' });
      io.observe(instanceEl);

      resizeObs = new ResizeObserver(() => {
        stopTick();
        measureAndClone();
        setInitialPosition();
        play();
      });
      resizeObs.observe(instanceEl);
    }

    function onVis() {
      if (document.hidden) pause();
      else play();
    }

    function play() {
      if (destroyed) return;
      if (!inView) return;
      if (!isPaused) {
        isStarting = true;
        startTime = performance.now();
      }
      isPaused = false;
      if (!raf) {
        lastTs = performance.now();
        raf = requestAnimationFrame(tick);
      }
    }

    function pause() {
      if (destroyed) return;
      if (isPaused) return;
      isPaused = true;
      isStopping = true;
      stopTime = performance.now();
    }

    function stopTick() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    function speedFactor() {
      // breakpoints is width -> durationPercent; lower is faster
      const width = window.innerWidth;
      const sorted = Object.entries(breakpoints)
        .map(([w, d]) => ({ w: parseInt(w, 10), d: Number(d) }))
        .sort((a, b) => b.w - a.w);
      const pick = sorted.find(r => width >= r.w) || sorted[sorted.length - 1];
      const durPercent = pick ? pick.d : 100;
      return clamp(Number(durPercent) / 100, 0.1, 10); // 1.0 baseline
    }

    function tick(ts) {
      const dt = lastTs ? ts - lastTs : 16.67;
      lastTs = ts;

      const ease = toInt(easeMs, 0);
      let v = speedFactor();

      if (isStarting && ease > 0) {
        const t = ts - startTime;
        const n = Math.min(t / ease, 1);
        const cubicIn = n * n * n;
        v = v * cubicIn;
        if (n === 1) isStarting = false;
      } else if (isStopping && ease > 0) {
        const t = ts - stopTime;
        const n = Math.min(t / ease, 1);
        const cubicOut = 1 - n * n * n;
        v = v * cubicOut;
        if (n === 1) {
          isStopping = false;
          stopTick();
          return;
        }
      }

      // Base step in px per 16.67ms, scale by dt
      const pxPerFrame = 1; // tune this to your taste
      const step = v * pxPerFrame * (dt / 16.67);

      const setSize = oneSetSize();

      switch (dir) {
        case "ltr":
          pos -= step;
          if (Math.abs(pos) >= setSize) pos += setSize;
          break;
        case "rtl":
          pos += step;
          if (pos >= setSize) pos -= setSize;
          break;
        case "ttb":
          pos -= step;
          if (Math.abs(pos) >= setSize) pos += setSize;
          break;
        case "btt":
          pos += step;
          if (pos >= setSize) pos -= setSize;
          break;
      }

      applyTransform();
      if (!raf) return;
      raf = requestAnimationFrame(tick);
    }

    function applyTransform() {
      const t = Math.round(pos * 100) / 100;
      if (isVertical(dir)) {
        list.style.transform = `translateY(${t}px)`;
      } else {
        list.style.transform = `translateX(${t}px)`;
      }
    }

    function destroy() {
      destroyed = true;
      stopTick();
      if (io) io.disconnect();
      if (resizeObs) resizeObs.disconnect();
      instanceEl.removeEventListener('mouseenter', pause);
      instanceEl.removeEventListener('mouseleave', play);
      document.removeEventListener('visibilitychange', onVis);
      qsa('[data-marq-clone=""]', list).forEach(n => n.remove());
      // Clean inline styles and aria
      wrapper.removeAttribute('style');
      list.removeAttribute('style');
      instanceEl.removeAttribute('role');
      instanceEl.removeAttribute('aria-label');
      instanceEl.removeAttribute('marq-vertical');
    }

    function stop() {
      stopTick();
      isPaused = false;
      isStopping = false;
      isStarting = false;
      pos = 0;
      applyTransform();
    }

    function start() {
      measureAndClone();
      setInitialPosition();
      play();
    }

    // Return instance API
    return { play, pause, stop, start, destroy };
  }

  // ===== DOM and math helpers =====

  function hardenInstance(instanceEl, wrapper, list, vertical) {
    instanceEl.setAttribute('role', 'region');
    instanceEl.setAttribute('aria-label', 'Scrolling marquee content');

    wrapper.style.overflow = 'hidden';
    wrapper.style.position = 'relative';

    list.style.position = 'absolute';
    list.style.willChange = 'transform';
    if (vertical) list.style.width = '100%';
    else list.style.height = '100%';
  }

  function qs(sel, scope = document) {
    return scope.querySelector(sel);
  }
  function qsa(sel, scope = document) {
    return Array.from(scope.querySelectorAll(sel));
  }
  function attr(el, name, fallback = "") {
    const v = el.getAttribute(name);
    return v == null || v === "" ? fallback : v;
  }
  function toInt(v, def = 0) {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : def;
  }
  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }
  function safeJSON(s) {
    if (!s) return null;
    try { return JSON.parse(s); } catch { return null; }
  }
  function parseCssLengthToPx(val, refEl) {
    const trimmed = String(val || "").trim();
    if (!trimmed) return 0;
    if (/px$/i.test(trimmed)) return parseFloat(trimmed);
    // Convert with a measuring element
    const test = document.createElement('div');
    test.style.position = 'absolute';
    test.style.visibility = 'hidden';
    test.style.height = '0';
    test.style.width = trimmed;
    refEl.appendChild(test);
    const px = test.getBoundingClientRect().width;
    refEl.removeChild(test);
    return px || 0;
  }
  function itemSizes(nodes, gapPx, vertical) {
    const sizes = nodes.map((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const mt = parseFloat(cs.marginTop) || 0;
      const mb = parseFloat(cs.marginBottom) || 0;
      const ml = parseFloat(cs.marginLeft) || 0;
      const mr = parseFloat(cs.marginRight) || 0;
      const w = r.width + ml + mr;
      const h = r.height + mt + mb;
      return { w, h };
    });
    return sizes.map(s => vertical ? s.h + gapPx : s.w + gapPx);
    }
  async function waitImages(scope) {
    const imgs = qsa('img', scope).filter(img => img.src);
    await Promise.all(imgs.map(img => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise(res => {
        const done = () => {
          img.removeEventListener('load', done);
          img.removeEventListener('error', done);
          res();
        };
        img.addEventListener('load', done);
        img.addEventListener('error', done);
      });
    }));
  }

  // Expose Marq globally
  if (typeof window !== "undefined") {
    window.Marq = window.Marq || Marq;
  }
})();

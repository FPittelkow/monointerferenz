/**
 * SketchRuntime — shared runtime for p5.js sketches embedded as <iframe>s.
 *
 * A small, dependency-free helper the sketches opt into. It handles the three
 * things every sketch needs to do the same way:
 *
 *  1. Canvas sizing — paint a canvas that fills the sketch container (#stage,
 *     <main>, body, or any [data-sketch-container]) and keep it correct when
 *     the window or the container is resized (ResizeObserver + p5's
 *     windowResized hook).
 *
 *  2. Theme — resolve the active color scheme (`"light"` | `"dark"`) from an
 *     explicit `?theme=` query parameter or a `postMessage` from the parent
 *     document (`{ theme: "dark" }`). The site is light-only for now, so the
 *     system preference is not applied yet — flip `fallbackToSystem()` to
 *     toggle that once a site-wide dark mode exists.
 *
 *  3. Motion — expose `prefers-reduced-motion` so sketches can degrade to a
 *     still version.
 *
 * Sketches use p5's global mode, so `createCanvas()` forwards to the global
 * p5 function and nothing else needs to change.
 */
window.SketchRuntime = (function () {
  'use strict';

  var container = null;
  var resizeObserver = null;
  var activeTheme = null;   // resolved theme once set (query/message or default)
  var themeListeners = [];
  var resizeListeners = [];

  var reducedMotion = window.matchMedia !== undefined
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------- sizing

  function getContainer() {
    if (!container || !container.isConnected) {
      container = document.querySelector(
        '[data-sketch-container], #stage, main, body'
      );
    }
    return container || document.body;
  }

  function size() {
    var el = getContainer();
    var w = el.clientWidth || window.innerWidth || 0;
    var h = el.clientHeight || window.innerHeight || 0;
    return { width: w, height: h };
  }

  /**
   * Create the canvas at the container size, forwarding to the global
   * p5 createCanvas so sketches keep `width` / `height` and friends.
   */
  function createCanvas() {
    var s = size();
    return window.createCanvas(s.width, s.height);
  }

  /** Re-size the canvas to the current container size. */
  function resize() {
    var s = size();
    // Only touch the canvas once the sketch actually created it.
    if (
      document.querySelector('canvas')
      && typeof window.resizeCanvas === 'function'
    ) {
      window.resizeCanvas(s.width, s.height);
    }
    resizeListeners.forEach(function (listener) {
      listener(s);
    });
  }

  function onResize(listener) {
    resizeListeners.push(listener);
  }

  // React to container size changes. p5 also calls windowResized() on window
  // resizes and the sketches forward that to resize() here — duplicate,
  // idempotent resizeCanvas calls are harmless.
  function observe() {
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', resize);
      return;
    }
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(getContainer());
  }

  // ----------------------------------------------------------------- theme

  function themeFromQuery() {
    var match = /[?&]theme=([^&]+)/.exec(window.location.search);
    return match ? decodeURIComponent(match[1]) : null;
  }

  function themeFromSystem() {
    if (window.matchMedia !== undefined
        && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  function sanitize(value) {
    return value === 'dark' ? 'dark' : 'light';
  }

  function currentTheme() {
    if (activeTheme) return activeTheme;
    var fromQuery = themeFromQuery();
    if (fromQuery) return sanitize(fromQuery);
    // The site is light-only for now; the iframes follow the parent site.
    // Switch to `themeFromSystem()` below once a site-wide dark mode exists.
    return 'light';
    //return themeFromSystem();
  }

  function setTheme(next) {
    activeTheme = sanitize(next);
    document.documentElement.setAttribute('data-theme', activeTheme);
    document.documentElement.style.colorScheme = activeTheme;
    themeListeners.forEach(function (listener) {
      listener(activeTheme);
    });
  }

  function theme() {
    return currentTheme();
  }

  function onTheme(listener) {
    themeListeners.push(listener);
    listener(theme());
  }

  // The parent site can switch embedded sketches live (no reload) by posting
  // `{ theme: "light" | "dark" }` to the iframe window.
  window.addEventListener('message', function (event) {
    if (event.data && (event.data.theme === 'light' || event.data.theme === 'dark')) {
      setTheme(event.data.theme);
    }
  });

  // ---------------------------------------------------------------- boot

  observe();
  // Reflect the resolved theme on <html> as early as possible so CSS
  // (e.g. `[data-theme="dark"]`) can react before a sketch paints.
  setTheme(theme());

  return {
    createCanvas: createCanvas,
    size: size,
    resize: resize,
    onResize: onResize,
    theme: theme,
    onTheme: onTheme,
    reducedMotion: reducedMotion,
  };
})();
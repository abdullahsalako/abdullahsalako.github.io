/* ==========================================================================
   Aderemi Salako — editorial portfolio homepage
   Opening sequence + hero + menu.   Colours and fonts live in style.css (:root).
   Every timing is in CONFIG below, in seconds, on ONE GSAP timeline.
   Tip: add ?intro to the URL to replay the sequence; in the console,
   window.__introTimeline.timeScale(0.25) slows it down for inspection.
   ========================================================================== */

const CONFIG = {
  storageKey: 'portfolio-intro-played',   // sessionStorage flag: intro plays once per session

  // --- Frame 1: black, name held still
  hold: 1.0,

  // --- Frame 2: orange dome rises from the bottom and covers black + name
  orange: { start: 1.0, duration: 1.25, ease: 'power3.inOut', curve: 60 },   // curve = arc height (bigger = rounder)

  // --- Frame 3: cream dome rises and pushes the orange up and away
  cream:  { start: 2.15, duration: 1.1, ease: 'power3.inOut', curve: 70, pushOrange: 30 },   // pushOrange = % the orange layer travels up

  // --- Frame 4: header, dot, headline
  content: {
    start: 3.2,                 // when the loader is removed and the page starts to arrive
    header: { duration: 0.9, ease: 'power3.out' },
    label:  { delay: 0.1, duration: 0.8 },
    dot:    { delay: 0.1, duration: 1.2, ease: 'power3.inOut', pulseScale: 1.7, pulseDuration: 1.1 },
    words:  { delay: 0.15, duration: 1.1, stagger: 0.07, ease: 'power3.out' },   // rise into place
    fill:   { delay: 0.55, duration: 0.9, stagger: 0.09, ease: 'power2.out' },   // grey -> charcoal, word by word
    note:   { delay: 1.1, duration: 1.0, ease: 'power3.out' }
  },

  // --- Menu overlay (same dome, quicker)
  menu: { duration: 0.95, ease: 'power3.inOut', curve: 60, itemStagger: 0.06 },

  failsafe: 9   // seconds; if something stalls, force the page visible
};

/* ------------------------------------------------------------------------ */

const root = document.documentElement;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const reduced = root.classList.contains('reduced');
const cssVar = (name) => getComputedStyle(root).getPropertyValue(name).trim();

/* Dome: an SVG path (viewBox 0 0 100 100, stretched to the screen). Its top edge is a wide curve
   spanning 150% of the screen, so it still reads as a gentle arc on a phone. state.y is the height of
   the arc's base; state.k is how much it bulges. k = 0 -> flat, filling the screen. */
function makeDome(svg) {
  const path = $('path', svg);
  const state = { y: 0, k: 0 };
  const render = () => {
    const { y, k } = state;
    path.setAttribute('d', `M-25 150 L-25 ${y} C-25 ${y - k} 125 ${y - k} 125 ${y} L125 150 Z`);
  };
  const hide = (k) => { state.k = k; state.y = 102 + 0.75 * k; render(); };   // apex just below the screen
  const to = (tl, at, cfg) => tl.to(state, { y: -2, k: 0, duration: cfg.duration, ease: cfg.ease, onUpdate: render }, at);
  return { svg, state, render, hide, to };
}

function finishIntro(loader) {
  if (loader && loader.parentNode) loader.remove();
  root.classList.remove('intro-pending');
  try { sessionStorage.setItem(CONFIG.storageKey, '1'); } catch (e) {}
}

/* Split the headline into words: .w (mask) > .w__i (moves + fills colour). */
function splitHeadline() {
  const h = $('#headline');
  if (!h || h.dataset.split) return $$('.w__i');
  h.dataset.split = '1';
  $$('.line', h).forEach((line) => {
    const words = line.textContent.trim().split(/\s+/);
    line.textContent = '';
    words.forEach((word, i) => {
      const w = document.createElement('span');
      const inner = document.createElement('span');
      w.className = 'w';
      inner.className = 'w__i';
      inner.textContent = word;
      w.appendChild(inner);
      line.appendChild(w);
      if (i < words.length - 1) line.appendChild(document.createTextNode(' '));
    });
  });
  return $$('.w__i', h);
}

/* ---- reveal on scroll (sections below the hero) ------------------------- */
function initReveals() {
  const els = $$('[data-reveal]');
  if (!els.length) return;
  if (!('IntersectionObserver' in window) || reduced) { els.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach((el) => io.observe(el));
}

/* ---- the dot: a quiet pulse ---------------------------------------------- */
function startPulse(dot) {
  if (reduced || !dot || !window.gsap) return;
  gsap.to(dot, { scale: CONFIG.content.dot.pulseScale, opacity: 0.55, duration: CONFIG.content.dot.pulseDuration, ease: 'sine.inOut', yoyo: true, repeat: -1 });
}

/* ---- menu ---------------------------------------------------------------- */
function initMenu() {
  const menu = $('#menu'), btn = $('#menuBtn'), closeBtn = $('#menuClose');
  if (!menu || !btn) return;
  const dome = makeDome($('#domeMenu'));
  const links = $$('.menu__item > a', menu);
  const top = $('.menu__top', menu), foot = $('.menu__foot', menu);
  const inertTargets = [$('#main'), $('#header')].filter(Boolean);
  let isOpen = false, tl = null;

  if (window.gsap && !reduced) {
    dome.hide(CONFIG.menu.curve);
    gsap.set(links, { yPercent: 110 });
    gsap.set([top, foot], { opacity: 0 });
    tl = gsap.timeline({
      paused: true,
      onReverseComplete: () => { menu.classList.remove('is-open'); menu.hidden = true; }
    });
    dome.to(tl, 0, CONFIG.menu);
    tl.to(top, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.45)
      .to(links, { yPercent: 0, duration: 0.9, ease: 'power3.out', stagger: CONFIG.menu.itemStagger }, 0.4)
      .to(foot, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.8);
    tl.timeScale(1);
  }

  const focusables = () => $$('a[href], button', menu).filter((el) => !el.hidden);

  function open() {
    if (isOpen) return;
    isOpen = true;
    menu.hidden = false;
    menu.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    inertTargets.forEach((el) => { el.inert = true; });
    root.style.overflow = 'hidden';
    if (tl) tl.timeScale(1).play();
    else { dome.state.y = -2; dome.state.k = 0; dome.render(); gsap && gsap.fromTo(menu, { opacity: 0 }, { opacity: 1, duration: 0.3 }); }
    (closeBtn || focusables()[0]).focus({ preventScroll: true });
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    btn.setAttribute('aria-expanded', 'false');
    inertTargets.forEach((el) => { el.inert = false; });
    root.style.overflow = '';
    if (tl) tl.timeScale(1.25).reverse();
    else if (window.gsap) gsap.to(menu, { opacity: 0, duration: 0.25, onComplete: () => { menu.classList.remove('is-open'); menu.hidden = true; } });
    else { menu.classList.remove('is-open'); menu.hidden = true; }
    btn.focus({ preventScroll: true });
  }

  btn.addEventListener('click', open);
  closeBtn && closeBtn.addEventListener('click', close);
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
  document.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'Tab') {
      const f = focusables();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}

/* ---- the opening sequence ------------------------------------------------- */
function playIntro(words) {
  const loader = $('#loader');
  const header = $('#header'), label = $('.keep__label'), dot = $('#dot'), note = $('.hero__note');
  const orange = makeDome($('#domeOrange'));
  const cream = makeDome($('#domeCream'));
  const C = CONFIG.content;
  const faint = cssVar('--ink-faint'), ink = cssVar('--ink');

  // starting states (also hidden by CSS under .intro-pending, so there is no flash before JS runs)
  orange.hide(CONFIG.orange.curve);
  cream.hide(CONFIG.cream.curve);
  gsap.set(words, { y: 0, yPercent: 115, color: faint });
  gsap.set([header, label, dot, note], { opacity: 0 });
  gsap.set(header, { yPercent: -100 });
  gsap.set(label, { x: -10 });
  gsap.set(note, { y: 18 });

  const arc = { p: 0, sx: 0, sy: 0 };
  const placeDot = () => {
    const p = arc.p;
    gsap.set(dot, { x: arc.sx * (1 - p * p), y: arc.sy * (1 - p) * (1 - p) });   // quadratic Bezier, ends at rest
  };

  const tl = gsap.timeline({ onComplete: () => startPulse(dot) });
  window.__introTimeline = tl;

  // Frame 2: orange dome rises
  orange.to(tl, CONFIG.orange.start, CONFIG.orange);

  // Frame 3: cream dome rises; orange is pushed up as it comes
  cream.to(tl, CONFIG.cream.start, CONFIG.cream);
  tl.to(orange.svg, { yPercent: -CONFIG.cream.pushOrange, duration: CONFIG.cream.duration, ease: CONFIG.cream.ease }, CONFIG.cream.start);

  // Frame 4: the loader has done its job (cream == page background, so the swap is invisible)
  tl.addLabel('content', C.start);
  tl.call(() => finishIntro(loader), null, 'content');

  tl.to(header, { opacity: 1, yPercent: 0, duration: C.header.duration, ease: C.header.ease }, 'content');
  tl.to(label, { opacity: 1, x: 0, duration: C.label.duration, ease: 'power3.out' }, `content+=${C.label.delay}`);

  // the dot drops from top-centre along an arc to its resting place beside the label
  tl.call(() => {
    gsap.set(dot, { x: 0, y: 0, opacity: 1 });
    const r = dot.getBoundingClientRect();
    arc.sx = window.innerWidth / 2 - (r.left + r.width / 2);
    arc.sy = -(r.top + r.height / 2);
    arc.p = 0;
    placeDot();
  }, null, `content+=${C.dot.delay}`);
  tl.to(arc, { p: 1, duration: C.dot.duration, ease: C.dot.ease, onUpdate: placeDot }, `content+=${C.dot.delay + 0.001}`);

  // headline: rise, then fill from grey to charcoal word by word
  tl.to(words, { yPercent: 0, duration: C.words.duration, ease: C.words.ease, stagger: C.words.stagger }, `content+=${C.words.delay}`);
  tl.to(words, { color: ink, duration: C.fill.duration, ease: C.fill.ease, stagger: C.fill.stagger }, `content+=${C.fill.delay}`);
  tl.to(note, { opacity: 1, y: 0, duration: C.note.duration, ease: C.note.ease }, `content+=${C.note.delay}`);

  return tl;
}

/* ---- boot ------------------------------------------------------------------ */
function boot() {
  const words = splitHeadline();
  initMenu();
  initReveals();

  const loader = $('#loader');
  const playing = root.classList.contains('intro-pending');

  if (!window.gsap) {            // CDN blocked: show the page, skip the show
    finishIntro(loader);
    return;
  }

  if (playing) {
    playIntro(words);
    // failsafe: never leave a visitor staring at a loader
    setTimeout(() => {
      if (root.classList.contains('intro-pending')) {
        if (window.__introTimeline) window.__introTimeline.progress(1);
        finishIntro(loader);
      }
    }, CONFIG.failsafe * 1000);
  } else {
    if (loader) loader.remove();
    startPulse($('#dot'));       // returning visitor / reduced motion: page is simply there (reduced motion: fades in via CSS)
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

/* ==========================================================================
   Portfolio add-ons (vanilla JS, no libraries). Include with:
   <link rel="stylesheet" href="/addons/addons.css"> and <script src="/addons/addons.js" defer></script>
   Switch features on/off here. Everything is opt-in via markup (see README.md).
   ========================================================================== */
(function () {
  var ON = {
    cursor: true,          // orange dot that follows the mouse, swells over [data-cursor-big] and headings
    progress: true,        // thin accent line showing scroll progress
    reveal: true,          // [data-reveal] fades up as it enters the screen
    fill: true,            // [data-fill] text fills word by word as you scroll
    recede: true,          // [data-recede] shrinks/fades while the next section slides over it
    marquee: true,         // .ao-marquee ticker
    curtain: false         // dome wipe between pages (turn on only if you want it site-wide)
  };
  if (window.AO) for (var k0 in window.AO) ON[k0] = window.AO[k0];   // pages can override, e.g. <script>window.AO={curtain:true}</script>
  var T = { follow: 0.18, recedeScale: 0.06, recedeLift: 3, recedeFade: 0.7, curtainMs: 650 };

  var root = document.documentElement;
  var reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  root.classList.add('ao-js');
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var el = function (cls) { var d = document.createElement('div'); d.className = cls; d.setAttribute('aria-hidden', 'true'); document.body.appendChild(d); return d; };

  function cursor() {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var d = el('ao-cursor'), tx = 0, ty = 0, x = 0, y = 0, seen = false, k = reduce ? 1 : T.follow;
    addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      tx = e.clientX; ty = e.clientY;
      if (!seen) { x = tx; y = ty; seen = true; d.classList.add('on'); }
      d.classList.toggle('big', !!e.target.closest('[data-cursor-big], h1'));
    });
    root.addEventListener('pointerleave', function () { d.classList.remove('on'); seen = false; });
    (function tick() { x += (tx - x) * k; y += (ty - y) * k; d.style.transform = 'translate(' + x + 'px,' + y + 'px)'; requestAnimationFrame(tick); })();
  }

  function progress() {
    var d = el('ao-progress');
    function u() { var h = root.scrollHeight - innerHeight; d.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')'; }
    addEventListener('scroll', u, { passive: true }); addEventListener('resize', u); u();
  }

  function reveal() {
    var els = $$('[data-reveal]');
    if (!('IntersectionObserver' in window) || reduce) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  function fill() {
    var blocks = $$('[data-fill]');
    if (!blocks.length) return;
    var all = [];
    function wrap(node, list) {                       // split text into word spans, keeping inline tags (<em>, <a>) intact
      Array.prototype.slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var s = document.createElement('span');
            s.className = 'ao-w'; s.setAttribute('aria-hidden', 'true'); s.textContent = part;
            list.push(s); frag.appendChild(s);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1) wrap(c, list);
      });
    }
    blocks.forEach(function (b) {
      b.setAttribute('aria-label', b.textContent.replace(/\s+/g, ' ').trim());
      b.classList.add('ao-split');
      var words = []; wrap(b, words);
      all.push({ b: b, words: words });
    });
    function u() {
      all.forEach(function (o) {
        var r = o.b.getBoundingClientRect();
        // 0 when the block's top reaches 92% of the screen, 1 when its bottom reaches 72%
        var p = reduce ? 1 : (innerHeight * 0.92 - r.top) / (innerHeight * 0.2 + r.height);
        p = Math.min(1, Math.max(0, p));
        var n = o.words.length;
        o.words.forEach(function (w, i) { w.classList.toggle('on', p >= (i + 1) / n - 0.001 || p >= 1); });
      });
    }
    addEventListener('scroll', u, { passive: true }); addEventListener('resize', u); u();
  }

  function recede() {
    var h = document.querySelector('[data-recede]');
    if (!h || reduce) return;
    var next = h.nextElementSibling;
    function pin() {                                  // a hero taller than the screen pins once its bottom is in view
      h.style.position = 'sticky';
      h.style.top = Math.min(0, innerHeight - h.offsetHeight) + 'px';
    }
    function u() {
      var p = next ? 1 - Math.min(1, Math.max(0, next.getBoundingClientRect().top / innerHeight)) : 0;
      h.style.transform = p ? 'scale(' + (1 - p * T.recedeScale) + ') translateY(' + (-p * T.recedeLift) + 'vh)' : '';
      h.style.opacity = p ? String(1 - p * T.recedeFade) : '';
    }
    pin(); addEventListener('resize', function () { pin(); u(); });
    addEventListener('load', pin);
    addEventListener('scroll', u, { passive: true }); u();
  }

  function marquee() {
    $$('.ao-marquee__track').forEach(function (t) { t.innerHTML += t.innerHTML; });   // doubled for a seamless loop
  }

  function curtain() {
    if (reduce) return;
    var c = el('ao-curtain'), KEY = 'ao-curtain';
    function arrive() {
      var came = false; try { came = sessionStorage.getItem(KEY) === '1'; sessionStorage.removeItem(KEY); } catch (e) {}
      if (!came) return;
      c.classList.add('cover');
      requestAnimationFrame(function () { requestAnimationFrame(function () { c.classList.remove('cover'); c.classList.add('out'); }); });
    }
    arrive();
    addEventListener('pageshow', function (e) { if (e.persisted) { c.className = 'ao-curtain'; } });
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== '_self' || a.hasAttribute('download')) return;
      var u = new URL(a.href, location.href);
      if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search)) return;
      e.preventDefault();
      try { sessionStorage.setItem(KEY, '1'); } catch (x) {}
      c.className = 'ao-curtain in';
      setTimeout(function () { location.href = a.href; }, T.curtainMs);
    });
  }

  function boot() {
    if (ON.cursor) cursor();
    if (ON.progress) progress();
    if (ON.reveal) reveal();
    if (ON.fill) fill();
    if (ON.recede) recede();
    if (ON.marquee) marquee();
    if (ON.curtain) curtain();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

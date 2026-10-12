/* ==========================================================================
   Card deck: turns a grid of tiles (.tile-grid) into a stack of cards you can flick through.
   Used on the portfolio page for the films and photography galleries.
   - top card opens the viewer (the tiles' own click handlers); drag/swipe, arrows or buttons flip through
   - set the look in the FAN table below; timings in addons.css (--deck-ms)
   ========================================================================== */
(function () {
  var FAN = [          // per depth: x (px), y (px), rotate (deg), scale
    [0, 0, 0, 1],
    [-12, 10, -3.5, 0.965],
    [14, 18, 3, 0.93],
    [-22, 26, -7, 0.895],
    [24, 34, 6.5, 0.86]
  ];
  var VISIBLE = FAN.length;
  var reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function makeDeck(grid, noun) {
    var cards = Array.prototype.slice.call(grid.children);
    var n = cards.length;
    if (n < 2) return;
    var top = 0, busy = false;

    var stage = document.createElement('div');
    stage.className = 'deck-stage';
    stage.setAttribute('role', 'group');
    stage.setAttribute('aria-roledescription', 'card deck');
    stage.setAttribute('aria-label', noun + ' deck');
    cards.forEach(function (c) { stage.appendChild(c); });

    var ctrl = document.createElement('div');
    ctrl.className = 'deck-ctrl';
    ctrl.innerHTML =
      '<button type="button" class="deck-btn" data-dir="-1" aria-label="Previous ' + noun + '">&larr;</button>' +
      '<span class="deck-count" aria-live="polite"></span>' +
      '<button type="button" class="deck-btn" data-dir="1" aria-label="Next ' + noun + '">&rarr;</button>';
    var count = ctrl.querySelector('.deck-count');

    grid.classList.add('is-deck');
    grid.appendChild(stage);
    grid.appendChild(ctrl);

    function pos(i) { return (i - top + n) % n; }

    function place(card, p, extra) {
      var f = FAN[Math.min(p, VISIBLE - 1)];
      card.style.zIndex = String(n - p);
      card.style.opacity = p < VISIBLE ? '1' : '0';
      card.style.transform = 'translate(' + f[0] + 'px,' + f[1] + 'px) rotate(' + f[2] + 'deg) scale(' + f[3] + ')' + (extra || '');
      var live = p === 0;
      card.inert = !live;
      card.tabIndex = live ? 0 : -1;
    }

    function render() {
      cards.forEach(function (c, i) { place(c, pos(i)); });
      count.textContent = pad(top + 1) + ' / ' + pad(n);
    }

    function go(dir) {
      if (busy) return;
      busy = true;
      var ms = reduce ? 0 : 560;
      if (dir > 0) {
        var leaving = cards[top];
        leaving.classList.add('is-flying');
        leaving.style.transform = 'translate(115%, -4%) rotate(16deg)';
        leaving.style.opacity = '0';
        setTimeout(function () {
          leaving.classList.remove('is-flying');
          top = (top + 1) % n;
          render();
          busy = false;
        }, ms);
      } else {
        var back = cards[(top - 1 + n) % n];
        back.style.transition = 'none';
        back.style.transform = 'translate(-115%, -4%) rotate(-16deg)';
        back.style.opacity = '0';
        back.style.zIndex = String(n + 1);
        void back.offsetWidth;
        back.style.transition = '';
        top = (top - 1 + n) % n;
        render();
        setTimeout(function () { busy = false; }, ms);
      }
    }

    ctrl.addEventListener('click', function (e) {
      var b = e.target.closest('.deck-btn');
      if (b) go(+b.getAttribute('data-dir'));
    });
    grid.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { go(1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { go(-1); e.preventDefault(); }
    });

    // drag / swipe the top card
    var sx = 0, dx = 0, drag = false, moved = false;
    stage.addEventListener('pointerdown', function (e) {
      var c = e.target.closest('.tile');
      if (!c || c !== cards[top] || busy) return;
      drag = true; moved = false; sx = e.clientX; dx = 0;
      c.setPointerCapture && c.setPointerCapture(e.pointerId);
      c.style.transition = 'none';
    });
    stage.addEventListener('pointermove', function (e) {
      if (!drag) return;
      dx = e.clientX - sx;
      if (Math.abs(dx) > 8) moved = true;
      cards[top].style.transform = 'translate(' + dx + 'px,0) rotate(' + dx / 18 + 'deg)';
    });
    function end() {
      if (!drag) return;
      drag = false;
      var c = cards[top];
      c.style.transition = '';
      if (Math.abs(dx) > 70) {
        if (dx > 0) { go(1); } else { place(c, 0); go(-1); }
      } else { place(c, 0); }
    }
    stage.addEventListener('dragstart', function (e) { e.preventDefault(); });   // no native image drag
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    stage.addEventListener('click', function (e) {          // a drag is not a click
      if (moved) { e.stopImmediatePropagation(); e.preventDefault(); moved = false; }
    }, true);

    render();
  }

  var films = document.getElementById('filmGrid');
  var photos = document.getElementById('photoGrid');
  if (films) makeDeck(films, 'film');
  if (photos) makeDeck(photos, 'photograph');
})();

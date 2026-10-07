/* Aderemi Abdullah Salako — portfolio behaviour.
   Content lives in data.js (projects, skills, testimonials, résumé). */
(function () {
  'use strict';

  var S = window.SITE || { categories: [], projects: [], testimonials: [], skills: [] };
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var esc = function (v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var icon = function (id) { return '<svg aria-hidden="true"><use href="#' + id + '"/></svg>'; };

  /* ---------- theme ---------- */
  var themeBtn = $('#theme-toggle');
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'light' ? '#f3efe6' : '#1f1d1e');
    if (themeBtn) themeBtn.setAttribute('aria-label', t === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
  }
  applyTheme(root.getAttribute('data-theme') || 'dark');
  themeBtn && themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try { localStorage.setItem('rv-theme', next); } catch (e) {}
  });

  /* ---------- mobile drawer ---------- */
  var drawer = $('#drawer'), menuBtn = $('#menu-btn'), lastFocus = null;
  function drawerFocusables() { return $$('a[href], button', drawer.querySelector('.drawer-panel')); }
  function openDrawer() {
    lastFocus = document.activeElement;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { var f = drawerFocusables()[0]; f && f.focus(); }, 50);
  }
  function closeDrawer(restore) {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (restore !== false && lastFocus) lastFocus.focus();
  }
  menuBtn && menuBtn.addEventListener('click', openDrawer);
  $$('[data-close-drawer]').forEach(function (el) { el.addEventListener('click', function () { closeDrawer(); }); });
  $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { closeDrawer(false); }); });
  document.addEventListener('keydown', function (e) {
    if (!drawer.classList.contains('open')) return;
    if (e.key === 'Escape') { closeDrawer(); return; }
    if (e.key === 'Tab') {
      var f = drawerFocusables(), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  window.matchMedia('(min-width: 900px)').addEventListener('change', function (m) { if (m.matches && drawer.classList.contains('open')) closeDrawer(false); });

  /* ---------- waveform decoration ---------- */
  var wave = $('[data-wave]');
  if (wave) {
    var h = '', seed = 7;
    for (var i = 0; i < 90; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      var env = Math.sin((i / 90) * Math.PI) * 0.6 + 0.4;
      h += '<i style="--h:' + Math.max(8, Math.round((seed / 233280) * 100 * env)) + '%"></i>';
    }
    wave.innerHTML = h;
  }

  /* ---------- projects: filters + grid ---------- */
  var grid = $('#project-grid'), filtersEl = $('#filters'), statusEl = $('#filter-status');
  var active = 'all';
  var projById = {};
  S.projects.forEach(function (p) { projById[p.id] = p; });

  function catLabel(id) { var c = S.categories.filter(function (x) { return x.id === id; })[0]; return c ? c.label : id; }

  // category chip takes its discipline colour: editing formats = blue, social = strategy/stone, colour = orange, motion = sand
  var TONE = { youtube: 'd-editing', 'short-form': 'd-editing', social: 'd-strategy', color: 'd-color', motion: 'd-motion' };
  function tone(p) { return TONE[p.categories[0]] || 'd-color'; }

  function cardHtml(p) {
    var feat = !!p.featured;
    var chips = (p.tools || []).map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join('');
    var thumb = '<button class="p-thumb" type="button" data-open-project="' + esc(p.id) + '" aria-label="Preview ' + esc(p.title) + '">' +
      '<img src="' + esc(feat ? p.thumb : (p.thumbSmall || p.thumb)) + '" alt="' + esc(p.alt || p.title) + '" width="1280" height="720" loading="lazy" decoding="async"/>' +
      (p.duration ? '<span class="timecode">' + esc(p.duration) + '</span>' : '') +
      '<span class="mini-play" aria-hidden="true">' + icon('i-play') + '</span></button>';
    var body = '<div class="p-body">' +
      (feat ? '<span class="flag">★ Featured project</span>' : '') +
      '<p class="p-cat" style="--c:var(--' + tone(p) + ')">' + esc(p.categoryLabel) + (p.year ? ' · ' + esc(p.year) : '') + '</p>' +
      '<h3>' + esc(p.title) + '</h3><p>' + esc(p.description) + '</p>' +
      (feat ? '<blockquote>Case-study preview: a restrained palette, skin tones protected, and one saturated detail carrying the whole emotional shift.</blockquote>' : '') +
      '<div class="p-reveal"><div><div class="chips" aria-label="Tools used">' + chips + '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px"><button class="btn btn-primary" type="button" data-open-project="' + esc(p.id) + '">View project</button>' +
      (p.caseStudy ? '<a class="btn btn-outline" href="' + esc(p.caseStudy) + '">Read case study</a>' : '') + '</div></div></div></div>';
    return '<article class="card p-card' + (feat ? ' p-feature' : '') + '" data-id="' + esc(p.id) + '">' + thumb + body + '</article>';
  }

  function emptyHtml(label) {
    var all = label === 'All';
    return '<div class="card empty"><div class="frames" aria-hidden="true"><i></i><i></i><i></i></div>' +
      '<h3>' + (all ? 'More projects are on the cutting-room floor' : 'No ' + esc(label) + ' projects published yet') + '</h3>' +
      '<p>' + (all ? 'This grid only shows finished work I can share. New projects will appear here as they’re published.' :
        'I’m still adding work in this category. If it’s what you need, tell me about your project and I’ll share relevant samples.') + '</p>' +
      '<a class="btn btn-outline" href="#contact">Ask for samples</a></div>';
  }

  function renderProjects() {
    var list = S.projects.filter(function (p) { return active === 'all' || p.categories.indexOf(active) > -1; });
    list.sort(function (a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); });
    var label = catLabel(active);
    var html = list.map(cardHtml).join('');
    // a quiet "more coming" slot beneath published work in the full grid
    if (active === 'all' && list.length < 4) html += emptyHtml('All');
    if (!list.length) html = emptyHtml(label);
    grid.innerHTML = html;
    statusEl.textContent = 'Showing ' + list.length + ' of ' + S.projects.length + ' project' + (S.projects.length === 1 ? '' : 's') + ' · ' + label;
  }

  if (grid && filtersEl) {
    filtersEl.innerHTML = S.categories.map(function (c) {
      return '<button class="filter" type="button" data-cat="' + esc(c.id) + '" aria-pressed="' + (c.id === 'all') + '">' + esc(c.label) + '</button>';
    }).join('');
    filtersEl.addEventListener('click', function (e) {
      var b = e.target.closest('.filter'); if (!b) return;
      active = b.getAttribute('data-cat');
      $$('.filter', filtersEl).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      renderProjects();
    });
    renderProjects();
  }

  /* ---------- project modal ---------- */
  var modal = $('#modal'), mVideo = $('#m-video'), opener = null;
  function openProject(id, trigger) {
    var p = projById[id]; if (!p || !modal.showModal) return;
    opener = trigger || document.activeElement;
    $('#m-cat').textContent = p.categoryLabel + (p.year ? ' · ' + p.year : '');
    $('#m-title').textContent = p.title;
    $('#m-desc').textContent = p.description;
    $('#m-tools').innerHTML = (p.tools || []).map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join('');
    var cs = $('#m-case');
    cs.hidden = !p.caseStudy; if (p.caseStudy) cs.setAttribute('href', p.caseStudy);
    if (p.video) {
      mVideo.parentNode.hidden = false;
      mVideo.setAttribute('poster', p.poster || p.thumb);
      mVideo.setAttribute('aria-label', 'Video: ' + p.title);
      mVideo.src = p.video; // loaded only now, never autoplayed
    } else { mVideo.parentNode.hidden = true; }
    modal.showModal();
  }
  function closeModal() {
    try { mVideo.pause(); } catch (e) {}
    mVideo.removeAttribute('src'); mVideo.load();
    if (opener && opener.focus) opener.focus();
  }
  modal.addEventListener('close', closeModal);
  $('#m-close').addEventListener('click', function () { modal.close(); });
  modal.addEventListener('click', function (e) { if (e.target === modal) modal.close(); }); // backdrop
  $$('#m-case, #m-hire').forEach(function (a) { a.addEventListener('click', function () { modal.close(); }); });
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-open-project]');
    if (t) { e.preventDefault(); openProject(t.getAttribute('data-open-project'), t); }
  });

  /* ---------- skills ---------- */
  var LEVELS = { 1: 'Developing', 2: 'Working knowledge', 3: 'Comfortable' };
  var skillsGrid = $('#skills-grid');
  var SKILL_COLOR = { editing: 'd-editing', color: 'd-color', audio: 'd-audio', motion: 'd-motion', strategy: 'd-strategy' };
  if (skillsGrid) {
    skillsGrid.innerHTML = S.skills.map(function (c, idx) {
      var span = idx < 3 ? 'col-4 col-6-t' : 'col-6 col-6-t';
      var items = c.items.map(function (it) {
        var pips = [1, 2, 3].map(function (n) { return '<i class="' + (n <= it[1] ? 'on' : '') + '" style="--i:' + (n - 1) + '"></i>'; }).join('');
        return '<li class="skill"><div class="row"><span>' + esc(it[0]) + '</span><span class="level">' + LEVELS[it[1]] + '</span></div>' +
          '<div class="pips" role="img" aria-label="' + esc(it[0]) + ': ' + LEVELS[it[1]] + '">' + pips + '</div></li>';
      }).join('');
      return '<article class="skill-cat reveal ' + span + '" style="--c:var(--' + (SKILL_COLOR[c.id] || 'd-color') + ');--d:' + idx * 60 + 'ms"><h3><span class="tag" style="--rot:' + (idx % 2 ? 1.5 : -1.5) + 'deg">' + esc(c.title) + '</span></h3><ul>' + items + '</ul></article>';
    }).join('');
  }

  /* ---------- testimonials / social proof ---------- */
  var proof = $('#proof-list');
  if (proof) {
    if (S.testimonials.length) {
      proof.innerHTML = '<div class="grid">' + S.testimonials.map(function (t) {
        return '<figure class="card quote col-6 reveal" style="margin:0"><blockquote>“' + esc(t.quote) + '”</blockquote><figcaption><strong>' + esc(t.name) + '</strong>' + (t.role ? ', ' + esc(t.role) : '') + '</figcaption></figure>';
      }).join('') + '</div>';
    } else {
      proof.innerHTML = '<figure class="card quote ghost reveal" style="margin:0"><span class="stamp">Placeholder</span>' +
        '<blockquote>Client feedback will appear here once collaborators have shared it.</blockquote>' +
        '<figcaption>Your name, role and company will go here. Add real testimonials in <code>assets/site/data.js</code> and this card is replaced automatically.</figcaption></figure>';
    }
  }

  /* ---------- accordion (approach) & service details ---------- */
  $$('.acc-btn').forEach(function (b) {
    b.addEventListener('click', function () { b.setAttribute('aria-expanded', String(b.getAttribute('aria-expanded') !== 'true')); });
  });
  $$('.svc-btn').forEach(function (b) {
    b.addEventListener('click', function () { b.setAttribute('aria-expanded', String(b.getAttribute('aria-expanded') !== 'true')); });
  });
  var typeSel = $('#f-type');
  $$('[data-service]').forEach(function (a) {
    a.addEventListener('click', function () {
      var v = a.getAttribute('data-service');
      // map the service to the closest project-type option
      var map = { 'Social-media content packages': 'Social-media content package', 'Color correction and basic grading': 'Color correction / grading', 'Audio cleanup and synchronization': 'Audio cleanup & sync', 'Motion graphics and titles': 'Motion graphics & titles' };
      var want = map[v] || v;
      $$('option', typeSel).forEach(function (o) { if (o.textContent === want) typeSel.value = o.textContent; });
    });
  });

  /* ---------- before / after ---------- */
  var ba = $('#ba');
  if (ba) {
    var range = $('input', ba);
    var set = function () { ba.style.setProperty('--pos', range.value + '%'); };
    range.addEventListener('input', set); set();
  }

  /* ---------- reveal & progress on scroll ---------- */
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in-view'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- scroll-spy: header nav, chapter rail, case-study nav ---------- */
  var NAV_OF = { home: 'home', about: 'about', work: 'work', 'case-study': 'work', services: 'services', skills: 'services', process: 'services', proof: 'contact', contact: 'contact' };
  var chapters = $$('[data-chapter]');
  var navLinks = $$('.nav a, .drawer nav a'), railLinks = $$('.rail a');
  function mark(links, id) {
    links.forEach(function (a) { a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + id)); });
  }
  function spy() {
    var y = window.scrollY + window.innerHeight * 0.35, cur = chapters[0].id;
    chapters.forEach(function (s) { if (s.offsetTop <= y) cur = s.id; });
    mark(navLinks, NAV_OF[cur]); mark(railLinks, cur);

    var cs = $('#case-study'), nav = $('#cs-nav');
    if (cs && nav) {
      var top = cs.offsetTop, h = cs.offsetHeight;
      nav.style.setProperty('--p', Math.max(0, Math.min(100, ((window.scrollY - top + window.innerHeight * 0.3) / (h - window.innerHeight * 0.4)) * 100)).toFixed(1));
      var ids = $$('a', nav).map(function (a) { return a.getAttribute('href').slice(1); }), now = ids[0];
      ids.forEach(function (id) { var el = document.getElementById(id); if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) now = id; });
      mark($$('a', nav), now);
    }
  }
  var ticking = false;
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { spy(); ticking = false; }); } }, { passive: true });
  window.addEventListener('resize', spy);
  spy();

  /* ---------- contact form ---------- */
  var form = $('#contact-form'), statusBox = $('#form-status');
  if (form) {
    var rules = {
      name: function (v) { return v.trim() ? '' : 'Please tell me your name.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.'; },
      type: function (v) { return v ? '' : 'Choose the closest project type.'; },
      details: function (v) { return v.trim().length >= 10 ? '' : 'A few lines about the project will help (10+ characters).'; }
    };
    var field = function (n) { return form.elements[n]; };
    function check(n) {
      var f = field(n), msg = rules[n](f.value), e = $('#e-' + n);
      e.textContent = msg; f.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg) f.setAttribute('aria-describedby', 'e-' + n); else f.removeAttribute('aria-describedby');
      return !msg;
    }
    Object.keys(rules).forEach(function (n) { field(n).addEventListener('blur', function () { check(n); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = Object.keys(rules).filter(function (n) { return !check(n); });
      if (bad.length) { field(bad[0]).focus(); return; }
      var d = new FormData(form);
      var body = 'Name: ' + d.get('name') + '\nEmail: ' + d.get('email') + '\nProject type: ' + d.get('type') +
        '\nBudget range: ' + (d.get('budget') || 'Prefer to discuss') + '\n\nProject details:\n' + d.get('details');
      if (typeof gtag === 'function') gtag('event', 'generate_lead', { form: 'portfolio_contact', project_type: d.get('type') });
      location.href = 'mailto:' + S.email + '?subject=' + encodeURIComponent('Project brief — ' + d.get('name')) + '&body=' + encodeURIComponent(body);
      statusBox.hidden = false;
      statusBox.innerHTML = 'Thanks, ' + esc(String(d.get('name')).split(' ')[0]) + '. Your email app should open with the brief ready to send. If it doesn’t, write to <a href="mailto:' + esc(S.email) + '">' + esc(S.email) + '</a> and paste your details in.';
    });
  }

  /* ---------- résumé button ---------- */
  var resume = $('#resume-btn');
  if (resume) {
    if (S.resume) {
      resume.href = S.resume; resume.setAttribute('download', ''); resume.removeAttribute('aria-disabled'); resume.removeAttribute('title');
      resume.querySelector('span').textContent = 'Download résumé (PDF)';
    } else {
      resume.addEventListener('click', function (e) { e.preventDefault(); });
    }
  }

  /* ---------- analytics (same events as the rest of the site) ---------- */
  document.addEventListener('click', function (e) {
    var l = e.target.closest && e.target.closest('[data-hire-cta]');
    if (l && typeof gtag === 'function') {
      gtag('event', 'hire_click', { cta_text: l.textContent.replace(/\s*[→]\s*$/, '').trim(), cta_location: l.getAttribute('data-hire-cta'), page_path: location.pathname });
    }
    var s = e.target.closest && e.target.closest('a[href^="http"]');
    if (s && typeof gtag === 'function') {
      var p = { 'youtube.com': 'youtube', 'instagram.com': 'instagram' }[s.hostname.replace(/^www\./, '')];
      if (p) gtag('event', 'social_click', { platform: p, link_location: s.closest('footer') ? 'footer' : 'contact_section', page_path: location.pathname });
    }
  });

  var yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();
})();

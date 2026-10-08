document.documentElement.classList.add('js-ready');
var yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- nav active state ---------- */
(function () {
  // urls are extensionless, but /page.html still resolves — match either form
  var norm = function (p) { return p.replace(/^\/|\/$/g, '').replace(/\.html$/, '') || 'index'; };
  var page = norm(location.pathname.split('/').filter(Boolean)[0] || '');
  if (page === 'work' || page === 'project') page = 'portfolio';  // case studies live under the portfolio
  document.querySelectorAll('.site-nav a').forEach(function (link) {
    var href = norm(link.getAttribute('href').split('#')[0].split('?')[0]);
    var active = href === page;
    link.classList.toggle('on', active);
    if (active) link.setAttribute('aria-current', 'page');
  });
})();

/* ---------- shared project data (Showreel lightbox + project.html case studies) ----------
   A project with a `url` has its own static, indexable case-study page (e.g.
   work/red-eye-effect/index.html). The rest are concept treatments shown through
   the noindex project.html template until they have real footage and a page. */
var projects = [
  { slug: 'Red Eye Effect', title: 'Red Eye Effect', cat: 'Featured · Colour Study · 2026', meta: 'Colour Grading · 2026',
    desc: 'A cinematic colour study that turns a quiet close-up into an unsettling red-eye reveal through restrained grading and selective colour work.',
    url: '/work/red-eye-effect/',
    video: 'assets/red-eye-effect.mp4', poster: 'assets/red-eye-effect-poster.webp',
    thumb: 'assets/showreel/red-eye-effect-square.webp',
    role: 'Colour grade · selective correction · finishing', focus: 'Cinematic colour study', deliverable: '31-second film',
    brief: 'Build tension without turning the frame into an effect. The image needed to feel intimate first, then quietly strange — a look that rewards a second viewing.',
    approach: 'The treatment keeps the surrounding palette restrained and the contrast controlled, reserving saturation for the eye reveal. Each adjustment was chosen to protect the skin tone and let the emotional shift arrive through colour rather than noise.',
    outcome: 'A compact visual study with a precise focal point: the final grade gives the reveal its weight while preserving the calm that makes it unsettling.' },
  { slug: 'Momentum', title: 'Momentum', cat: 'Commercial · VFX · 2026', meta: 'Commercial · 2026',
    desc: 'A high energy brand film treatment with editorial pacing, VFX polish, colour finishing, and motion led emphasis.',
    thumb: 'assets/showreel/video-placeholder-01.webp',
    poster: 'https://images.unsplash.com/photo-1648827800808-75ce3a93c7de?auto=format&fit=crop&w=1600&q=80',
    role: 'Editing · VFX · colour grade · motion', focus: 'Brand film treatment', deliverable: 'Campaign film concept',
    brief: 'Create a commercial world that feels fast and polished while leaving the central message easy to read.',
    approach: 'The imagined workflow moves from a clean editorial spine into selective compositing and graphic accents. Momentum is treated as a rhythm problem first: every visual intervention earns its place in the cut.',
    outcome: 'A campaign direction designed to feel premium, clear, and adaptable across a hero edit and social cutdowns.' },
  { slug: 'In Frame', title: 'In Frame', cat: 'Short form · 2026', meta: 'Short Form · 2026',
    desc: 'A social first series built around fast cuts, clear structure, captions, and platform ready rhythm.',
    thumb: 'assets/showreel/video-placeholder-02.webp',
    poster: 'https://images.unsplash.com/photo-1548607634-9f8cfca5d944?auto=format&fit=crop&w=1600&q=80',
    role: 'Editing · social content', focus: 'Platform-first storytelling', deliverable: 'Short-form series',
    brief: 'Make the first seconds work hard while keeping the story legible with or without sound.',
    approach: 'The edit establishes a clear visual premise early, uses captions as part of the composition, and maintains a pace that supports the subject.',
    outcome: 'A flexible social-content direction that translates a strong idea into repeatable, audience-conscious episodes.' },
  { slug: 'Between Takes', title: 'Between Takes', cat: 'Film · 2026', meta: 'Film · 2026',
    desc: 'Documentary style finishing focused on visual continuity, careful tone, and colour managed delivery.',
    thumb: 'assets/showreel/video-placeholder-03.webp',
    poster: 'https://images.unsplash.com/photo-1741388503120-5049f5da2733?auto=format&fit=crop&w=1600&q=80',
    role: 'Colour grade · finishing', focus: 'Documentary-style film finish', deliverable: 'Narrative film treatment',
    brief: 'Maintain the truth of the material while giving the film a single, coherent visual atmosphere from beginning to end.',
    approach: 'The finish begins with continuity — matching exposure, skin tone, and colour temperature — then develops a quiet tonal direction that supports the observational pace.',
    outcome: 'A film-treatment approach that makes the visual language feel unified without losing the texture of individual moments.' },
  { slug: 'Visual Rhythm', title: 'Visual Rhythm', cat: 'VFX · 3D Motion · 2026', meta: 'VFX · 2026',
    desc: 'Complex visual effects composite with 3D product motion, particle passes, and dynamic speed ramping.',
    thumb: 'assets/showreel/video-placeholder-04.webp',
    poster: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1600&q=80',
    role: 'VFX · 3D motion · compositing', focus: 'Graphic visual effects', deliverable: 'Motion-led visual treatment',
    brief: 'Bring dimensional energy into the frame while keeping the visual effects legible and integrated with the edit.',
    approach: 'The approach layers animation, particles, and compositing around a clear point of attention. Speed changes are designed into the story rhythm rather than used as standalone flourish.',
    outcome: 'A vivid motion system that gives a campaign or music-led piece greater scale without losing editorial clarity.' },
  { slug: 'Make It Land', title: 'Make It Land', cat: 'Visual ID · 3D Animation · 2026', meta: '3D Animation · 2026',
    desc: 'Identity in motion for campaigns that need clarity, tempo, 3D animated detail, and a memorable final frame.',
    thumb: 'assets/showreel/video-placeholder-05.webp',
    poster: 'assets/red-eye-effect-poster.webp',
    role: 'Creative direction · 3D animation · motion graphics', focus: 'Campaign visual identity', deliverable: 'Motion identity system',
    brief: 'Turn a visual identity into a moving language that can introduce, punctuate, and close a campaign with confidence.',
    approach: 'The system begins with a recognisable visual gesture, then develops it into flexible animation beats for titles, transitions, and end frames.',
    outcome: 'A motion-identity framework that helps the campaign arrive with a clearer point of view and leave a distinct impression.' },
  { slug: 'Lumina', title: 'Lumina', cat: 'Commercial · 2026', meta: 'Commercial · 2026',
    desc: 'Luxury brand spot featuring rich skin tone rendering, natural grain structure, and subtle titles.',
    thumb: 'assets/showreel/video-placeholder-06.webp',
    poster: 'assets/showreel/video-placeholder-06.webp',
    role: 'Editing · colour grade', focus: 'Luxury brand finish', deliverable: 'Commercial spot treatment',
    brief: 'Create an elevated visual finish that feels luxurious and tactile without becoming overly polished or distant.',
    approach: 'The look balances controlled colour with retained texture. Editorial choices are economical, giving the image space and allowing details to do the speaking.',
    outcome: 'A restrained premium finish designed to feel contemporary, warm, and considered across a hero spot and campaign cutdowns.' }
];

/* ---------- Showreel galleries (portfolio.html) ----------
   Photography is temporary placeholder imagery: swap the files in
   assets/showreel/ (keeping the names; WebP keeps them light) or edit the list
   below. `alt` describes the image for search and screen readers.
   Film tiles reuse the projects above; every tile without its own
   footage falls back to PLACEHOLDER_FILM for preview and playback. */
var PLACEHOLDER_FILM = 'assets/red-eye-effect.mp4';

var photos = [
  { src: 'assets/showreel/photography-placeholder-01.webp', title: 'Portrait', meta: 'Studio', alt: 'Studio portrait photograph' },
  { src: 'assets/showreel/photography-placeholder-02.webp', title: 'Lifestyle', meta: 'On location', alt: 'Lifestyle photograph taken on location' },
  { src: 'assets/showreel/photography-placeholder-03.webp', title: 'Headshot', meta: 'Professional', alt: 'Professional headshot photograph' },
  { src: 'assets/showreel/photography-placeholder-04.webp', title: 'Editorial', meta: 'Fashion', alt: 'Editorial fashion photograph' },
  { src: 'assets/showreel/photography-placeholder-05.webp', title: 'Portrait', meta: 'Low key', alt: 'Low-key studio portrait photograph' },
  { src: 'assets/showreel/photography-placeholder-06.webp', title: 'Lifestyle', meta: 'Street', alt: 'Street lifestyle photograph' },
  { src: 'assets/showreel/photography-placeholder-07.webp', title: 'Lifestyle', meta: 'Golden hour', alt: 'Lifestyle photograph at golden hour' },
  { src: 'assets/showreel/photography-placeholder-08.webp', title: 'Product', meta: 'Apparel', alt: 'Product photograph of apparel' }
];

var ICON_VIEW = '<svg class="tile-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
  '<path d="M9 3H3v6M15 3h6v6M9 21H3v-6M15 21h6v-6" /></svg>';
var ICON_PLAY = '<svg class="tile-icon is-play" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
  '<circle cx="12" cy="12" r="10" /><path class="tri" d="M10 8.2l6.2 3.8-6.2 3.8z" /></svg>';

function tile(label, inner) {
  var b = document.createElement('button');
  b.type = 'button';
  b.className = 'tile';
  b.setAttribute('aria-label', label);
  b.innerHTML = inner + '<span class="tile-veil"></span>';
  return b;
}

var photoGrid = document.getElementById('photoGrid');
if (photoGrid) {
  photos.forEach(function (p, i) {
    var b = tile('View ' + p.title + ' photograph',
      '<img src="' + p.src + '" alt="' + (p.alt || p.title) + '" width="1100" height="1100" loading="lazy" decoding="async" />' + ICON_VIEW);
    b.addEventListener('click', function () { openViewer('photo', i); });
    photoGrid.appendChild(b);
  });
}

var filmGrid = document.getElementById('filmGrid');
if (filmGrid) {
  var quiet = matchMedia('(prefers-reduced-motion: reduce)').matches;
  projects.forEach(function (p, i) {
    var b = tile('Play ' + p.title + ' — ' + p.meta,
      '<video src="' + (p.video || PLACEHOLDER_FILM) + '" poster="' + (p.thumb || p.poster) +
      '" muted loop playsinline preload="none" tabindex="-1" aria-hidden="true"></video>' + ICON_PLAY);
    var vid = b.querySelector('video');
    if (!quiet) {
      var play = function () { var r = vid.play(); if (r && r.catch) r.catch(function () {}); };
      var stop = function () { vid.pause(); vid.currentTime = 0; };
      b.addEventListener('mouseenter', play);
      b.addEventListener('mouseleave', stop);
      b.addEventListener('focus', play);
      b.addEventListener('blur', stop);
    }
    b.addEventListener('click', function () { openViewer('film', i); });
    filmGrid.appendChild(b);
  });
}

var allPhotos = document.getElementById('viewAllPhotos');
if (allPhotos) allPhotos.addEventListener('click', function () { openViewer('photo', 0); });
var allFilms = document.getElementById('watchAllFilms');
if (allFilms) allFilms.addEventListener('click', function () { openViewer('film', 0); });

/* ---------- gallery viewer (portfolio.html) ---------- */
var lastFocused = null;
(function () {
  var lb = document.getElementById('lightbox');
  if (!lb) return;
  var lbMedia = document.getElementById('lbMedia');
  var lbTitle = document.getElementById('lbTitle');
  var lbMeta = document.getElementById('lbMeta');
  var lbLink = document.getElementById('lbLink');
  var closeBtn = document.getElementById('lbClose');
  var set = [], pos = 0, kind = 'photo';

  function show(k) {
    pos = (k + set.length) % set.length;
    var item = set[pos];
    if (kind === 'photo') {
      lbMedia.innerHTML = '<img src="' + item.src + '" alt="' + (item.alt || item.title) + '" />';
      lbTitle.textContent = item.title;
      lbMeta.textContent = item.meta;
      lbLink.hidden = true;
    } else {
      lbMedia.innerHTML = '<video src="' + (item.video || PLACEHOLDER_FILM) + '" poster="' + item.poster +
        '" controls playsinline preload="metadata"></video>';
      lbTitle.textContent = item.title;
      lbMeta.textContent = item.cat;
      lbLink.hidden = false;
      lbLink.href = item.url || '/project?project=' + encodeURIComponent(item.slug);
    }
  }

  window.openViewer = function (which, i) {
    kind = which;
    set = which === 'photo' ? photos : projects;
    lastFocused = document.activeElement;
    show(i);
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    setBackgroundInert(true);
    closeBtn.focus();
  };

  // everything except the dialog is inert while it is open, so Tab and screen
  // readers can't wander into the page hidden behind it
  function setBackgroundInert(on) {
    [].forEach.call(document.body.children, function (el) { if (el !== lb) el.inert = on; });
  }

  function close() {
    setBackgroundInert(false);
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    var v = lbMedia.querySelector('video');
    if (v) v.pause();
    lbMedia.innerHTML = '';
    if (lastFocused) lastFocused.focus();
  }

  closeBtn.addEventListener('click', close);
  document.getElementById('lbPrev').addEventListener('click', function () { show(pos - 1); });
  document.getElementById('lbNext').addEventListener('click', function () { show(pos + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target === lb.firstElementChild) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(pos - 1);
    if (e.key === 'ArrowRight') show(pos + 1);
  });
})();

/* ---------- project.html case-study template ---------- */
var caseStudy = document.querySelector('[data-case-study]');
if (caseStudy) {
  var requested = new URLSearchParams(location.search).get('project');
  var project = projects.find(function (p) { return p.slug === requested; }) || projects[0];
  // projects with their own static page live there; send old /project?project= links on
  if (project.url) { location.replace(project.url); }
  document.title = project.title + ' Case Study | Remi Visuals';
  var canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute('href', location.href);
  var descTag = document.querySelector('meta[name="description"]');
  if (descTag) descTag.setAttribute('content', project.desc + ' A project case study from Remi Visuals.');
  document.querySelector('#case-title').textContent = project.title;
  document.querySelector('#case-kicker').textContent = project.cat;
  document.querySelector('#case-summary').textContent = project.desc;
  document.querySelector('#case-brief').textContent = project.brief;
  document.querySelector('#case-approach').textContent = project.approach;
  document.querySelector('#case-outcome').textContent = project.outcome;
  document.querySelector('#case-role').textContent = project.role;
  document.querySelector('#case-focus').textContent = project.focus;
  document.querySelector('#case-deliverable').textContent = project.deliverable;
  var figure = document.querySelector('#case-image').closest('figure');
  if (project.video) {
    var video = document.createElement('video');
    video.controls = true; video.playsInline = true; video.preload = 'metadata';
    video.poster = project.poster; video.src = project.video;
    video.setAttribute('aria-label', 'Watch ' + project.title);
    figure.replaceChild(video, document.querySelector('#case-image'));
  } else {
    var img = document.querySelector('#case-image');
    img.src = project.poster; img.alt = project.title;
  }
  var caption = document.querySelector('#case-caption');
  if (caption) caption.textContent = project.title + ' · final frame.';
  var inquiry = document.querySelector('.case-inquiry');
  if (inquiry) inquiry.href = '/contact?ref=' + encodeURIComponent(project.title) + '#contact';
}

/* ---------- journal ----------
   Posts are static pages at journal/<slug>/index.html, so search engines read
   the full text without running JavaScript. They are generated from
   content/journal/<slug>.md by tools/build.mjs: write and edit posts at /admin,
   and the "Build journal" GitHub Action rebuilds the pages, the journal list,
   sitemap.xml, sitemap.html, feed.xml and llms.txt (see docs/SEO-CHECKLIST.md). */

/* ---------- analytics: email link clicks ----------
   Sends a GA4 `email_click` event for every mailto: link, including ones added
   later. Neither the address nor the link text (which can be the address) is
   sent, since GA forbids email addresses in hits. email_type tells a CV
   request apart from a general enquiry. */
document.addEventListener('click', function (e) {
  var link = e.target.closest && e.target.closest('a[href^="mailto:"]');
  if (!link || typeof gtag !== 'function') return;
  var subject = (link.href.split('?subject=')[1] || '').split('&')[0];
  gtag('event', 'email_click', {
    email_type: /cv/i.test(decodeURIComponent(subject)) ? 'cv_request' : 'contact',
    page_path: location.pathname
  });
});

/* ---------- analytics: Hire me / Start a project clicks ----------
   Any link marked data-hire-cta="<where it sits>" sends a GA4 `hire_click`
   event with the button text and that location. To track a new hire button,
   add the attribute; no script changes needed. */
document.addEventListener('click', function (e) {
  var link = e.target.closest && e.target.closest('[data-hire-cta]');
  if (!link || typeof gtag !== 'function') return;
  gtag('event', 'hire_click', {
    cta_text: link.textContent.replace(/\s*\u2192\s*$/, '').trim(),
    cta_location: link.getAttribute('data-hire-cta'),
    page_path: location.pathname
  });
});

/* ---------- analytics: social profile clicks ----------
   Sends a GA4 `social_click` event for links to the profiles below, wherever
   they appear. link_location says whether it was the footer or the contact
   page list. To track another network, add its hostname here. */
var SOCIAL = { 'youtube.com': 'youtube', 'instagram.com': 'instagram' };
document.addEventListener('click', function (e) {
  var link = e.target.closest && e.target.closest('a[href^="http"]');
  if (!link || typeof gtag !== 'function') return;
  var platform = SOCIAL[link.hostname.replace(/^www\./, '')];
  if (!platform) return;
  gtag('event', 'social_click', {
    platform: platform,
    link_location: link.closest('footer') ? 'footer' : link.closest('.contact-links') ? 'contact_page' : 'page_body',
    page_path: location.pathname
  });
});

/* ---------- analytics: journal clicks ----------
   Sends a GA4 `journal_click` event for every link to a journal post
   (/journal/<slug>/), wherever it appears: the journal list, the homepage,
   related-post links. Posts added later are covered automatically. Links to
   the journal index itself (/journal/) are not posts and are ignored. */
document.addEventListener('click', function (e) {
  var link = e.target.closest && e.target.closest('a[href]');
  if (!link || typeof gtag !== 'function') return;
  var m = link.pathname.match(/^\/journal\/([^\/]+)\/?(?:index\.html)?$/);
  if (!m || link.hostname !== location.hostname) return;
  var heading = link.querySelector('h1, h2, h3, h4');
  gtag('event', 'journal_click', {
    post_slug: m[1],
    post_title: (heading || link).textContent.replace(/\s+/g, ' ').trim().slice(0, 100),
    link_location: link.closest('.journal-list') ? 'journal_list' : link.closest('footer') ? 'footer' : 'page_body',
    page_path: location.pathname
  });
});

/* ---------- contact form (contact.html) ---------- */
var form = document.querySelector('.contact-form');
form && form.addEventListener('submit', function (event) {
  event.preventDefault();
  var data = new FormData(form);
  var body = 'Name: ' + data.get('name') + '\nEmail: ' + data.get('email') + '\n\n' + data.get('brief');
  location.href = 'mailto:hello@aderemisalako.me?subject=' + encodeURIComponent('Project brief — ' + data.get('name')) + '&body=' + encodeURIComponent(body);
});

/* ---------- intro preloader (index.html) ---------- */
(function () {
  var root = document.documentElement;
  var intro = document.getElementById('intro');
  if (!intro || !root.classList.contains('intro-on')) return;

  // 2200 + 520 + 420 = 3.1s, or 3.3s if the hero image still needs a moment
  var WRITE = 2200, HOLD = 520, FADE = 420, HERO_WAIT = 200;
  var strokes = [].slice.call(intro.querySelectorAll('.intro-stroke'));
  var fills = [].slice.call(intro.querySelectorAll('.intro-fill'));
  var pen = document.getElementById('intro-pen');
  // each letter is traced as one or more outlines, then inked in once its last outline is done
  var glyphOf = strokes.map(function (path) { return +path.getAttribute('data-g'); });
  var lastStroke = {};
  glyphOf.forEach(function (g, i) { lastStroke[g] = i; });
  var lengths = strokes.map(function (path) {
    var len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    return len;
  });
  var total = lengths.reduce(function (a, b) { return a + b; }, 0);
  var raf = null, dismissed = false;

  function draw(distance) {
    var walked = 0, active = 0, at = 0;
    for (var i = 0; i < strokes.length; i++) {
      var drawn = Math.max(0, Math.min(lengths[i], distance - walked));
      strokes[i].style.strokeDashoffset = lengths[i] - drawn;
      if (drawn > 0) { active = i; at = drawn; }
      if (lastStroke[glyphOf[i]] === i && fills[glyphOf[i]]) fills[glyphOf[i]].classList.toggle('is-on', drawn >= lengths[i] - 0.5);
      walked += lengths[i];
    }
    var point = strokes[active].getPointAtLength(at);
    pen.setAttribute('transform', 'translate(' + point.x + ',' + point.y + ') rotate(34)');
  }

  function dismiss(fade) {
    if (dismissed) return;
    dismissed = true;
    if (raf) cancelAnimationFrame(raf);
    try { sessionStorage.setItem('rv-intro', '1'); } catch (e) {}
    intro.style.transitionDuration = fade + 'ms';
    intro.classList.add('is-out');
    setTimeout(function () {
      root.classList.remove('intro-on');
      if (intro.parentNode) intro.parentNode.removeChild(intro);
    }, fade);
  }

  // hold the curtain until the hero image is ready, but never for long
  function whenHeroReady(next) {
    var hero = document.querySelector('.hero-figure img');
    if (!hero || hero.complete) return next();
    var fired = false;
    var go = function () { if (!fired) { fired = true; next(); } };
    hero.addEventListener('load', go);
    hero.addEventListener('error', go);
    setTimeout(go, HERO_WAIT);
  }

  function skip() {
    draw(total);
    pen.classList.remove('is-writing');
    dismiss(250);
  }

  document.getElementById('intro-skip').addEventListener('click', skip);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !dismissed) skip();
  });

  draw(0);
  pen.classList.add('is-writing');
  var start = null;
  raf = requestAnimationFrame(function step(now) {
    if (start === null) start = now;
    var t = Math.min(1, (now - start) / WRITE);
    draw(t * t * (3 - 2 * t) * total);          // smoothstep, so it starts and settles gently
    if (t < 1) { raf = requestAnimationFrame(step); return; }
    pen.classList.remove('is-writing');          // lift the pen off the finished name
    setTimeout(function () { whenHeroReady(function () { dismiss(FADE); }); }, HOLD);
  });
})();

/* ---------- scroll reveal (runs last so dynamically-inserted .reveal elements, e.g. the work index rows, are included) ---------- */
(function () {
  var targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  targets.forEach(function (el) { io.observe(el); });
})();

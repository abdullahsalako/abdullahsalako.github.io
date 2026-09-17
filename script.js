document.documentElement.classList.add('js-ready');
var yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- nav active state ---------- */
(function () {
  // urls are extensionless, but /page.html still resolves — match either form
  var norm = function (p) { return p.replace(/^\//, '').replace(/\.html$/, '') || 'index'; };
  var page = norm(location.pathname.split('/').filter(Boolean)[0] || '');
  document.querySelectorAll('.site-nav a').forEach(function (link) {
    var href = norm(link.getAttribute('href').split('#')[0].split('?')[0]);
    var active = href === page;
    link.classList.toggle('on', active);
    if (active) link.setAttribute('aria-current', 'page');
  });
})();

/* ---------- shared project data (Work index + lightbox + project.html case studies) ---------- */
var projects = [
  { slug: 'Red Eye Effect', title: 'Red Eye Effect', cat: 'Featured · Colour Study · 2026', meta: 'Colour Grading · 2026',
    desc: 'A cinematic colour study that turns a quiet close-up into an unsettling red-eye reveal through restrained grading and selective colour work.',
    video: 'assets/red-eye-effect.mp4', poster: 'assets/red-eye-effect-poster.jpg',
    thumb: 'assets/showreel/red-eye-effect-square.jpg',
    role: 'Colour grade · selective correction · finishing', focus: 'Cinematic colour study', deliverable: '31-second film',
    brief: 'Build tension without turning the frame into an effect. The image needed to feel intimate first, then quietly strange — a look that rewards a second viewing.',
    approach: 'The treatment keeps the surrounding palette restrained and the contrast controlled, reserving saturation for the eye reveal. Each adjustment was chosen to protect the skin tone and let the emotional shift arrive through colour rather than noise.',
    outcome: 'A compact visual study with a precise focal point: the final grade gives the reveal its weight while preserving the calm that makes it unsettling.' },
  { slug: 'Momentum', title: 'Momentum', cat: 'Commercial · VFX · 2026', meta: 'Commercial · 2026',
    desc: 'A high energy brand film treatment with editorial pacing, VFX polish, colour finishing, and motion led emphasis.',
    thumb: 'assets/showreel/video-placeholder-01.jpg',
    poster: 'https://images.unsplash.com/photo-1648827800808-75ce3a93c7de?auto=format&fit=crop&w=1600&q=80',
    role: 'Editing · VFX · colour grade · motion', focus: 'Brand film treatment', deliverable: 'Campaign film concept',
    brief: 'Create a commercial world that feels fast and polished while leaving the central message easy to read.',
    approach: 'The imagined workflow moves from a clean editorial spine into selective compositing and graphic accents. Momentum is treated as a rhythm problem first: every visual intervention earns its place in the cut.',
    outcome: 'A campaign direction designed to feel premium, clear, and adaptable across a hero edit and social cutdowns.' },
  { slug: 'In Frame', title: 'In Frame', cat: 'Short form · 2026', meta: 'Short Form · 2026',
    desc: 'A social first series built around fast cuts, clear structure, captions, and platform ready rhythm.',
    thumb: 'assets/showreel/video-placeholder-02.jpg',
    poster: 'https://images.unsplash.com/photo-1548607634-9f8cfca5d944?auto=format&fit=crop&w=1600&q=80',
    role: 'Editing · social content', focus: 'Platform-first storytelling', deliverable: 'Short-form series',
    brief: 'Make the first seconds work hard while keeping the story legible with or without sound.',
    approach: 'The edit establishes a clear visual premise early, uses captions as part of the composition, and maintains a pace that supports the subject.',
    outcome: 'A flexible social-content direction that translates a strong idea into repeatable, audience-conscious episodes.' },
  { slug: 'Between Takes', title: 'Between Takes', cat: 'Film · 2026', meta: 'Film · 2026',
    desc: 'Documentary style finishing focused on visual continuity, careful tone, and colour managed delivery.',
    thumb: 'assets/showreel/video-placeholder-03.jpg',
    poster: 'https://images.unsplash.com/photo-1741388503120-5049f5da2733?auto=format&fit=crop&w=1600&q=80',
    role: 'Colour grade · finishing', focus: 'Documentary-style film finish', deliverable: 'Narrative film treatment',
    brief: 'Maintain the truth of the material while giving the film a single, coherent visual atmosphere from beginning to end.',
    approach: 'The finish begins with continuity — matching exposure, skin tone, and colour temperature — then develops a quiet tonal direction that supports the observational pace.',
    outcome: 'A film-treatment approach that makes the visual language feel unified without losing the texture of individual moments.' },
  { slug: 'Visual Rhythm', title: 'Visual Rhythm', cat: 'VFX · 3D Motion · 2026', meta: 'VFX · 2026',
    desc: 'Complex visual effects composite with 3D product motion, particle passes, and dynamic speed ramping.',
    thumb: 'assets/showreel/video-placeholder-04.jpg',
    poster: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1600&q=80',
    role: 'VFX · 3D motion · compositing', focus: 'Graphic visual effects', deliverable: 'Motion-led visual treatment',
    brief: 'Bring dimensional energy into the frame while keeping the visual effects legible and integrated with the edit.',
    approach: 'The approach layers animation, particles, and compositing around a clear point of attention. Speed changes are designed into the story rhythm rather than used as standalone flourish.',
    outcome: 'A vivid motion system that gives a campaign or music-led piece greater scale without losing editorial clarity.' },
  { slug: 'Make It Land', title: 'Make It Land', cat: 'Visual ID · 3D Animation · 2026', meta: '3D Animation · 2026',
    desc: 'Identity in motion for campaigns that need clarity, tempo, 3D animated detail, and a memorable final frame.',
    thumb: 'assets/showreel/video-placeholder-05.jpg',
    poster: 'assets/red-eye-effect-poster.jpg',
    role: 'Creative direction · 3D animation · motion graphics', focus: 'Campaign visual identity', deliverable: 'Motion identity system',
    brief: 'Turn a visual identity into a moving language that can introduce, punctuate, and close a campaign with confidence.',
    approach: 'The system begins with a recognisable visual gesture, then develops it into flexible animation beats for titles, transitions, and end frames.',
    outcome: 'A motion-identity framework that helps the campaign arrive with a clearer point of view and leave a distinct impression.' },
  { slug: 'Lumina', title: 'Lumina', cat: 'Commercial · 2026', meta: 'Commercial · 2026',
    desc: 'Luxury brand spot featuring rich skin tone rendering, natural grain structure, and subtle titles.',
    thumb: 'assets/showreel/video-placeholder-06.jpg',
    poster: 'assets/showreel/video-placeholder-06.jpg',
    role: 'Editing · colour grade', focus: 'Luxury brand finish', deliverable: 'Commercial spot treatment',
    brief: 'Create an elevated visual finish that feels luxurious and tactile without becoming overly polished or distant.',
    approach: 'The look balances controlled colour with retained texture. Editorial choices are economical, giving the image space and allowing details to do the speaking.',
    outcome: 'A restrained premium finish designed to feel contemporary, warm, and considered across a hero spot and campaign cutdowns.' }
];

/* ---------- Showreel galleries (portfolio.html) ----------
   Photography is temporary placeholder imagery: swap the files in
   assets/showreel/ (keeping the names) or edit the list below.
   Film tiles reuse the projects above; every tile without its own
   footage falls back to PLACEHOLDER_FILM for preview and playback. */
var PLACEHOLDER_FILM = 'assets/red-eye-effect.mp4';

var photos = [
  { src: 'assets/showreel/photography-placeholder-01.jpg', title: 'Portrait', meta: 'Studio' },
  { src: 'assets/showreel/photography-placeholder-02.jpg', title: 'Lifestyle', meta: 'On location' },
  { src: 'assets/showreel/photography-placeholder-03.jpg', title: 'Headshot', meta: 'Professional' },
  { src: 'assets/showreel/photography-placeholder-04.jpg', title: 'Editorial', meta: 'Fashion' },
  { src: 'assets/showreel/photography-placeholder-05.jpg', title: 'Portrait', meta: 'Low key' },
  { src: 'assets/showreel/photography-placeholder-06.jpg', title: 'Lifestyle', meta: 'Street' },
  { src: 'assets/showreel/photography-placeholder-07.jpg', title: 'Lifestyle', meta: 'Golden hour' },
  { src: 'assets/showreel/photography-placeholder-08.jpg', title: 'Product', meta: 'Apparel' }
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
    var b = tile('View ' + p.title, '<img src="' + p.src + '" alt="' + p.title + '" loading="lazy" />' + ICON_VIEW);
    b.addEventListener('click', function () { openViewer('photo', i); });
    photoGrid.appendChild(b);
  });
}

var filmGrid = document.getElementById('filmGrid');
if (filmGrid) {
  var quiet = matchMedia('(prefers-reduced-motion: reduce)').matches;
  projects.forEach(function (p, i) {
    var b = tile('Play ' + p.title,
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
      lbMedia.innerHTML = '<img src="' + item.src + '" alt="' + item.title + '" />';
      lbTitle.textContent = item.title;
      lbMeta.textContent = item.meta;
      lbLink.hidden = true;
    } else {
      lbMedia.innerHTML = '<video src="' + (item.video || PLACEHOLDER_FILM) + '" poster="' + item.poster +
        '" controls playsinline preload="metadata"></video>';
      lbTitle.textContent = item.title;
      lbMeta.textContent = item.cat;
      lbLink.hidden = false;
      lbLink.href = '/project?project=' + encodeURIComponent(item.slug);
    }
  }

  window.openViewer = function (which, i) {
    kind = which;
    set = which === 'photo' ? photos : projects;
    lastFocused = document.activeElement;
    show(i);
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  function close() {
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
  if (inquiry) inquiry.href = '/notices?ref=' + encodeURIComponent(project.title) + '#contact';
}

/* ---------- journal article template (article.html?post=slug) ---------- */
/* ---------- journal posts ----------
   Every post is published at /journal/<slug>, and that slug is also the folder
   name under journal/. It is derived from the title by slugify() unless the
   entry pins one explicitly, which is worth doing when the title is long or
   likely to be reworded. */
function slugify(title) {
  return String(title)
    .toLowerCase()
    .replace(/['\u2018\u2019"\u201c\u201d]/g, '')  // drop apostrophes and quotes rather than hyphenating them
    .replace(/[^a-z0-9]+/g, '-')                  // every other separator or symbol becomes a hyphen
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

var journal = [
  { slug: 'node-workflow',   // pinned: the full title makes for an unwieldy url
    tag: 'Colour Grade Note',
    title: 'The DaVinci Resolve Node Workflow for Cinematic Skin Tones',
    date: '15 Sep 2026', readTime: '6 min read',
    body: [
      { p: "Every grade I build for a face starts the same way: get the exposure and the LOG transform right before a single hue is touched. Skin is the one thing a viewer has calibrated their whole life — it forgives almost nothing, so the node tree has to earn cinematic warmth without ever announcing itself." },
      { h2: '1. Primary exposure balance' },
      { p: 'The first node does one job: even out exposure across the face before any look is applied. A soft power window keyed to the highlights on the forehead and cheekbones, blended at low opacity, prevents the grade downstream from having to fight uneven light.' },
      { h2: '2. The LOG transform' },
      { p: 'Converting into a working colour space early means every later node operates on predictable values. I keep a scope open through this stage — not for the shape of the curve, but to confirm skin sits where it should before anything stylistic happens.' },
      { h2: '3. Parallel HSL isolation' },
      { p: "This is the actual warmth: a qualifier isolates the skin-tone range in parallel with the rest of the frame, so adjustments to hue and saturation land only where they're meant to. Small moves — a few degrees of hue, a touch of saturation — read as a lot on a close-up." },
      { quote: 'The goal is never a “look.” It’s a face that reads as itself, just lit a little more generously than the camera saw it.' },
      { h2: '4. Soft grain overlay' },
      { p: 'The last node adds a fine, even grain over the full frame at low opacity. It does two things at once: it unifies footage shot across slightly different conditions, and it keeps skin from looking over-smoothed once the isolation node has done its work.' },
      { p: 'None of this is complicated on its own. What makes it repeatable is building it as a saved node tree, so every new project starts from the same disciplined base instead of a blank page.' }
    ]
  },
  { slug: '27-in-retrospect',   // pinned so rewording the title cannot move the url
    tag: 'Personal · Reflection',
    title: '27, in Retrospect',
    dek: "You don't notice the climb until you look down",
    date: '14 Jul 2026', readTime: '2 min read',
    cover: '/assets/journal/27-in-retrospect.webp',
    sourceUrl: 'https://substack.com/home/post/p-206814420',
    body: [
      { p: "My birthdays have never really been days of celebration. They've always been days of introspection." },
      { p: 'Today, I turned 28.' },
      { p: "Every year since I turned 23, I take some time to sit with my thoughts and reflect on the year I've just lived. It's like my own quiet version of a New Year reflection and resolution." },
      { p: "I usually pen down these thoughts, and they always end up somewhere in one of my diaries never to be read again. One of the things I'm trying to do more of is put myself out there. That's why you're reading this." },
      { p: 'I spent the latter part of being 27 feeling somewhat unhappy. Why?' },
      { p: 'Every year, I ask myself the same question:' },
      { quote: 'What does it mean to say I am satisfied with my life?' },
      { p: 'That question is almost directly asking how my life is measuring up to my expectations.' },
      { p: "As you grow older, your expectations of what you'll get out of life begin to change. Perhaps the unhappy version of me is caught between two things: expecting the future to be worse than I once imagined, or realizing that I haven't achieved what my younger self expected I would have by now." },
      { p: "Maybe that's what they call a midlife crisis." },
      { p: "Looking back, 27 wasn't really a bad year. In fact, it was one of the years I pushed myself the most. I tried a couple of new things. I started playing tennis." },
      { p: "At 28, I want to live more. I want to put myself out there, meet more people, and be more extroverted. It's never come naturally to me, but I want to change that." },
      { p: "I'll end with this picture of my younger self." },
      { img: '/assets/journal/27-in-retrospect-young.jpg', alt: 'A childhood photo of the author' },
      { p: 'He probably thought life would look very different by 28.' },
      { p: "Maybe I haven't become everything he imagined." },
      { p: "But I hope he'd be proud that I never stopped trying." },
      { p: 'On to 28.' },
      { p: 'Happy birthday to me.' },
      { p: 'May the pieces finally begin to fall into place. May the coast start aligning in my favor.' },
      { p: 'And to everyone reading this, I hope life meets you with kindness, courage, and moments that remind you why you kept going.' },
      { p: 'Bye, 27.' }
    ]
  }
];

/* slug -> post, filling in derived slugs and keeping them unique */
var posts = {};
journal.forEach(function (post) {
  var base = post.slug || slugify(post.title);
  var year = (String(post.date).match(/\d{4}/) || [''])[0];
  var slug = base;
  // a clash stays readable by qualifying with the year before falling back to a counter
  if (posts[slug] && year) slug = base + '-' + year;
  for (var n = 2; posts[slug]; n++) slug = base + '-' + n;
  post.slug = slug;
  post.url = '/journal/' + slug;
  posts[slug] = post;
});

var articleRoot = document.querySelector('[data-article]');
if (articleRoot) {
  // /journal/<slug> — each post is a real page, so its head metadata is already correct
  var slug = location.pathname.replace(/\/+$/, '').split('/').filter(Boolean).pop();
  var post = posts[slug];

  if (!post) {
    // usually means the folder name and the post's slug have drifted apart
    if (window.console) console.warn('No journal post for "' + slug + '". Known slugs: ' + Object.keys(posts).join(', '));
    document.title = 'Article not found | Remi Visuals';
    document.querySelector('#post-tag').textContent = 'Journal';
    document.querySelector('#post-title').textContent = 'Article not found';
    document.querySelector('#post-body').innerHTML =
      '<p>That entry does not exist, or it has moved. ' +
      '<a href="/journal">Browse the journal</a> to find what you are after.</p>';
  } else {
    document.querySelector('#post-tag').textContent = post.tag;
    document.querySelector('#post-title').textContent = post.title;
    var dekEl = document.querySelector('#post-dek');
    if (dekEl) {
      if (post.dek) { dekEl.textContent = post.dek; dekEl.hidden = false; }
      else { dekEl.textContent = ''; dekEl.hidden = true; }
    }
    document.querySelector('#post-date').textContent = post.date;
    document.querySelector('#post-readtime').textContent = post.readTime;
    var bodyHtml = post.body.map(function (block) {
      if (block.h2) return '<h2>' + block.h2 + '</h2>';
      if (block.quote) return '<blockquote>' + block.quote + '</blockquote>';
      if (block.img) return '<img src="' + block.img + '" alt="' + (block.alt || '') + '" loading="lazy" />';
      return '<p>' + block.p + '</p>';
    }).join('');
    if (post.sourceUrl) {
      bodyHtml += '<p class="article-source">Originally published on <a href="' + post.sourceUrl + '" target="_blank" rel="noopener">Substack</a>.</p>';
    }
    document.querySelector('#post-body').innerHTML = bodyHtml;
  }
}

/* ---------- contact form (notices.html) ---------- */
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

  // 1850 + 480 + 420 = 2.75s, or 2.95s if the hero image still needs a moment
  var WRITE = 1850, HOLD = 480, FADE = 420, HERO_WAIT = 200;
  var strokes = [].slice.call(intro.querySelectorAll('.intro-stroke'));
  var pen = document.getElementById('intro-pen');
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

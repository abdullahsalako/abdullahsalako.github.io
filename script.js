const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
function setTheme(theme) {
  root.dataset.theme = theme;
  try { localStorage.setItem('remi-theme', theme); } catch {}
  const dark = theme === 'dark';
  themeToggle?.setAttribute('aria-pressed', String(dark));
  themeToggle?.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
  if (themeToggle) themeToggle.textContent = dark ? '☀ Light edition' : '☾ Dark edition';
}
let savedTheme;
try { savedTheme = localStorage.getItem('remi-theme'); } catch {}
setTheme(['dark', 'light'].includes(savedTheme) ? savedTheme : 'light');
themeToggle?.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));
const projectCards = [...document.querySelectorAll('.project-card')];
const count = document.querySelector('.project-count');
document.querySelectorAll('.filter').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(item => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    projectCards.forEach(card => { card.hidden = button.dataset.filter !== 'all' && !card.dataset.category.split(/\s+/).includes(button.dataset.filter); });
    if (count) { const visible = projectCards.filter(card => !card.hidden).length; count.textContent = `${visible} ${visible === 1 ? 'feature' : 'features'} in this section`; }
  });
});
const modal = document.querySelector('.project-modal');
let activeProject;
if (modal) {
  document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
    activeProject = button;
    modal.querySelector('#modalTitle').textContent = button.dataset.project;
    modal.querySelector('.modal-summary').textContent = button.querySelector('.project-desc').textContent;
    modal.querySelector('.modal-tools').textContent = button.querySelector('.project-tools').textContent;
    const visual = modal.querySelector('.modal-visual');
    visual.replaceChildren();
    const videoSource = button.dataset.video;
    if (videoSource) {
      const video = document.createElement('video');
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.poster = button.dataset.poster || '';
      video.src = videoSource;
      video.setAttribute('aria-label', `${button.dataset.project} video`);
      visual.append(video);
    } else {
      const source = button.querySelector('img');
      if (source) { const img = source.cloneNode(); img.loading = 'eager'; visual.append(img); }
    }
    modal.querySelector('.modal-note').textContent = videoSource
      ? 'A short colour-grading study presented in its final cinematic format.'
      : 'For viewing access and further project details, contact the editing desk.';
    modal.querySelector('.modal-inquiry').href = `mailto:abdullahsalako@gmail.com?subject=${encodeURIComponent('Portfolio inquiry: ' + button.dataset.project)}`;
    modal.showModal();
  }));
  modal.querySelector('.modal-close').addEventListener('click', () => modal.close());
  modal.addEventListener('close', () => {
    modal.querySelector('video')?.pause();
    activeProject?.focus();
  });
  modal.addEventListener('click', event => {
    if (event.target !== modal) return;
    const r = modal.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) modal.close();
  });
}
const page = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.primary-nav a').forEach(link => {
  const active = link.getAttribute('href') === page;
  link.classList.toggle('active', active);
  if (active) link.setAttribute('aria-current', 'page');
  else link.removeAttribute('aria-current');
});
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
const form = document.querySelector('.contact-form');
form?.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(form);
  const body = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nService: ${data.get('service') || 'Let’s discuss'}\n\n${data.get('brief')}`;
  location.href = `mailto:abdullahsalako@gmail.com?subject=${encodeURIComponent('Project brief — ' + data.get('name'))}&body=${encodeURIComponent(body)}`;
});

// A decorative quill; the small ink point stays at the actual click position.
(() => {
  const desktop = matchMedia('(min-width: 769px) and (hover: hover) and (pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const cursor = document.createElement('div');
  cursor.className = 'quill-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = `<span class="quill-point"></span><svg class="quill-feather" viewBox="0 0 32 40" fill="none" focusable="false" aria-hidden="true">
    <path d="M6 33C6 24 9 13 17 6C21 3 26 2 29 2C29 8 27 14 24 19L20 20L22 23C18 28 12 30 6 33Z" fill="currentColor" fill-opacity=".9"/>
    <path d="M3 38C9 25 17 14 26 6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M11 25L10 18M15 20L14 12M19 15L19 8M13 24L20 23M17 19L24 16" stroke="var(--paper)" stroke-width=".7" stroke-linecap="round"/>
  </svg>`;
  const feather = cursor.querySelector('.quill-feather');
  let x = 0, y = 0, followX = 0, followY = 0, angle = 0, targetAngle = 0;
  let frame = 0, lastFrame = 0, idleTimer = 0, hasPointer = false, visible = false;
  let previousScroll = window.scrollY;

  function hide(resetPointer = true) {
    visible = false;
    if (resetPointer) hasPointer = false;
    cursor.classList.remove('is-visible');
    document.documentElement.classList.remove('quill-active');
    clearTimeout(idleTimer);
    cancelAnimationFrame(frame);
    frame = 0;
    lastFrame = 0;
  }

  function draw(time) {
    frame = 0;
    if (!visible) return;
    const blend = reducedMotion.matches ? 1 : 1 - Math.exp(-Math.min(time - (lastFrame || time - 16), 40) / 55);
    lastFrame = time;
    followX += (x - followX) * blend;
    followY += (y - followY) * blend;
    angle += (targetAngle - angle) * blend;
    // Limit the trail to ten pixels even after a quick sweep across the page.
    const offsetX = Math.max(-10, Math.min(10, followX - x));
    const offsetY = Math.max(-10, Math.min(10, followY - y));
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    feather.style.transform = `translate(${8 + offsetX}px, ${-30 + offsetY}px) rotate(${reducedMotion.matches ? 0 : angle}deg)`;
    targetAngle *= .82;
    if (!reducedMotion.matches && (Math.abs(followX - x) + Math.abs(followY - y) + Math.abs(angle) > .1)) {
      frame = requestAnimationFrame(draw);
    } else lastFrame = 0;
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(draw);
  }

  function show() {
    visible = true;
    cursor.classList.add('is-visible');
    document.documentElement.classList.add('quill-active');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => hide(false), 2600);
    schedule();
  }

  document.addEventListener('pointermove', event => {
    if (!desktop.matches || event.pointerType !== 'mouse' || event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) {
      hide();
      return;
    }
    // Keep the decoration in the active dialog's top layer when one is open.
    const host = document.querySelector('dialog[open]') || document.body;
    if (cursor.parentElement !== host) host.append(cursor);
    const dx = event.clientX - x, dy = event.clientY - y;
    x = event.clientX;
    y = event.clientY;
    if (!hasPointer) { followX = x; followY = y; angle = 0; }
    targetAngle = reducedMotion.matches ? 0 : Math.max(-12, Math.min(12, dx * .3 - dy * .15));
    hasPointer = true;
    show();
  }, { passive: true });

  window.addEventListener('scroll', () => {
    const delta = window.scrollY - previousScroll;
    previousScroll = window.scrollY;
    if (!desktop.matches || !hasPointer) return;
    targetAngle = reducedMotion.matches ? 0 : Math.max(-8, Math.min(8, delta * .15));
    show();
  }, { passive: true });
  document.addEventListener('pointerdown', event => { if (event.pointerType !== 'mouse') hide(); }, { passive: true });
  document.documentElement.addEventListener('pointerleave', hide);
  window.addEventListener('blur', hide);
  document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
  document.addEventListener('keydown', hide);
  document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('close', hide));
  desktop.addEventListener('change', hide);
  reducedMotion.addEventListener('change', () => { angle = targetAngle = 0; if (visible) schedule(); });
})();

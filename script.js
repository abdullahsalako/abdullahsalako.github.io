// ─── DOM refs ────────────────────────────────────────────────────────────────
const menuButton = document.querySelector(".menu-button");
const mobileNav  = document.querySelector(".mobile-nav");
const header     = document.querySelector(".site-header");
const modal      = document.querySelector(".project-modal");
const modalTitle = modal ? modal.querySelector("#modalTitle") : null;

// ─── Scroll-driven header shrink (CSS fallback for Firefox / old Safari) ──────
if (!CSS.supports("(animation-timeline: scroll()) and (animation-range: 0% 100%)")) {
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 30);
  }, { passive: true });
}

// ─── Mobile menu ──────────────────────────────────────────────────────────────
menuButton.addEventListener("click", () => {
  const isOpen = mobileNav.classList.toggle("open");
  document.body.classList.toggle("menu-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

mobileNav.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    mobileNav.classList.remove("open");
    document.body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
  })
);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && mobileNav.classList.contains("open")) {
    mobileNav.classList.remove("open");
    document.body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
    menuButton.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 900 && mobileNav.classList.contains("open")) {
    mobileNav.classList.remove("open");
    document.body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
  }
});

// ─── Project filter buttons ───────────────────────────────────────────────────
document.querySelectorAll(".filter").forEach((btn) => {
  btn.addEventListener("click", () => {
    const filter = btn.dataset.filter;

    document.querySelectorAll(".filter").forEach((item) => {
      const active = item === btn;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });

    document.querySelectorAll(".project").forEach((project) => {
      const match = filter === "all" || project.dataset.category === filter;
      if (match) {
        if (project.classList.contains("filtered-out")) {
          project.style.display = "";
          requestAnimationFrame(() => project.classList.remove("filtered-out"));
        }
      } else {
        project.classList.add("filtered-out");
        setTimeout(() => {
          if (project.classList.contains("filtered-out")) project.style.display = "none";
        }, 400);
      }
    });
  });
});

// ─── Native dialog modal ──────────────────────────────────────────────────────
if (modal) {
  document.querySelectorAll("[data-project]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      if (modalTitle) modalTitle.textContent = trigger.dataset.project;
      modal.showModal();
    });
  });

  const closeBtn = modal.querySelector(".modal-close");
  if (closeBtn) closeBtn.addEventListener("click", () => modal.close());

  // Light-dismiss fallback (browsers without closedby attribute support)
  if (!("closedBy" in HTMLDialogElement.prototype)) {
    modal.addEventListener("click", (e) => {
      if (e.target !== modal) return;
      const rect = modal.getBoundingClientRect();
      const inside =
        rect.top    <= e.clientY && e.clientY <= rect.top  + rect.height &&
        rect.left   <= e.clientX && e.clientX <= rect.left + rect.width;
      if (!inside) modal.close();
    });
  }
}

// ─── Intersection Observer (reveal animations) ───────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal, .reveal-l, .reveal-r, .reveal-s").forEach((el) =>
  revealObserver.observe(el)
);

// ─── Footer year ──────────────────────────────────────────────────────────────
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ─── Lucide icons ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons();
});

// ─── GPU Film Grain Overlay (static noise, CSS-animated offset) ──────────────
(function initGrain() {
  const SIZE = 128;
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(SIZE, SIZE);
  const d = img.data;

  for (let i = 0; i < d.length; i += 4) {
    const v = Math.random() * 255;
    d[i] = d[i + 1] = d[i + 2] = v;
    d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);

  const overlay = document.createElement("div");
  overlay.className = "grain-overlay";
  overlay.style.backgroundImage = `url(${canvas.toDataURL()})`;
  document.body.appendChild(overlay);
})();

// ─── Reading progress bar ─────────────────────────────────────────────────────
(function initProgressBar() {
  const bar = document.createElement("div");
  bar.className = "progress-bar";
  document.body.appendChild(bar);

  window.addEventListener("scroll", () => {
    const dh = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (dh > 0 ? (window.scrollY / dh) * 100 : 0) + "%";
  }, { passive: true });
})();

const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

// ─── Hero parallax ───────────────────────────────────────────────────────────
(function initParallax() {
  const heroMedia = document.querySelector(".hero-media");
  const heroImg   = heroMedia && heroMedia.querySelector("img");
  if (!heroImg) return;

  heroImg.classList.add("parallax-img");

  window.addEventListener("scroll", () => {
    const rect    = heroMedia.getBoundingClientRect();
    const viewH   = window.innerHeight;
    const progress = (viewH - rect.top) / (viewH + rect.height);
    const y = (Math.max(0, Math.min(1, progress)) - 0.5) * 36;
    heroImg.style.transform = `translate3d(0, ${y}px, 0)`;
  }, { passive: true });
})();

// ─── 3-D tilt on project cards ────────────────────────────────────────────────
document.querySelectorAll(".project > button").forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    if (isTouch) return;
    const r = btn.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top)  / r.height;
    btn.style.transform =
      `perspective(800px) rotateX(${(y - 0.5) * -8}deg) rotateY(${(x - 0.5) * 8}deg)`;
  });
  btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
});

// ─── Before / After Color Grading Slider ─────────────────────────────────────
(function initColorSlider() {
  const slider     = document.querySelector(".color-slider");
  const rangeInput = slider && slider.querySelector(".slider-range");
  const beforePane = slider && slider.querySelector(".color-slider-before");
  const handle     = slider && slider.querySelector(".slider-handle");

  if (!slider || !rangeInput || !beforePane || !handle) return;

  /**
   * Move the "before" clip mask and the drag handle to the current
   * slider percentage position.
   */
  function applyPosition(pct) {
    // Clip the "before" (raw LOG) pane so only the left portion is visible
    beforePane.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    // Shift the divider handle to match
    handle.style.left = pct + "%";
  }

  // Initialise to 50 %
  applyPosition(50);

  // React to native range input (keyboard + mouse + touch)
  rangeInput.addEventListener("input", () => {
    applyPosition(Number(rangeInput.value));
  });

  // ── Optional: direct pointer drag on the handle (feels more tactile) ──────
  let dragging = false;

  function pointerPct(e) {
    const rect = slider.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
  }

  handle.addEventListener("pointerdown", (e) => {
    dragging = true;
    handle.setPointerCapture(e.pointerId);
  });

  handle.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const pct = pointerPct(e);
    rangeInput.value = pct;
    applyPosition(pct);
  });

  handle.addEventListener("pointerup",    () => { dragging = false; });
  handle.addEventListener("pointercancel",() => { dragging = false; });

  // Also let clicking anywhere on the slider body snap to that position
  slider.addEventListener("click", (e) => {
    if (e.target === rangeInput || e.target === handle ||
        handle.contains(e.target)) return;
    const pct = pointerPct(e);
    rangeInput.value = pct;
    applyPosition(pct);
  });
})();

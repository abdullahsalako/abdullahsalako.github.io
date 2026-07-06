const menuButton = document.querySelector(".menu-button");
const mobileNav = document.querySelector(".mobile-nav");
const header = document.querySelector(".site-header");
const modal = document.querySelector(".project-modal");
const modalTitle = modal.querySelector("h2");

window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 20), { passive: true });

menuButton.addEventListener("click", () => {
  const isOpen = mobileNav.classList.toggle("open");
  document.body.classList.toggle("menu-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
  mobileNav.classList.remove("open");
  document.body.classList.remove("menu-open");
  menuButton.setAttribute("aria-expanded", "false");
}));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mobileNav.classList.contains("open")) {
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

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    document.querySelectorAll(".filter").forEach((item) => {
      const active = item === button;
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

document.querySelectorAll("[data-project]").forEach((button) => {
  button.addEventListener("click", () => {
    modalTitle.textContent = button.dataset.project;
    modal.showModal();
  });
});

modal.querySelector(".modal-close").addEventListener("click", () => modal.close());
modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.close();
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
document.querySelectorAll(".reveal-l, .reveal-r, .reveal-s").forEach((element) => observer.observe(element));
document.getElementById("year").textContent = new Date().getFullYear();

window.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons();
});

// --- Film grain overlay ---
const grainCanvas = document.createElement("canvas");
grainCanvas.className = "grain-overlay";
const grainCtx = grainCanvas.getContext("2d");
document.body.appendChild(grainCanvas);

function sizeGrain() {
  grainCanvas.width = window.innerWidth * 0.35;
  grainCanvas.height = window.innerHeight * 0.35;
}
sizeGrain();
window.addEventListener("resize", sizeGrain);

(function loopGrain() {
  const w = grainCanvas.width, h = grainCanvas.height;
  const imageData = grainCtx.createImageData(w, h);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = Math.random() * 255;
    d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255;
  }
  grainCtx.putImageData(imageData, 0, 0);
  requestAnimationFrame(loopGrain);
})();

// --- Custom cursor (desktop only) ---
const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

if (!isTouch) {
  const ring = document.createElement("div");
  ring.className = "cursor-ring";
  document.body.appendChild(ring);
  document.body.classList.add("custom-cursor");

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });

  (function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + "px";
    ring.style.top = ry + "px";
    requestAnimationFrame(animRing);
  })();

  document.querySelectorAll("a, button, .project, .service-row, .filter, .tilt").forEach((el) => {
    el.addEventListener("mouseenter", () => ring.classList.add("hovering"));
    el.addEventListener("mouseleave", () => ring.classList.remove("hovering"));
  });
}

// --- Reading progress bar ---
const progressBar = document.createElement("div");
progressBar.className = "progress-bar";
document.body.appendChild(progressBar);

window.addEventListener("scroll", () => {
  const st = window.scrollY;
  const dh = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (st / dh * 100) + "%";
}, { passive: true });

// --- Parallax hero image ---
const heroMedia = document.querySelector(".hero-media");
const heroImg = heroMedia && heroMedia.querySelector("img");
if (heroImg) {
  heroImg.classList.add("parallax-img");
  window.addEventListener("scroll", () => {
    const rect = heroMedia.getBoundingClientRect();
    const viewH = window.innerHeight;
    const progress = (viewH - rect.top) / (viewH + rect.height);
    const clamped = Math.max(0, Math.min(1, progress));
    const y = (clamped - 0.5) * 36;
    heroImg.style.transform = `translate3d(0, ${y}px, 0)`;
  }, { passive: true });
}

// --- 3D tilt on project cards ---
document.querySelectorAll(".project > button").forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    if (isTouch) return;
    const r = btn.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    btn.style.transform = `perspective(800px) rotateX(${(y - 0.5) * -8}deg) rotateY(${(x - 0.5) * 8}deg)`;
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "";
  });
});

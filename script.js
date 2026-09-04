const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const modal = document.querySelector(".project-modal");
const modalTitle = modal ? modal.querySelector("#modalTitle") : null;

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("remi-theme", theme);

  if (!themeToggle) return;
  const isDark = theme === "dark";
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  themeToggle.innerHTML = `<i data-lucide="${isDark ? "sun" : "moon"}"></i><span>${isDark ? "Light" : "Dark"}</span>`;
  if (window.lucide) window.lucide.createIcons();
}

const savedTheme = localStorage.getItem("remi-theme");
const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
setTheme(savedTheme || preferredTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark");
  });
}

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    document.querySelectorAll(".filter").forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });

    document.querySelectorAll(".project-card").forEach((project) => {
      const categories = (project.dataset.category || "").split(/\s+/);
      const match = filter === "all" || categories.includes(filter);
      project.classList.toggle("filtered-out", !match);
      window.setTimeout(() => {
        project.hidden = !match;
      }, match ? 0 : 180);
    });
  });
});

if (modal) {
  document.querySelectorAll("[data-project]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      if (modalTitle) modalTitle.textContent = trigger.dataset.project;
      modal.showModal();
    });
  });

  const closeButton = modal.querySelector(".modal-close");
  if (closeButton) closeButton.addEventListener("click", () => modal.close());

  modal.addEventListener("click", (event) => {
    if (event.target !== modal) return;
    const rect = modal.getBoundingClientRect();
    const inside =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;
    if (!inside) modal.close();
  });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const currentPage = window.location.pathname.split("/").pop() || "index.html";
const navLinks = Array.from(document.querySelectorAll(".primary-nav a"));

navLinks.forEach((link) => {
  const href = link.getAttribute("href");
  if (href === currentPage || (currentPage === "" && href === "index.html")) {
    link.classList.add("active");
  }
});

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const progressBar = document.createElement("div");
progressBar.className = "progress-bar";
document.body.appendChild(progressBar);

window.addEventListener("scroll", () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = `${maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0}%`;
}, { passive: true });

document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons();
});

// --- Custom Editorial Feather Pointer Track ---
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.body.classList.add("custom-cursor-enabled");

  const cursorWrapper = document.createElement("div");
  cursorWrapper.className = "cursor-wrapper";
  cursorWrapper.setAttribute("aria-hidden", "true");
  cursorWrapper.innerHTML = `
    <div class="cursor-feather">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L3 13v5h5l9.74-9.76z"></path>
        <line x1="16" y1="8" x2="19" y2="11"></line>
        <line x1="4.5" y1="18.5" x2="9" y2="14"></line>
      </svg>
    </div>
    <div class="cursor-dot"></div>
  `;
  document.body.appendChild(cursorWrapper);

  let mouseX = -100;
  let mouseY = -100;
  let featherX = -100;
  let featherY = -100;
  let dotX = -100;
  let dotY = -100;
  let isVisible = false;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isVisible) {
      isVisible = true;
      featherX = mouseX;
      featherY = mouseY;
      dotX = mouseX;
      dotY = mouseY;
      cursorWrapper.style.opacity = "1";
    }
  });

  document.addEventListener("mouseleave", () => {
    cursorWrapper.style.opacity = "0";
    isVisible = false;
  });

  function animateCursor() {
    if (isVisible) {
      featherX += (mouseX - featherX) * 0.35;
      featherY += (mouseY - featherY) * 0.35;
      dotX += (mouseX - dotX) * 0.16;
      dotY += (mouseY - dotY) * 0.16;

      const featherEl = cursorWrapper.querySelector(".cursor-feather");
      const dotEl = cursorWrapper.querySelector(".cursor-dot");

      if (featherEl) featherEl.style.transform = `translate3d(${featherX}px, ${featherY}px, 0)`;
      if (dotEl) dotEl.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
    }
    requestAnimationFrame(animateCursor);
  }
  requestAnimationFrame(animateCursor);

  const interactiveSelector = "a, button, input, textarea, select, .filter, .project-card, [role='button']";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(interactiveSelector)) {
      cursorWrapper.classList.add("hovering");
    }
  });

  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(interactiveSelector)) {
      cursorWrapper.classList.remove("hovering");
    }
  });
}

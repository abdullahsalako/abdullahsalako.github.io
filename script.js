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

const sections = Array.from(document.querySelectorAll("main section[id], main[id]"));
const navLinks = Array.from(document.querySelectorAll(".primary-nav a"));

const sectionObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

  if (!visible) return;
  const id = visible.target.id || "top";
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
  });
}, { rootMargin: "-35% 0px -55% 0px", threshold: [0.08, 0.2, 0.45] });

sections.forEach((section) => sectionObserver.observe(section));

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

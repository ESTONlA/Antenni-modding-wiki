const nav = document.querySelector("#nav");
const navToggle = document.querySelector("#navToggle");
const progress = document.querySelector("#progress");
const navLinks = Array.from(document.querySelectorAll(".nav a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

navToggle?.addEventListener("click", () => {
  nav?.classList.toggle("open");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => nav?.classList.remove("open"));
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

const updateProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const amount = scrollable <= 0 ? 0 : (window.scrollY / scrollable) * 100;
  progress.style.width = `${amount}%`;

  let active = "";
  sections.forEach((section) => {
    const box = section.getBoundingClientRect();
    if (box.top <= 140 && box.bottom > 140) {
      active = `#${section.id}`;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === active);
  });
};

document.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();

document.querySelectorAll(".accordion article").forEach((item, index) => {
  const button = item.querySelector("button");
  if (index === 0) {
    item.classList.add("open");
  }

  button?.addEventListener("click", () => {
    item.classList.toggle("open");
  });
});

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const text = button.getAttribute("data-copy") ?? "";
    try {
      await navigator.clipboard.writeText(text);
      const original = button.querySelector("span")?.textContent ?? "";
      button.querySelector("span").textContent = "Copied path";
      window.setTimeout(() => {
        button.querySelector("span").textContent = original;
      }, 1200);
    } catch {
      button.classList.add("copy-failed");
    }
  });
});

const search = document.querySelector("#docSearch");
const docLinks = Array.from(document.querySelectorAll("#docGrid a"));

search?.addEventListener("input", () => {
  const query = search.value.trim().toLowerCase();
  docLinks.forEach((link) => {
    const haystack = `${link.textContent} ${link.dataset.keywords ?? ""}`.toLowerCase();
    link.classList.toggle("hidden", query.length > 0 && !haystack.includes(query));
  });
});

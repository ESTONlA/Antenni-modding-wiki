const nav = document.querySelector("#nav");
const menuButton = document.querySelector("#menuButton");
const currentPage = document.body.dataset.page ?? "";

menuButton?.addEventListener("click", () => {
  nav?.classList.toggle("open");
});

document.querySelectorAll("[data-page-link]").forEach((link) => {
  link.classList.toggle("active", link.dataset.pageLink === currentPage);
  link.addEventListener("click", () => nav?.classList.remove("open"));
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

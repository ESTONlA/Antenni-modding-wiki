const sidebar = document.querySelector(".topbar");
const nav = document.querySelector("#nav");
const menuButton = document.querySelector("#menuButton");
const currentPage = document.body.dataset.page ?? "";

const docsNavigation = [
  {
    title: "Getting Started",
    links: [
      ["home", "Overview", "index.html"],
      ["template", "Template setup", "template.html"],
      ["workflow", "First mod workflow", "workflow.html"],
      ["load-method", "Load method", "load-method.html"],
    ],
  },
  {
    title: "Mod Basics",
    links: [
      ["modinfo", "modinfo.json", "modinfo.html"],
      ["config", "Config files", "config.html"],
      ["folder-layout", "Folder layout", "folder-layout.html"],
    ],
  },
  {
    title: "Patching",
    links: [
      ["patching", "Patching GML", "patching.html"],
      ["menu-tabs", "Menu tabs", "menu-tabs.html"],
      ["strings", "Strings & text", "strings.html"],
      ["conflicts", "Conflict safety", "conflicts.html"],
    ],
  },
  {
    title: "Assets",
    links: [
      ["assets", "Asset pipeline", "assets.html"],
      ["sprites-sounds", "Sprites & sounds", "sprites-sounds.html"],
      ["included-files", "Included files", "included-files.html"],
    ],
  },
  {
    title: "API",
    links: [["modcontext", "ModContext API", "modcontext.html"]],
  },
  {
    title: "Building & Release",
    links: [["release", "Release checklist", "release.html"]],
  },
  {
    title: "Debugging",
    links: [
      ["debugging", "Debugging mods", "debugging.html"],
      ["security", "Security scan", "security.html"],
    ],
  },
];

if (nav) {
  nav.innerHTML = docsNavigation
    .map((group) => {
      const links = group.links
        .map(([page, label, href]) => `<a href="${href}" data-page-link="${page}">${label}</a>`)
        .join("");
      return `<div class="nav-group"><p class="nav-title">${group.title}</p>${links}</div>`;
    })
    .join("");
}

menuButton?.addEventListener("click", () => {
  sidebar?.classList.toggle("open");
});

document.querySelectorAll("[data-page-link]").forEach((link) => {
  link.classList.toggle("active", link.dataset.pageLink === currentPage);
  link.addEventListener("click", () => sidebar?.classList.remove("open"));
});

const searchInput = document.querySelector("#sidebarSearch");
searchInput?.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  document.querySelectorAll(".nav-group").forEach((group) => {
    let anyVisible = false;
    group.querySelectorAll("a").forEach((link) => {
      const text = link.textContent.trim().toLowerCase();
      const visible = query.length === 0 || text.includes(query);
      link.classList.toggle("hidden", !visible);
      anyVisible = anyVisible || visible;
    });
    group.classList.toggle("hidden", !anyVisible);
  });
});

const slugCounts = new Map();
const slugify = (value) => {
  const base = value
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";
  const count = slugCounts.get(base) ?? 0;
  slugCounts.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
};

const headings = Array.from(document.querySelectorAll(".doc-content h2, .doc-content h3"));
headings.forEach((heading) => {
  if (!heading.id) {
    heading.id = slugify(heading.textContent ?? "");
  }
  const anchor = document.createElement("a");
  anchor.className = "heading-anchor";
  anchor.href = `#${heading.id}`;
  anchor.setAttribute("aria-label", `Link to ${heading.textContent}`);
  anchor.textContent = "#";
  heading.appendChild(anchor);
});

const toc = document.querySelector("#pageToc");
if (toc && headings.length > 0) {
  const title = document.createElement("p");
  title.className = "toc-title";
  title.textContent = "On this page";
  toc.appendChild(title);

  headings.forEach((heading) => {
    const link = document.createElement("a");
    link.href = `#${heading.id}`;
    link.className = heading.tagName === "H3" ? "level-3" : "level-2";
    link.textContent = heading.textContent?.replace("#", "").trim() ?? "";
    toc.appendChild(link);
  });

  const tocLinks = Array.from(toc.querySelectorAll("a"));
  const headingObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;
      tocLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
      });
    },
    { rootMargin: "-15% 0px -70% 0px", threshold: 0.01 }
  );
  headings.forEach((heading) => headingObserver.observe(heading));
}

document.querySelectorAll("pre").forEach((pre) => {
  if (pre.closest(".no-copy")) return;
  const wrapper = pre.parentElement;
  if (!wrapper || wrapper.querySelector(".copy-code")) return;

  const button = document.createElement("button");
  button.className = "copy-code";
  button.type = "button";
  button.textContent = "Copy";
  button.addEventListener("click", async () => {
    const text = pre.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "Copied";
      window.setTimeout(() => (button.textContent = "Copy"), 1100);
    } catch {
      button.textContent = "Failed";
      window.setTimeout(() => (button.textContent = "Copy"), 1100);
    }
  });

  if (!["code-block", "command-block", "file-tree", "terminal"].some((className) => wrapper.classList.contains(className))) {
    pre.classList.add("standalone-code");
  } else {
    wrapper.appendChild(button);
  }
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
  { threshold: 0.08 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

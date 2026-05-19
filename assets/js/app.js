const sidebar = document.querySelector(".topbar");
const nav = document.querySelector("#nav");
const menuButton = document.querySelector("#menuButton");
const currentPage = document.body.dataset.page ?? "";
const siteRoot = document.body.dataset.root ?? "";
const siteHref = (path) => `${siteRoot}${path}`;

const docsNavigation = [
  {
    title: "For Players",
    links: [
      ["player-installation", "Installation", "docs/players/installation.html"],
      ["installing-mods", "Installing mods", "docs/players/installing-mods.html"],
      ["player-troubleshooting", "Troubleshooting", "docs/players/troubleshooting.html"],
      ["logs-diagnostics", "Logs & diagnostics", "docs/players/logs-diagnostics.html"],
      ["player-security", "Security scan", "docs/players/security-scan.html"],
      ["faq", "FAQ", "docs/players/faq.html"],
    ],
  },
  {
    title: "Modders: Start",
    links: [
      ["home", "Overview", "index.html"],
      ["template", "Template setup", "docs/getting-started/template.html"],
      ["workflow", "First mod workflow", "docs/getting-started/workflow.html"],
      ["how-loader-works", "How loading works", "docs/getting-started/how-loader-works.html"],
      ["rename-template", "Rename CreatureProbe", "docs/getting-started/rename-template.html"],
      ["load-method", "Load method", "docs/getting-started/load-method.html"],
    ],
  },
  {
    title: "Modders: Basics",
    links: [
      ["modinfo", "modinfo.json", "docs/basics/modinfo.html"],
      ["config", "Config files", "docs/basics/config.html"],
      ["folder-layout", "Folder layout", "docs/basics/folder-layout.html"],
    ],
  },
  {
    title: "Patching",
    links: [
      ["patching", "Patching GML", "docs/patching/patching.html"],
      ["code-assets", "Code assets & hooks", "docs/patching/code-assets.html"],
      ["menu-tabs", "Menu tabs", "docs/patching/menu-tabs.html"],
      ["strings", "Strings & text", "docs/patching/strings.html"],
      ["conflicts", "Conflict safety", "docs/patching/conflicts.html"],
    ],
  },
  {
    title: "Assets",
    links: [
      ["assets", "Asset pipeline", "docs/assets/assets.html"],
      ["sprites-sounds", "Sprites & sounds", "docs/assets/sprites-sounds.html"],
      ["included-files", "Included files", "docs/assets/included-files.html"],
    ],
  },
  {
    title: "Modders: API",
    links: [["modcontext", "ModContext API", "docs/api/modcontext.html"]],
  },
  {
    title: "Recipes",
    links: [
      ["recipe-menu-button", "Add a menu button", "docs/recipes/recipe-menu-button.html"],
      ["recipe-text", "Replace text safely", "docs/recipes/recipe-text.html"],
      ["recipe-sprite", "Add or replace sprite", "docs/recipes/recipe-sprite.html"],
      ["recipe-sound", "Add or replace sound", "docs/recipes/recipe-sound.html"],
      ["recipe-included-file", "Use included data", "docs/recipes/recipe-included-file.html"],
      ["recipe-object", "Create an object", "docs/recipes/recipe-object.html"],
    ],
  },
  {
    title: "Building & Release",
    links: [["release", "Release checklist", "docs/release/release.html"]],
  },
  {
    title: "Debugging",
    links: [
      ["debugging", "Debugging mods", "docs/debugging/debugging.html"],
      ["security", "Security scan", "docs/debugging/security.html"],
      ["release-notes", "Release notes", "docs/reference/release-notes.html"],
    ],
  },
];

if (nav) {
  nav.innerHTML = docsNavigation
    .map((group) => {
      const links = group.links
        .map(([page, label, href]) => `<a href="${siteHref(href)}" data-page-link="${page}">${label}</a>`)
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

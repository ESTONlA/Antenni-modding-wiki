const body = document.body;
const root = body.dataset.root ?? "";
const page = body.dataset.page ?? "";
const requestedGame = body.dataset.game ?? "";
const storedGame = window.localStorage.getItem("antenni-wiki-game");
const game = requestedGame === "shared"
  ? (storedGame === "ogre" ? "ogre" : "lake")
  : requestedGame;
const href = (path) => `${root}${path}`;

if (requestedGame === "lake" || requestedGame === "ogre") {
  window.localStorage.setItem("antenni-wiki-game", requestedGame);
}

const sharedLinks = [
  ["loader", "How Antenni works", "docs/shared/how-loader-works.html"],
  ["security", "Security scanning", "docs/shared/security.html"],
  ["release-notes", "Release notes", "docs/shared/release-notes.html"],
];

const navigation = {
  lake: {
    label: "Lake of Creatures",
    short: "LOC",
    home: "docs/lake/index.html",
    groups: [
      {
        title: "Getting Started",
        links: [
          ["lake-home", "Lake overview", "docs/lake/index.html"],
          ["lake-install", "Install and first run", "docs/lake/installation.html"],
          ["lake-template", "CreatureProbe template", "docs/lake/template.html"],
          ["lake-first-mod", "Build your first mod", "docs/lake/first-mod.html"],
        ],
      },
      {
        title: "Mod Basics",
        links: [
          ["lake-manifest", "modinfo.json", "docs/lake/manifest.html"],
          ["lake-assets", "Assets and config", "docs/lake/assets.html"],
        ],
      },
      {
        title: "Patching And API",
        links: [
          ["lake-patching", "Patching Lake", "docs/lake/patching.html"],
          ["lake-api", "ModContext API", "docs/lake/api.html"],
          ["lake-menu", "Main-menu mods", "docs/lake/menu-modding.html"],
        ],
      },
      {
        title: "Ship And Fix",
        links: [
          ["lake-release", "Build and release", "docs/lake/release.html"],
          ["lake-debug", "Troubleshooting", "docs/lake/troubleshooting.html"],
        ],
      },
    ],
  },
  ogre: {
    label: "Ogre Chambers 2222",
    short: "OC",
    home: "docs/ogre/index.html",
    groups: [
      {
        title: "Getting Started",
        links: [
          ["ogre-home", "Ogre overview", "docs/ogre/index.html"],
          ["ogre-install", "Install and first run", "docs/ogre/installation.html"],
          ["ogre-first-mod", "Build your first mod", "docs/ogre/first-mod.html"],
        ],
      },
      {
        title: "Mod Basics",
        links: [
          ["ogre-manifest", "modinfo.json", "docs/ogre/manifest.html"],
          ["ogre-resources", "Discover resources", "docs/ogre/resources.html"],
        ],
      },
      {
        title: "Patching And API",
        links: [
          ["ogre-patching", "Patching Ogre", "docs/ogre/patching.html"],
          ["ogre-api", "ModContext API", "docs/ogre/api.html"],
        ],
      },
      {
        title: "Ship And Fix",
        links: [
          ["ogre-release", "Build and release", "docs/ogre/release.html"],
          ["ogre-debug", "Troubleshooting", "docs/ogre/troubleshooting.html"],
        ],
      },
    ],
  },
};

const header = document.querySelector("#siteHeader");
if (header && navigation[game]) {
  const current = navigation[game];
  const other = game === "lake" ? navigation.ogre : navigation.lake;
  const navGroups = [
    ...current.groups,
    { title: "Shared Reference", links: sharedLinks },
  ];

  header.className = "sidebar";
  header.innerHTML = `
    <div class="sidebar-head">
      <a class="brand" href="${href("index.html")}"><span>A</span><strong>Antenni Wiki</strong></a>
      <button class="menu-button" id="menuButton" type="button" aria-label="Toggle documentation navigation">
        <span></span><span></span>
      </button>
    </div>
    <a class="game-switch" href="${href(other.home)}">
      <span>Current manual</span>
      <strong>${current.label}</strong>
      <small>Switch to ${other.label}</small>
    </a>
    <label class="sidebar-search">
      <span>Search this manual</span>
      <input id="sidebarSearch" type="search" placeholder="Filter pages">
    </label>
    <nav class="nav" id="nav">
      ${navGroups.map((group) => `
        <div class="nav-group">
          <p class="nav-title">${group.title}</p>
          ${group.links.map(([id, label, path]) => `
            <a href="${href(path)}" data-page-link="${id}">${label}</a>
          `).join("")}
        </div>
      `).join("")}
    </nav>
    <div class="sidebar-version">Antenni Loader <strong>1.0.0</strong></div>
  `;

  const menuButton = document.querySelector("#menuButton");
  menuButton?.addEventListener("click", () => header.classList.toggle("open"));

  document.querySelectorAll("[data-page-link]").forEach((link) => {
    link.classList.toggle("active", link.dataset.pageLink === page);
    link.addEventListener("click", () => header.classList.remove("open"));
  });

  const search = document.querySelector("#sidebarSearch");
  search?.addEventListener("input", () => {
    const query = search.value.trim().toLowerCase();
    document.querySelectorAll(".nav-group").forEach((group) => {
      let visible = false;
      group.querySelectorAll("a").forEach((link) => {
        const matches = !query || link.textContent.toLowerCase().includes(query);
        link.hidden = !matches;
        visible ||= matches;
      });
      group.hidden = !visible;
    });
  });
}

const slugCounts = new Map();
const slugify = (value) => {
  const base = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "section";
  const count = slugCounts.get(base) ?? 0;
  slugCounts.set(base, count + 1);
  return count ? `${base}-${count + 1}` : base;
};

const headings = Array.from(document.querySelectorAll(".doc-content h2, .doc-content h3"));
headings.forEach((heading) => {
  if (!heading.id) heading.id = slugify(heading.textContent ?? "");
  const anchor = document.createElement("a");
  anchor.className = "heading-anchor";
  anchor.href = `#${heading.id}`;
  anchor.textContent = "#";
  anchor.setAttribute("aria-label", `Link to ${heading.textContent}`);
  heading.appendChild(anchor);
});

const toc = document.querySelector("#pageToc");
if (toc && headings.length) {
  toc.innerHTML = `<p class="toc-title">On this page</p>`;
  headings.forEach((heading) => {
    const link = document.createElement("a");
    link.href = `#${heading.id}`;
    link.className = heading.tagName === "H3" ? "level-3" : "level-2";
    link.textContent = heading.childNodes[0]?.textContent?.trim() ?? heading.textContent.replace("#", "").trim();
    toc.appendChild(link);
  });

  const tocLinks = Array.from(toc.querySelectorAll("a"));
  const observer = new IntersectionObserver((entries) => {
    const current = entries.filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!current) return;
    tocLinks.forEach((link) => link.classList.toggle("active", link.hash === `#${current.target.id}`));
  }, { rootMargin: "-12% 0px -76% 0px", threshold: 0.01 });
  headings.forEach((heading) => observer.observe(heading));
}

document.querySelectorAll("pre").forEach((pre) => {
  const parent = pre.parentElement;
  if (!parent) return;

  const wrapper = document.createElement("div");
  wrapper.className = "code-shell";
  const title = pre.previousElementSibling?.classList.contains("code-title")
    ? pre.previousElementSibling
    : null;

  if (title) {
    parent.insertBefore(wrapper, title);
    wrapper.append(title, pre);
  } else {
    parent.insertBefore(wrapper, pre);
    wrapper.append(pre);
  }

  const button = document.createElement("button");
  button.className = "copy-code";
  button.type = "button";
  button.textContent = "Copy";
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(pre.textContent ?? "");
      button.textContent = "Copied";
    } catch {
      button.textContent = "Failed";
    }
    window.setTimeout(() => { button.textContent = "Copy"; }, 1200);
  });
  wrapper.appendChild(button);
});

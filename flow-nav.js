<!-- file: flow-nav.js -->
/*! flow-nav.js — Prev/Next + Related Sections (drop-in, no build step)
   How it works:
   - Defines the ordered sitemap for your pages.
   - Detects the current page filename.
   - Renders two big buttons (Prev/Next) and a "Related sections" grid.
   - Inserts the block just *before* the first <footer> tag on the page.
*/
(function () {
  // 1) Define your site map (order matters)
  const PAGES = [
    { href: "index.html", title: "Home", group: "overview" },
    { href: "executive_summary.html", title: "Executive Summary", group: "overview" },
    { href: "foundational_pillars.html", title: "Foundational Pillars", group: "strategy" },
    { href: "vision_goals.html", title: "Vision & Goals", group: "overview" },
    { href: "implementation_roadmap.html", title: "Implementation Roadmap", group: "strategy" },
    { href: "financial_profile.html", title: "Financial Profile", group: "finance" },
    { href: "technical_architecture.html", title: "Technology Architecture", group: "technology" },
    { href: "integration_with_platforms.html", title: "Integration w/ Platforms", group: "technology" },
    { href: "governance_security_compliance.html", title: "Governance & Security", group: "assurance" },
    { href: "performance_measurement.html", title: "Performance & KPIs", group: "assurance" },
    { href: "change_management.html", title: "Change Management", group: "strategy" },
    { href: "innovation_future_technologies.html", title: "Innovation & Future Tech", group: "technology" },
    { href: "risk_mitigation.html", title: "Risk & Mitigation", group: "strategy" },
    { href: "sustainability_financial_planning.html", title: "Sustainability & Finance", group: "finance" },
  ];

  // Optional short blurbs for the “Related sections” cards
  const BLURB = {
    "executive_summary.html": "Top-line rationale & outcomes",
    "foundational_pillars.html": "The strategic foundation",
    "vision_goals.html": "What success looks like",
    "implementation_roadmap.html": "Phases, milestones, releases",
    "financial_profile.html": "Investment, phasing & ROI",
    "technical_architecture.html": "Core platforms & stack",
    "integration_with_platforms.html": "Ecosystem & interoperability",
    "governance_security_compliance.html": "Controls & compliance",
    "performance_measurement.html": "KPIs & benefits tracking",
    "change_management.html": "People & adoption",
    "innovation_future_technologies.html": "Horizon scanning & pilots",
    "risk_mitigation.html": "Risks, issues & responses",
    "sustainability_financial_planning.html": "Long-term sustainment",
    "index.html": "Start here",
  };

  // 2) Resolve current page filename (basename)
  function currentFile() {
    const path = (location.pathname || "").split("/").pop() || "index.html";
    return path || "index.html";
  }
  const current = currentFile();

  // 3) Find prev/next based on order
  const idx = PAGES.findIndex(p => p.href === current);
  if (idx === -1) return; // page not listed — do nothing
  const prev = idx > 0 ? PAGES[idx - 1] : null;
  const next = idx < PAGES.length - 1 ? PAGES[idx + 1] : null;

  // 4) Related: same group (excl. current), up to 4; pad with neighbors if needed
  const group = PAGES[idx].group;
  let related = PAGES.filter(p => p.group === group && p.href !== current).slice(0, 4);
  if (related.length < 4) {
    const extras = [];
    for (let off = 1; (idx - off >= 0 || idx + off < PAGES.length) && extras.length < 6; off++) {
      if (idx - off >= 0) extras.push(PAGES[idx - off]);
      if (idx + off < PAGES.length) extras.push(PAGES[idx + off]);
    }
    for (const e of extras) {
      if (e.href !== current && !related.some(r => r.href === e.href)) {
        related.push(e);
        if (related.length >= 4) break;
      }
    }
  }
  related = related.slice(0, 4);

  // 5) Build DOM (uses Tailwind CDN already in your pages)
  const el = (t, a = {}, html = "") => {
    const n = document.createElement(t);
    for (const [k, v] of Object.entries(a)) {
      if (k === "class") n.className = v;
      else if (k.startsWith("aria-") || k === "role" || k === "href") n.setAttribute(k, v);
      else n[k] = v;
    }
    if (html) n.innerHTML = html;
    return n;
  };

  const section = el("section", { class: "flow-nav mt-16 mb-6" });
  const wrap = el("div", { class: "max-w-5xl mx-auto px-4" });

  // Prev/Next row
  const pnGrid = el("div", { class: "grid sm:grid-cols-2 gap-3" });
  const buildBtn = (item, dir) => {
    if (!item) return el("div");
    const arrow = dir === "prev" ? "&larr;" : "&rarr;";
    const label = dir === "prev" ? "Previous" : "Next";
    const align = dir === "prev" ? "justify-start text-left" : "justify-end text-right";
    const inner = `
      <span class="block text-xs font-semibold tracking-wide uppercase text-gray-500">${label}</span>
      <span class="block text-lg sm:text-xl font-bold text-om-navy">${item.title}</span>
    `;
    const a = el("a", {
      href: item.href,
      class: `group inline-flex items-center ${align} gap-2 rounded-full border border-gray-200 hover:border-om-navy/40 px-4 py-3 bg-white shadow-sm hover:shadow-md transition`
    }, dir === "prev" ? `${arrow} ${inner}` : `${inner} ${arrow}`);
    a.setAttribute("aria-label", `${label}: ${item.title}`);
    return a;
  };
  pnGrid.appendChild(buildBtn(prev, "prev"));
  pnGrid.appendChild(buildBtn(next, "next"));

  // Related grid
  const relWrap = el("div", { class: "mt-10" });
  const relTitle = el("h3", { class: "text-lg font-bold text-om-navy mb-3" }, "Related sections");
  const relGrid = el("div", { class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" });
  for (const r of related) {
    const card = el("a", {
      href: r.href,
      class: "block rounded-xl border border-gray-200 hover:border-om-navy/40 bg-white p-4 shadow-sm hover:shadow-md transition"
    });
    card.appendChild(el("div", { class: "font-semibold text-om-navy" }, r.title));
    card.appendChild(el("div", { class: "text-sm text-gray-600 mt-0.5" }, BLURB[r.href] || ""));
    relGrid.appendChild(card);
  }
  relWrap.appendChild(relTitle);
  relWrap.appendChild(relGrid);

  wrap.appendChild(pnGrid);
  wrap.appendChild(relWrap);
  section.appendChild(wrap);

  // 6) Insert before footer (fallback: append to body)
  const footer = document.querySelector("footer");
  const parent = footer && footer.parentNode ? footer.parentNode : document.body;
  if (footer) parent.insertBefore(section, footer);
  else document.body.appendChild(section);
})();

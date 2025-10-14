<!-- file: flow-nav.js -->
/*! flow-nav.js — Prev/Next + Related Sections (drop-in, no build step)
   How it works:
   - Defines the ordered sitemap for your pages.
   - Detects the current page filename.
   - Renders two big buttons (Prev/Next) and a "Related sections" grid.
   - Inserts the block just *before* the first <footer> tag on the page.
*/
/*! flow-nav.js — Prev/Next + Related Sections styled like your “card-hover” grid */
(function () {
  // Ordered site map (controls Prev → Next sequence)
  const PAGES = [
    { href: "index.html",                       title: "Home",                    group: "overview" },
    { href: "executive_summary.html",           title: "Executive Summary",       group: "overview" },
    { href: "foundational_pillars.html",        title: "Foundational Pillars",    group: "strategy" },
    { href: "vision_goals.html",                title: "Vision & Goals",          group: "overview" },
    { href: "implementation_roadmap.html",      title: "Implementation Roadmap",  group: "strategy" },
    { href: "financial_profile.html",           title: "Financial Profile",       group: "finance" },
    { href: "technical_architecture.html",      title: "Technology Architecture", group: "technology" },
    { href: "integration_with_platforms.html",  title: "Integration w/ Platforms",group: "technology" },
    { href: "governance_security_compliance.html", title: "Governance & Security", group: "assurance" },
    { href: "performance_measurement.html",     title: "Performance & KPIs",      group: "assurance" }
  ];

  // Optional blurbs (used under “Related sections” titles)
  const BLURB = {
    "executive_summary.html": "Ambition & alignment to Vision 2040",
    "foundational_pillars.html": "Governance, Security, UX & Sustainability",
    "vision_goals.html": "2035 vision & measurable targets",
    "implementation_roadmap.html": "Phases, milestones & releases",
    "financial_profile.html": "Costs, funding & ROI",
    "technical_architecture.html": "Core platforms & stack",
    "integration_with_platforms.html": "Ecosystem & interoperability",
    "governance_security_compliance.html": "Controls & compliance",
    "performance_measurement.html": "KPIs & benefits tracking",
    "index.html": "Start here"
  };

  // Helpers
  const el = (t, a = {}, html = "") => { const n = document.createElement(t);
    for (const [k, v] of Object.entries(a)) {
      if (k === "class") n.className = v;
      else if (k.startsWith("aria-") || k === "role" || k === "href") n.setAttribute(k, v);
      else n[k] = v;
    }
    if (html) n.innerHTML = html; return n;
  };
  const current = (() => {
    const p = (location.pathname || "").split("/").pop();
    return p && p.length ? p : "index.html";
  })();

  const idx = PAGES.findIndex(p => p.href === current);
  if (idx === -1) return;
  const prev = idx > 0 ? PAGES[idx - 1] : null;
  const next = idx < PAGES.length - 1 ? PAGES[idx + 1] : null;

  // Related: prefer same group, then nearest neighbors; cap at 4
  const group = PAGES[idx].group;
  let related = PAGES.filter(p => p.group === group && p.href !== current).slice(0, 4);
  if (related.length < 4) {
    const extras = [];
    for (let off = 1; (idx-off>=0 || idx+off<PAGES.length) && extras.length<8; off++) {
      if (idx-off>=0) extras.push(PAGES[idx-off]);
      if (idx+off<PAGES.length) extras.push(PAGES[idx+off]);
    }
    for (const e of extras) {
      if (e.href !== current && !related.some(r => r.href === e.href)) {
        related.push(e); if (related.length >= 4) break;
      }
    }
  }
  related = related.slice(0, 4);

  // Build section with your exact card styling
  const section = el("section", { class: "mt-12" });
  const wrap = el("div", { class: "max-w-5xl mx-auto px-4" });

  // Prev / Next row — same design as your cards
  const pnGrid = el("div", { class: "grid md:grid-cols-2 gap-4" });
  const cardClasses = "block rounded-xl border border-om-navy/10 p-5 text-center bg-white hover:bg-om-navy hover:text-white transition card-hover focus:outline-none focus:ring-2 focus:ring-om-teal/40";
  const makePN = (item, label, arrow) => {
    if (!item) return el("div"); // keeps the grid balanced if only one exists
    const a = el("a", { href: item.href, class: cardClasses });
    a.appendChild(el("p", { class: "text-xs uppercase opacity-70" }, `${label} ${arrow}`));
    a.appendChild(el("p", { class: "font-semibold text-lg" }, item.title));
    return a;
  };
  pnGrid.appendChild(makePN(prev, "Previous", "←"));
  pnGrid.appendChild(makePN(next, "Next", "→"));

  // Related sections — same design and hover
  const relWrap = el("div", { class: "mt-10" });
  relWrap.appendChild(el("h3", { class: "text-2xl font-bold text-om-navy mb-6 text-center" }, "Related Sections"));
  const relGrid = el("div", { class: "grid md:grid-cols-4 gap-4" });
  for (const r of related) {
    const a = el("a", { href: r.href, class: cardClasses });
    a.appendChild(el("p", { class: "font-semibold text-lg" }, r.title));
    const bl = BLURB[r.href] || "";
    if (bl) a.appendChild(el("p", { class: "text-sm opacity-80 mt-1" }, bl));
    relGrid.appendChild(a);
  }
  relWrap.appendChild(relGrid);

  wrap.appendChild(pnGrid);
  wrap.appendChild(relWrap);
  section.appendChild(wrap);

  // Insert the block right before the footer (fallback: append to body)
  const footer = document.querySelector("footer");
  const parent = footer && footer.parentNode ? footer.parentNode : document.body;
  if (footer) parent.insertBefore(section, footer);
  else document.body.appendChild(section);

  // Respect reduced motion
  const m = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  if (m && m.matches) document.querySelectorAll(".card-hover").forEach(a => a.style.transition = "none");
})();

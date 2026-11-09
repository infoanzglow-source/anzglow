/* AnzGlow — Pink Key product page (needs shades.js + common.js first). */
(() => {
  const { $, $$, PK, wa, addToCart, observeReveals } = window.AG;

  const params = new URLSearchParams(location.search);
  let current = PK.find(params.get("shade")) ? params.get("shade") : PK.heroShade;
  let qty = 1, filter = "all", skinPick = null;

  const GALLERY_EXTRA = [
    { src: "assets/pinkkey/pk-open.jpg", alt: "Open with applicator" },
    { src: "assets/pinkkey/pk-red-2.jpg", alt: "Classic Red close-up" },
    { src: "assets/pinkkey/pk-red-3.jpg", alt: "Classic Red on silk" },
    { src: "assets/pinkkey/pk-12-banner.jpg", alt: "All 12 shades" }
  ];

  const setMain = (src, alt) => {
    const img = $("#pdpImg"); const main = $("#pdpMain");
    main.classList.add("swap");
    setTimeout(() => { img.src = src; img.alt = alt; main.classList.remove("swap"); }, 180);
    main.classList.toggle("wide", /banner/.test(src));
  };

  const renderThumbs = () => {
    const s = PK.find(current);
    const items = [{ src: PK.img(s.no), alt: `${s.no} ${s.name}` }, ...GALLERY_EXTRA];
    $("#pdpThumbs").innerHTML = items.map((t, i) => `<button class="${i ? "" : "on"}" data-src="${t.src}" data-alt="${t.alt}"><img src="${t.src}" alt=""></button>`).join("");
    $$("#pdpThumbs button").forEach(b => b.onclick = () => {
      $$("#pdpThumbs button").forEach(x => x.classList.toggle("on", x === b)); setMain(b.dataset.src, b.dataset.alt);
    });
  };

  const renderSwatches = () => {
    $("#pdpSwatches").innerHTML = PK.shades.map(s => {
      const hidden = filter !== "all" && s.family !== filter;
      const rec = skinPick && skinPick.picks.includes(s.no);
      return `<button class="sw ${s.no === current ? "on" : ""} ${hidden ? "hide" : ""} ${rec ? "rec" : ""} ${s.hero ? "star" : ""}" data-shade="${s.no}" title="${s.no} ${s.name}" aria-label="${s.no} ${s.name}">
        <i style="background:${s.hex}"></i><span>${s.no}</span></button>`;
    }).join("");
  };

  const select = (no, { scroll = false } = {}) => {
    current = no; const s = PK.find(no);
    $("#shadeName").textContent = `${s.no} · ${s.name}`;
    $("#shadeFamily").textContent = s.family;
    $("#pdpTag").innerHTML = `<i style="background:${s.hex}"></i>${s.no} ${s.name}`;
    $("#pdpTag").style.setProperty("--c", s.hex);
    document.documentElement.style.setProperty("--shade", s.hex);
    $("#stickyName").textContent = `${s.no} · ${s.name}`;
    $("#stickyDot").style.background = s.hex;
    $("#pdpWa").href = wa(`Hi AnzGlow, I'd like to order Pink Key Liquid Lipstick — shade ${s.no} ${s.name} (AED ${PK.price}).`);
    $("#pdpMail").href = window.AG.mail(`Enquiry: Pink Key ${s.no} ${s.name}`, `Hi AnzGlow,

I would like to know more about Pink Key Liquid Lipstick, shade ${s.no} ${s.name}.

Name:
Phone:
`);
    setMain(PK.img(s.no), `Pink Key ${s.no} ${s.name}`);
    renderThumbs(); renderSwatches();
    $$("#shadeGrid .shade-card").forEach(c => c.classList.toggle("on", c.dataset.shade === no));
    history.replaceState(null, "", `?shade=${no}${location.hash}`);
    if (scroll) $(".pdp-hero").scrollIntoView({ behavior: "smooth", block: "start" });
  };

  document.addEventListener("click", e => {
    const sw = e.target.closest("[data-shade]"); if (!sw) return;
    select(sw.dataset.shade, { scroll: !!sw.closest("#shadeGrid, #guideList") });
  });

  // Filters
  $$("#pdpFilters button").forEach(b => b.onclick = () => {
    filter = b.dataset.f; $$("#pdpFilters button").forEach(x => x.classList.toggle("on", x === b)); renderSwatches();
  });

  // Skin tone helper
  $("#pdpSkin").innerHTML = PK.skin.map((t, i) => `<button data-skin="${i}"><i style="background:${t.dot}"></i>${t.tone}</button>`).join("");
  $$("#pdpSkin button").forEach(b => b.onclick = () => {
    const t = PK.skin[+b.dataset.skin];
    const same = skinPick === t; skinPick = same ? null : t;
    $$("#pdpSkin button").forEach(x => x.classList.toggle("on", !same && x === b));
    $("#pdpSkinNote").innerHTML = skinPick
      ? `${t.tone} skin (${t.hint}): try <b>${t.picks.map(n => `${n} ${PK.find(n).name}`).join("</b> or <b>")}</b> — highlighted below.`
      : "Tap a skin tone to see the shades we'd start with.";
    filter = "all"; $$("#pdpFilters button").forEach(x => x.classList.toggle("on", x.dataset.f === "all"));
    renderSwatches();
    if (skinPick) select(skinPick.picks[0]);
  });

  // Guide list (lower section)
  $("#guideList").innerHTML = PK.skin.map(t => `<div class="guide-row"><span class="g-tone"><i style="background:${t.dot}"></i><b>${t.tone}</b><small>${t.hint}</small></span>
    <span class="g-picks">${t.picks.map(n => { const s = PK.find(n); return `<button data-shade="${n}"><i style="background:${s.hex}"></i>${n} ${s.name}</button>`; }).join("")}</span></div>`).join("");

  // All shades grid
  $("#shadeGrid").innerHTML = PK.shades.map((s, i) => `<button class="shade-card reveal d${i % 4}" data-shade="${s.no}">
      <span class="sc-img"><img src="${PK.img(s.no)}" alt="Pink Key ${s.no} ${s.name}" loading="lazy"></span>
      <span class="sc-meta"><i style="background:${s.hex}"></i><b>${s.no} ${s.name}</b><small>${s.family}</small></span>
    </button>`).join("");

  // Quantity + add
  $("#qMinus").onclick = () => { qty = Math.max(1, qty - 1); $("#qVal").textContent = qty; };
  $("#qPlus").onclick = () => { qty = Math.min(20, qty + 1); $("#qVal").textContent = qty; };
  $("#pdpAdd").onclick = () => { addToCart(`${PK.id}:${current}`, qty); qty = 1; $("#qVal").textContent = 1; };
  $("#stickyAdd").onclick = () => addToCart(`${PK.id}:${current}`, 1);

  // Sticky bar when the main add button is off screen
  new IntersectionObserver(([en]) => document.body.classList.toggle("show-sticky", !en.isIntersecting && en.boundingClientRect.top < 0))
    .observe($("#pdpBuy"));

  // Tabs + FAQ
  $$("#tabs button").forEach(b => b.onclick = () => {
    $$("#tabs button").forEach(x => x.classList.toggle("on", x === b));
    $$(".tab-panel").forEach(p => p.classList.toggle("on", p.dataset.panel === b.dataset.tab));
  });
  $$(".qa button").forEach(b => b.onclick = () => {
    const qa = b.parentElement, open = qa.classList.contains("open");
    $$(".qa").forEach(x => x.classList.remove("open")); if (!open) qa.classList.add("open");
  });

  select(current);
  observeReveals();
})();

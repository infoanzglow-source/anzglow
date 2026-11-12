/* AnzGlow — K-Beauty edit (home page). Prices not set yet: every product is "Ask for price".
   To start selling one: set `price` (and optional `was`) — and add it to invoice.js PRICES — then
   it can move into the main cart. To use real photos: add `img: "assets/kbeauty/<file>.jpg"`. */
(() => {
  const { $, $$, wa, mail, openModal } = window.AG;
  const grid = $("#kbGrid"); if (!grid) return;

  const tube = (x, y, w, band, cap) => `<use href="#ctube" x="${x}" y="${y}" width="${w}" height="${w * 200 / 70}" style="--tube:#fbf6ee;--band:${band};--cap:${cap}"/>`;
  const drop = (x, y, w, glass, liq, bulb) => `<use href="#cdrop-plain" x="${x}" y="${y}" width="${w}" height="${w * 196 / 70}" style="--glass:${glass};--liquid:${liq};--bulb:${bulb}"/>`;
  const jar = (x, y, w, glass) => `<use href="#cjar-plain" x="${x}" y="${y}" width="${w}" height="${w * 120 / 140}" style="--glass:${glass}"/>`;

  const P = [
    { id: "boj-rice-sun", cat: "sun", tag: "Best seller", brand: "Beauty of Joseon", name: "Relief Sun: Rice + Probiotics SPF 50+", size: "50 ml",
      points: ["Lightweight, creamy SPF 50+ PA++++", "Rice extract + grain probiotics", "No white cast — wear under makeup"],
      desc: "A cult Korean daily sunscreen with a light, moisturising cream texture. Rice extract and grain-derived probiotics keep skin comfortable while high SPF 50+ PA++++ protection guards against UVA and UVB — perfect for life under the Gulf sun.",
      use: "Apply generously as the last step of your morning skincare, about 15 minutes before sun exposure. Reapply every 2 hours outdoors.",
      art: tube(115, 14, 70, "#cfe0f3", "#a9c6e8") },
    { id: "boj-aqua-sun", cat: "sun", tag: "Fresh", brand: "Beauty of Joseon", name: "Relief Sun Aqua-Fresh SPF 50+", size: "50 ml",
      points: ["Watery, fast-absorbing finish", "SPF 50+ PA++++ daily protection", "Great for oily & combination skin"],
      desc: "The fresh, watery version of the Relief Sun — it sinks in quickly with a light, hydrating feel and no greasy finish. High SPF 50+ PA++++ for everyday protection.",
      use: "Apply generously as the last skincare step in the morning. Reapply every 2 hours when outdoors.",
      art: tube(115, 14, 70, "#cdeee8", "#9fd6cf") },
    { id: "boj-glow-serum", cat: "serum", tag: "Glow", brand: "Beauty of Joseon", name: "Glow Serum: Propolis + Niacinamide", size: "30 ml",
      points: ["Honey-glow propolis serum", "Niacinamide for a brighter look", "Soothing & lightweight"],
      desc: "A golden, honey-like serum with propolis extract and niacinamide that soothes, hydrates and leaves skin with a healthy, even-looking glow.",
      use: "After cleansing and toner, press 2–3 drops into the face and neck. Follow with moisturiser and, in the morning, sunscreen.",
      art: drop(116, 10, 68, "#fff4d6", "#e9a93a", "#e7c46a") },
    { id: "boj-dynasty", cat: "cream", tag: "Rich care", brand: "Beauty of Joseon", name: "Dynasty Cream", size: "50 ml",
      points: ["Rich-yet-light moisturiser", "Inspired by traditional Korean ingredients like rice", "Soft, dewy glow"],
      desc: "A comforting, rich-yet-light moisturiser inspired by traditional Korean beauty — rice-based care that leaves skin soft, plump and dewy.",
      use: "As the last step of your skincare (before sunscreen in the morning), smooth a small amount over face and neck.",
      art: jar(66, 70, 168, "#f6efe4") },
    { id: "cosrx-snail", cat: "cream", tag: "Cult favourite", brand: "COSRX", name: "Advanced Snail 92 All in One Cream", size: "100 g",
      points: ["92% snail secretion filtrate", "Hydrates & supports skin repair", "Gel-cream texture, all skin types"],
      desc: "A bestselling all-in-one gel cream with 92% snail secretion filtrate that hydrates, soothes and helps skin look smoother and healthier.",
      use: "As the last step of your routine, apply an appropriate amount and pat gently until absorbed.",
      art: jar(66, 70, 168, "#3d3739") },
    { id: "boj-sun-duo", cat: "set sun", tag: "Set", brand: "Beauty of Joseon", name: "Sun Duo Set (2 × Relief Sun)", size: "2 × 50 ml",
      points: ["Two Relief Sun Rice + Probiotics", "One for home, one for your bag", "SPF 50+ PA++++"],
      desc: "Two of the Relief Sun Rice + Probiotics SPF 50+ — keep one at home and one in your bag so you never miss a reapply.",
      use: "Apply generously as the last morning step and reapply every 2 hours outdoors.",
      art: tube(78, 20, 66, "#cfe0f3", "#a9c6e8") + tube(156, 20, 66, "#cfe0f3", "#a9c6e8") },
    { id: "boj-glow-set", cat: "set", tag: "Gift set", brand: "Beauty of Joseon", name: "Complete Glow Set (sun + serum + cream)", size: "Set of 3",
      points: ["Relief Sun SPF 50+", "Glow Serum: Propolis + Niacinamide", "Dynasty Cream"],
      desc: "A complete glow routine in one set — serum to brighten, cream to nourish and sunscreen to protect. A beautiful gift, too 🎁",
      use: "Morning: serum → cream → sunscreen. Evening: serum → cream.",
      art: tube(28, 30, 58, "#cfe0f3", "#a9c6e8") + drop(212, 54, 56, "#fff4d6", "#e9a93a", "#e7c46a") + jar(86, 116, 136, "#f6efe4") }
  ];

  const askWa = p => wa(`Hi AnzGlow, what's the price of ${p.brand} ${p.name} (${p.size})? Is it in stock?`);
  const askMail = p => mail(`Price enquiry: ${p.brand} ${p.name}`, `Hi AnzGlow,\n\nCould you tell me the price and availability of ${p.brand} ${p.name} (${p.size})?\n\nName:\nPhone:\n`);
  const art = p => p.img ? `<img class="prod-photo clean" src="${p.img}" alt="${p.brand} ${p.name}">` : `<svg viewBox="0 0 300 230" aria-hidden="true">${p.art}</svg>`;

  grid.innerHTML = P.map((p, i) => `
    <article class="kit kb-card reveal d${i % 4}" data-cat="${p.cat}">
      <span class="tag ${p.cat.includes("set") ? "gold" : "rose"}">${p.tag}</span>
      <button class="wish" aria-label="Save to wishlist" data-wish="${p.id}"><svg><use href="#i-heart"/></svg></button>
      <button class="kit-stage" data-kb="${p.id}" aria-label="View ${p.name}">${art(p)}<span class="qv-hint">Quick view</span></button>
      <span class="kb-brand">${p.brand}</span>
      <h3><button class="kit-name" data-kb="${p.id}">${p.name}</button></h3>
      <ul class="kit-list">${p.points.map(x => `<li>${x}</li>`).join("")}</ul>
      <div class="kit-foot">
        <div class="price"><small>${p.size}</small><span class="kb-ask">Price on request</span></div>
        <div class="kit-actions">
          <a class="btn btn-buy btn-sm" href="${askWa(p)}" target="_blank" rel="noopener"><svg><use href="#i-wa"/></svg>Ask price</a>
          <span class="enq"><a class="e-mail" href="${askMail(p)}" aria-label="Email about ${p.name}" title="Enquire by email"><svg><use href="#i-mail"/></svg></a></span>
        </div>
      </div>
    </article>`).join("");
  window.AG.observeReveals(grid);
  const wishes = window.AG.store.get("anz-wish", []);
  $$("[data-wish]", grid).forEach(x => x.classList.toggle("on", wishes.includes(x.dataset.wish)));

  // filters
  $$("#kbFilters button").forEach(b => b.addEventListener("click", () => {
    $$("#kbFilters button").forEach(x => x.classList.toggle("on", x === b));
    $$(".kb-card", grid).forEach(c => c.hidden = b.dataset.f !== "all" && !c.dataset.cat.split(" ").includes(b.dataset.f));
  }));

  // quick view (re-uses the shop's product pop-up, in "ask for price" mode)
  document.addEventListener("click", e => {
    if (e.target.closest("[data-qv]")) { $("#quick").classList.remove("ask"); $("#qvWa").innerHTML = `<svg><use href="#i-wa"/></svg>Order on WhatsApp`; }
    const t = e.target.closest("[data-kb]"); if (!t) return;
    const p = P.find(x => x.id === t.dataset.kb);
    $("#quick").classList.add("ask");
    $("#qvTag").textContent = p.tag; $("#qvTag").className = "tag rose";
    $("#qvName").textContent = `${p.brand} ${p.name}`;
    $("#qvPrice").innerHTML = `<span class="kb-ask">Price on request</span> <small class="kb-size">${p.size}</small>`;
    $("#qvDesc").textContent = p.desc; $("#qvUse").textContent = p.use;
    $("#qvList").innerHTML = p.points.map(x => `<li>${x}</li>`).join("");
    $("#qvMain").innerHTML = art(p); $("#qvThumbs").innerHTML = "";
    $("#qvWa").href = askWa(p); $("#qvMail").href = askMail(p);
    $("#qvWa").innerHTML = `<svg><use href="#i-wa"/></svg>Ask price on WhatsApp`;
    openModal("quick");
  });
})();

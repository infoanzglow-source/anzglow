/* AnzGlow — K-Beauty edit section (home page). Products + prices live in kbdata.js. */
(() => {
  const { $, $$, KITS, artSvg, enquire, priceHtml, observeReveals, store } = window.AG;
  const grid = $("#kbGrid"); if (!grid) return;
  const P = KITS.filter(k => k.kb);

  grid.innerHTML = P.map((p, i) => `
    <article class="kit kb-card reveal d${i % 4}" data-cat="${p.cat}">
      <span class="tag ${p.tagClass}">${p.tag}</span>
      ${p.save > 0 ? `<span class="sale-tag kb-save">Save AED ${p.save}</span>` : ""}
      <button class="wish" aria-label="Save to wishlist" data-wish="${p.id}"><svg><use href="#i-heart"/></svg></button>
      <button class="kit-stage" data-qv="${p.id}" aria-label="View ${p.name}">${artSvg(p)}<span class="qv-hint">Quick view</span></button>
      <span class="kb-brand">${p.brand}</span>
      <h3><button class="kit-name" data-qv="${p.id}">${p.title}</button></h3>
      <ul class="kit-list">${p.items.map(x => `<li>${x}</li>`).join("")}</ul>
      <div class="kit-foot">
        <div class="price"><small>${p.size}</small>${priceHtml(p)}</div>
        <div class="kit-actions"><button class="btn btn-buy btn-sm" data-add="${p.id}">Add to cart</button>${enquire(p.name)}</div>
      </div>
    </article>`).join("");
  observeReveals(grid);
  const wishes = store.get("anz-wish", []);
  $$("[data-wish]", grid).forEach(x => x.classList.toggle("on", wishes.includes(x.dataset.wish)));

  $$("#kbFilters button").forEach(b => b.addEventListener("click", () => {
    $$("#kbFilters button").forEach(x => x.classList.toggle("on", x === b));
    $$(".kb-card", grid).forEach(c => c.hidden = b.dataset.f !== "all" && !c.dataset.cat.split(" ").includes(b.dataset.f));
  }));
})();

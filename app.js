/* AnzGlow — home page (needs shades.js + common.js first). */
(() => {
  const { $, $$, KITS, PK, artSvg, wa, mail, enquire, pct, priceHtml, DELIVERY_FEE, addToCart, toast, openModal, closeModals, observeReveals } = window.AG;

  // ---------- Collection cards ----------
  $("#kitGrid").innerHTML = KITS.filter(k => !k.kb).map((k, i) => {
    const isPK = k.id === PK.id;
    const stage = isPK
      ? `<a class="kit-stage" href="${k.page}?shade=${PK.heroShade}" aria-label="See all 12 shades">${artSvg(k)}<span class="qv-hint">See 12 shades</span></a>`
      : `<button class="kit-stage" data-qv="${k.id}" aria-label="View ${k.name}">${artSvg(k)}<span class="qv-hint">Quick view</span></button>`;
    const title = isPK ? `<a class="kit-name" href="${k.page}">${k.name}</a>` : `<button class="kit-name" data-qv="${k.id}">${k.name}</button>`;
    const cta = isPK
      ? `<a class="btn btn-gold btn-sm" href="${k.page}?shade=${PK.heroShade}">Choose shade</a>`
      : `<button class="btn ${k.featured ? "btn-gold" : "btn-dark"} btn-sm" data-add="${k.id}">Add to cart</button>`;
    return `
    <article class="kit reveal d${i % 4} ${k.featured ? "featured" : ""}" data-id="${k.id}">
      <span class="tag ${k.tagClass}">${k.tag}</span>
      ${k.was ? `<span class="sale-tag">SALE −${pct(k)}%</span>` : ""}
      <button class="wish" aria-label="Save to wishlist" data-wish="${k.id}"><svg><use href="#i-heart"/></svg></button>
      ${stage}
      <h3>${title}</h3>
      ${isPK ? `<div class="kit-shades">${PK.shades.map(s => `<i style="background:${s.hex}" title="${s.no} ${s.name}"></i>`).join("")}</div>` : ""}
      <ul class="kit-list">${k.items.map(x => `<li>${x}</li>`).join("")}</ul>
      <p class="kit-note">${k.note}</p>
      <div class="kit-foot">
        <div class="price"><small>${isPK ? "Each shade" : "Price"}</small>${priceHtml(k)}</div>
        <div class="kit-actions">${cta}${enquire(k.short || k.name)}</div>
      </div>
    </article>`;
  }).join("");
  $$("[data-wish]").forEach(x => x.classList.toggle("on", (window.AG.store.get("anz-wish", [])).includes(x.dataset.wish)));

  // (lipstick shade strip removed)
  const strip = $("#pkStrip");
  if (strip) strip.innerHTML = PK.shades.map(s =>
    `<a href="pink-key.html?shade=${s.no}" title="${s.no} ${s.name}" class="${s.no === PK.heroShade ? "hero-shade" : ""}"><i style="background:${s.hex}"></i>${s.no}<br>${s.name}</a>`).join("");


  observeReveals();

  // ---------- Card tilt + light ----------
  $$(".kit").forEach(card => {
    card.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", x * 100 + "%"); card.style.setProperty("--my", y * 100 + "%");
      card.style.transform = `perspective(900px) rotateX(${(.5 - y) * 6}deg) rotateY(${(x - .5) * 8}deg) translateY(-6px)`;
    });
    card.addEventListener("pointerleave", () => card.style.transform = "");
  });

  // ---------- Active nav on scroll ----------
  const navLinks = $$("#nav a");
  const spy = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const id = en.target.classList.contains("hero") ? "top" : en.target.id;
    navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  ["kits", "finder", "ritual", "story", "reviews", "order"].forEach(id => { const el = document.getElementById(id); if (el) spy.observe(el); });
  spy.observe($(".hero"));

  // ---------- Glow Finder ----------
  const FIND = {
    tan:  { kit: "tan",  title: "Tan Removal Combo Kit", text: "Fades sun tan and dark spots while keeping skin soft — our best seller for life under the UAE sun.", m: [92, 70, 80] },
    dull: { kit: "glow", title: "Complete Glow Beauty Kit", text: "Cleanse, nourish and finish with serum for that lit-from-within glow, every single day.", m: [70, 95, 78] },
    dry:  { kit: "glow", title: "Complete Glow Beauty Kit", text: "A hydration-first ritual: gentle cleanser, rich moisturiser and a serum that keeps skin plump.", m: [55, 78, 96] },
    age:  { kit: "glow", title: "Complete Glow Beauty Kit", text: "Cleanser, moisturiser and serum that smooth, brighten and wake up tired-looking skin.", m: [62, 90, 86] }
  };
  const showFind = c => {
    const f = FIND[c], k = KITS.find(x => x.id === f.kit);
    const copy = $("#resultCopy"), art = $("#resultArt");
    copy.classList.add("out"); art.classList.add("out");
    setTimeout(() => {
      copy.innerHTML = `<span class="r-k">Your perfect match</span><h3 class="gold-text">${f.title}</h3><p>${f.text}</p>
        <div class="meter">${["Even tone", "Radiance", "Hydration"].map((l, i) => `<div>${l}<span><i data-w="${f.m[i]}"></i></span>${f.m[i]}%</div>`).join("")}</div>
        <button class="btn btn-gold" data-add="${k.id}">Add to cart — AED ${k.price} <svg><use href="#i-arrow"/></svg></button>`;
      art.innerHTML = artSvg(k, "r-prod");
      copy.classList.remove("out"); art.classList.remove("out");
      requestAnimationFrame(() => requestAnimationFrame(() => $$("#resultCopy [data-w]").forEach(i => i.style.width = i.dataset.w + "%")));
    }, 300);
  };
  $$("#concerns .concern").forEach(b => b.onclick = () => {
    $$("#concerns .concern").forEach(x => x.classList.toggle("on", x === b)); showFind(b.dataset.c);
  });
  showFind("tan");

  // ---------- Quick view (shampoo + skincare kits) ----------
  let qvKit = null, qvQty = 1;
  const qvMain = src => { $("#qvMain").innerHTML = src ? `<img src="${src}" alt="${qvKit.name}">` : artSvg(qvKit); };
  const openQuick = id => {
    const k = qvKit = KITS.find(x => x.id === id); qvQty = 1;
    $("#qvTag").textContent = k.tag; $("#qvTag").className = "tag " + k.tagClass;
    $("#qvName").textContent = k.name;
    $("#qvPrice").innerHTML = priceHtml(k) + (k.was ? ` <span class="sale-pill">Save ${pct(k)}%</span>` : "");
    $("#qvDesc").textContent = k.desc; $("#qvUse").textContent = k.use;
    $("#qvList").innerHTML = k.items.map(x => `<li>${x}</li>`).join("");
    $("#qvQty").textContent = 1;
    const g = k.gallery || [];
    qvMain(g[0]);
    $("#qvThumbs").innerHTML = g.map((src, i) => `<button class="${i ? "" : "on"}" data-src="${src}"><img src="${src}" alt=""></button>`).join("");
    $$("#qvThumbs button").forEach(b => b.onclick = () => { $$("#qvThumbs button").forEach(x => x.classList.toggle("on", x === b)); qvMain(b.dataset.src); });
    $("#qvWa").href = wa(`Hi AnzGlow, I'd like to order: ${k.name} (AED ${k.price}).`);
    $("#qvMail").href = mail(`Enquiry: ${k.name}`, `Hi AnzGlow,\n\nI'd like to know more about ${k.name} (AED ${k.price}).\n\nName:\nPhone:\n`);
    openModal("quick");
  };
  document.addEventListener("click", e => { const q = e.target.closest("[data-qv]"); if (q) openQuick(q.dataset.qv); });
  $("#qvMinus").onclick = () => { qvQty = Math.max(1, qvQty - 1); $("#qvQty").textContent = qvQty; };
  $("#qvPlus").onclick = () => { qvQty = Math.min(20, qvQty + 1); $("#qvQty").textContent = qvQty; };
  $("#qvAdd").onclick = () => { addToCart(qvKit.id, qvQty); closeModals(); };

  // ---------- Order form ----------
  const oKit = $("#oKit");
  oKit.innerHTML = KITS.map(k => `<option value="${k.id}">${k.name} — AED ${k.price}</option>`).join("");
  const priceOf = v => KITS.find(k => k.id === v).price;
  const formTotal = () => { const p = priceOf(oKit.value); $("#oTotal").textContent = `AED ${p} + AED ${DELIVERY_FEE} delivery = AED ${p + DELIVERY_FEE}`; };
  oKit.addEventListener("change", formTotal); formTotal();
  $("#orderForm").addEventListener("submit", e => {
    e.preventDefault();
    const name = $("#oName").value.trim(), phone = $("#oPhone").value.trim();
    if (!name || phone.replace(/\D/g, "").length < 9) { toast("Please add your name and a valid mobile number"); return; }
    const product = oKit.options[oKit.selectedIndex].text;
    window.open(wa(`New AnzGlow order\nName: ${name}\nPhone: ${phone}\nProduct: ${product}\nTotal: ${$("#oTotal").textContent}\nEmirate: ${$("#oCity").value}`), "_blank", "noopener");
    toast(`Thank you, ${name}! We'll call you to confirm your order.`);
    e.target.reset(); formTotal();
  });

  // ---------- Reviews ----------
  const track = $("#reviewTrack");
  const step = () => track.firstElementChild.getBoundingClientRect().width + 28;
  $("#revNext").onclick = () => track.scrollBy({ left: step(), behavior: "smooth" });
  $("#revPrev").onclick = () => track.scrollBy({ left: -step(), behavior: "smooth" });

  // ---------- FAQ ----------
  $$(".qa button").forEach(b => b.onclick = () => {
    const qa = b.parentElement, open = qa.classList.contains("open");
    $$(".qa").forEach(x => x.classList.remove("open")); if (!open) qa.classList.add("open");
  });

  // ---------- Countdown to end of month ----------
  const now = new Date(), end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const pad = n => String(n).padStart(2, "0");
  const tick = () => {
    let s = Math.max(0, Math.floor((end - Date.now()) / 1000));
    const d = Math.floor(s / 86400); s %= 86400;
    const v = { d, h: Math.floor(s / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
    $$("#timer [data-t]").forEach(b => b.textContent = pad(v[b.dataset.t]));
  };
  tick(); setInterval(tick, 1000);

  // ---------- Hero banner slider ----------
  const slides = $$("#hxSlides .hx-slide"), tabs = $$("#hxTabs button");
  if (slides.length) {
    const DURATION = 6500;
    let idx = 0, timer = null;
    const hero = $(".hx-hero");
    const show = n => {
      idx = (n + slides.length) % slides.length;
      slides.forEach((s, i) => { s.classList.toggle("on", i === idx); s.setAttribute("aria-hidden", i !== idx); });
      tabs.forEach((t, i) => t.classList.toggle("on", i === idx));
      hero.style.setProperty("--tint", slides[idx].style.getPropertyValue("--tint"));
      hero.style.setProperty("--tint2", slides[idx].style.getPropertyValue("--tint2"));
      restart();
    };
    const restart = () => {
      clearTimeout(timer);
      tabs.forEach(t => { const bar = t.querySelector("i"); bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = ""; });
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) timer = setTimeout(() => show(idx + 1), DURATION);
    };
    tabs.forEach((t, i) => t.onclick = () => show(i));
    $("#hxPrev").onclick = () => show(idx - 1);
    $("#hxNext").onclick = () => show(idx + 1);
    hero.addEventListener("mouseenter", () => { clearTimeout(timer); hero.classList.add("paused"); });
    hero.addEventListener("mouseleave", () => { hero.classList.remove("paused"); restart(); });
    // swipe on phones
    let x0 = null;
    hero.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener("touchend", e => {
      if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 45) show(idx + (dx < 0 ? 1 : -1));
    }, { passive: true });
    show(0);
  }

  // ---------- Gold sparkles ----------
  const cv = $("#sparkles"); if (!cv) return;
  const ctx = cv.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W, H, P = [];
  const size = () => {
    const r = cv.parentElement.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    P = Array.from({ length: Math.round(W / 18) }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.6 + .3, v: Math.random() * .35 + .08, a: Math.random() * Math.PI * 2 }));
  };
  size(); addEventListener("resize", size);
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    for (const p of P) {
      p.y -= p.v; p.a += .02; if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
      const o = .35 + Math.sin(p.a) * .35;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7);
      ctx.fillStyle = `rgba(243,217,153,${o})`; ctx.shadowColor = "#f3d999"; ctx.shadowBlur = 8; ctx.fill();
    }
    if (!reduce) requestAnimationFrame(draw);
  };
  draw();
})();

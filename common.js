/* AnzGlow — shared by every page: catalogue, bag, checkout, menu, policies, animations. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const PK = window.PK;

  const WHATSAPP = "971566650328";   // orders + support
  const DELIVERY_FEE = 10;           // AED, flat across the UAE

  // ---------- Catalogue (skincare kit prices are placeholders) ----------
  const KITS = [
    {
      id: "tan", tag: "Best Seller", tagClass: "", name: "Tan Removal Combo Kit",
      items: ["Face Wash", "Tan Removal Cream", "Body Lotion"], note: "For clear & even skin",
      price: 149, was: 189,
      desc: "A three-step set that gently lifts sun tan and evens out dark spots, while keeping skin soft and hydrated.",
      use: "Wash face with the Face Wash, apply a thin layer of Tan Removal Cream on tanned areas, finish with Body Lotion. Use twice daily; patch test first.",
      art: `<use href="#tube" x="30" y="12" width="84" height="210"/><use href="#tube" x="196" y="56" width="66" height="166"/><use href="#jar" x="96" y="128" width="118" height="100"/>`
    },
    {
      id: "glow", tag: "Popular", tagClass: "", featured: true, name: "Complete Glow Beauty Kit",
      items: ["Gentle Cleanser", "Moisturiser", "Glow Serum"], note: "Get your natural glow",
      price: 199, was: 249,
      desc: "Our complete daily ritual — cleanse, nourish and finish with serum for that lit-from-within glow.",
      use: "Morning and night: cleanse, press 2–3 drops of serum into skin, then seal with moisturiser.",
      art: `<use href="#pump" x="40" y="4" width="72" height="224"/><use href="#dropper" x="200" y="70" width="52" height="160"/><use href="#jar" x="100" y="128" width="118" height="100"/>`
    },
    {
      id: PK.id, tag: "New · 12 shades", tagClass: "rose", name: PK.name,
      items: ["12 matte shades", "Pinks, nudes, browns & reds", "Suits every skin tone"], note: "Natural beauty, lasting confidence",
      price: PK.price, was: null, img: "assets/pinkkey/pk-open.jpg", page: "pink-key.html"
    }
  ];
  // Bag ids: "tan", "glow", or "pinkkey:05" (lipstick + shade number)
  const itemOf = id => {
    const [base, shadeNo] = id.split(":");
    const k = KITS.find(x => x.id === base); if (!k) return null;
    const shade = shadeNo ? PK.find(shadeNo) : null;
    if (base === PK.id && !shade) return null;
    return { k, shade, label: shade ? `${k.name} — ${shade.no} ${shade.name}` : k.name,
             thumb: shade ? PK.img(shade.no) : k.img };
  };
  const artSvg = (k, cls = "") => k.img
    ? `<img class="prod-photo ${cls}" src="${k.img}" alt="${k.name}">`
    : `<svg class="${cls}" viewBox="0 0 300 230" aria-hidden="true">${k.art}</svg>`;
  const wa = text => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

  // ---------- Storage ----------
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };
  const cart = store.get("anz-cart", {});
  Object.keys(cart).forEach(id => { if (!itemOf(id) || !(cart[id] > 0)) delete cart[id]; });
  const wish = new Set(store.get("anz-wish", []));

  // ---------- Toast ----------
  let tt;
  const toast = msg => {
    $("#toastMsg").textContent = msg; $("#toast").classList.add("show");
    clearTimeout(tt); tt = setTimeout(() => $("#toast").classList.remove("show"), 2600);
  };
  const bump = el => { el.classList.add("bump"); setTimeout(() => el.classList.remove("bump"), 350); };

  // ---------- Bag ----------
  const bagLines = () => Object.keys(cart).filter(id => cart[id] > 0).map(id => ({ id, qty: cart[id], ...itemOf(id) }));
  const renderCart = () => {
    const lines = bagLines();
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const sub = lines.reduce((n, l) => n + l.qty * l.k.price, 0);
    const ship = count ? DELIVERY_FEE : 0;
    $("#cartCount").textContent = count;
    $("#cartSub").textContent = "AED " + sub;
    $("#cartShip").textContent = "AED " + ship;
    $("#cartTotal").textContent = "AED " + (sub + ship);
    $("#cartBody").innerHTML = lines.length ? lines.map(l => `
      <div class="ci-row"><div class="thumb">${l.thumb ? `<img class="prod-photo" src="${l.thumb}" alt="">` : artSvg(l.k)}</div>
        <div><b>${l.k.name}</b>${l.shade ? `<small>Shade ${l.shade.no} · ${l.shade.name}</small>` : ""}
          <span class="qty"><button data-dec="${l.id}" aria-label="Less">−</button>${l.qty}<button data-inc="${l.id}" aria-label="More">+</button></span></div>
        <span>AED ${l.k.price * l.qty}</span></div>`).join("")
      : `<div class="empty"><span class="script">Your bag is empty</span>Your glow is just one click away.</div>`;
    store.set("anz-cart", cart);
  };
  const addToCart = (id, qty = 1) => {
    const it = itemOf(id); if (!it) return;
    cart[id] = (cart[id] || 0) + qty; renderCart(); bump($("#cartCount"));
    toast(`${qty > 1 ? qty + " × " : ""}${it.label} added to your bag`);
  };
  const openCart = () => document.body.classList.add("cart-open");
  const closeCart = () => document.body.classList.remove("cart-open");

  document.addEventListener("click", e => {
    const add = e.target.closest("[data-add]"); if (add) addToCart(add.dataset.add);
    const inc = e.target.closest("[data-inc]"); if (inc) { cart[inc.dataset.inc]++; renderCart(); }
    const dec = e.target.closest("[data-dec]"); if (dec) { cart[dec.dataset.dec]--; if (cart[dec.dataset.dec] <= 0) delete cart[dec.dataset.dec]; renderCart(); }
    const w = e.target.closest("[data-wish]");
    if (w) {
      const id = w.dataset.wish; wish.has(id) ? wish.delete(id) : wish.add(id);
      $$(`[data-wish="${id}"]`).forEach(x => x.classList.toggle("on", wish.has(id)));
      $("#wishCount").textContent = wish.size; bump($("#wishCount"));
      store.set("anz-wish", [...wish]); if (wish.has(id)) toast("Saved to your wishlist ♡");
    }
  });
  $("#cartBtn").onclick = openCart;
  $("#cartClose").onclick = closeCart;
  $("#scrim").onclick = closeCart;
  $("#wishCount").textContent = wish.size;
  $$("[data-wish]").forEach(x => x.classList.toggle("on", wish.has(x.dataset.wish)));
  renderCart();

  // Checkout: the whole bag goes to WhatsApp as a ready-to-send order
  $("#checkout").addEventListener("click", e => {
    e.preventDefault();
    const lines = bagLines();
    if (!lines.length) { toast("Your bag is empty — add a product first"); return; }
    const sub = lines.reduce((n, l) => n + l.qty * l.k.price, 0);
    const text = `Hi AnzGlow, I'd like to order:\n${lines.map(l => `• ${l.qty} × ${l.label} — AED ${l.k.price * l.qty}`).join("\n")}\nDelivery: AED ${DELIVERY_FEE}\nTotal: AED ${sub + DELIVERY_FEE} (cash on delivery)\n\nName:\nArea / Emirate:`;
    window.open(wa(text), "_blank", "noopener");
    closeCart();
  });

  // ---------- Menu + header ----------
  $("#menuBtn").onclick = () => document.body.classList.add("menu-open");
  $("#menuClose").onclick = () => document.body.classList.remove("menu-open");
  $$("#mnav a").forEach(a => a.addEventListener("click", () => document.body.classList.remove("menu-open")));
  const header = $("#header");
  const onScroll = () => header.classList.toggle("scrolled", scrollY > 20);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // ---------- Modals + policies ----------
  const openModal = id => { document.body.classList.add("modal-open"); $("#" + id).classList.add("open"); };
  const closeModals = () => { document.body.classList.remove("modal-open"); $$(".modal.open").forEach(m => m.classList.remove("open")); };
  $$(".modal").forEach(m => m.addEventListener("click", e => { if (e.target === m || e.target.closest("[data-close]")) closeModals(); }));
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    closeModals(); closeCart(); document.body.classList.remove("menu-open");
  });
  const POLICIES = {
    delivery: ["Delivery", `<p><b>AED 10 flat delivery</b> to all seven emirates — Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah and Umm Al Quwain.</p><p>Orders are usually delivered within <b>1–2 working days</b>. We call or WhatsApp you to confirm before dispatch.</p><p><b>Payment:</b> cash on delivery — pay when your order arrives.</p>`],
    returns: ["Returns", `<p>Unopened, unused products can be returned within <b>7 days</b> of delivery. For hygiene reasons, opened cosmetics (including lipsticks) can't be returned unless they arrived damaged.</p><p>If anything arrives damaged or wrong, message us within 48 hours with a photo and we'll replace it.</p>`],
    privacy: ["Privacy policy", `<p>We only collect the details needed to deliver your order — your name, phone number and emirate/address — and use them only to confirm, deliver and support your order.</p><p>We never sell or share your details with third parties, apart from the courier who delivers your parcel. Ask us anytime to delete your details.</p>`]
  };
  document.addEventListener("click", e => {
    const p = e.target.closest("[data-policy]"); if (!p) return;
    e.preventDefault(); const [t, body] = POLICIES[p.dataset.policy];
    $("#polTitle").textContent = t; $("#polBody").innerHTML = body; openModal("policy");
  });

  // ---------- Reveal + counters ----------
  const countUp = el => {
    const to = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0, suf = el.dataset.suffix || "";
    const t0 = performance.now();
    const tick = t => {
      const p = Math.min(1, (t - t0) / 1600), v = to * (1 - Math.pow(1 - p, 3));
      el.textContent = (dec ? v.toFixed(dec) : Math.round(v).toLocaleString()) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add("in"); $$("[data-count]", en.target).forEach(countUp); io.unobserve(en.target);
  }), { threshold: .12 });
  const observeReveals = (root = document) => $$(".reveal, #ritualTrack", root).forEach(el => io.observe(el));

  // ---------- Misc ----------
  const toTop = $("#toTop"); if (toTop) toTop.onclick = () => scrollTo({ top: 0, behavior: "smooth" });
  const news = $("#newsForm"); if (news) news.addEventListener("submit", e => { e.preventDefault(); toast("Welcome to the Glow Club ✨"); e.target.reset(); });
  const yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();
  const glow = $("#cursorGlow");
  if (glow) addEventListener("pointermove", e => { glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px"; }, { passive: true });
  const mq = $("#marquee"); if (mq) mq.innerHTML += mq.innerHTML;

  window.AG = { $, $$, KITS, PK, itemOf, artSvg, wa, WHATSAPP, DELIVERY_FEE, addToCart, toast, openModal, closeModals, observeReveals, store };
})();

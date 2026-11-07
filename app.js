/* AnzGlow — interactions */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- Product data (prices are placeholders — set your real prices) ----------
  const KITS = [
    {
      id: "tan", tag: "Best Seller", tagClass: "", name: "Tan Removal Combo Kit",
      items: ["Face Wash", "Tan Removal Cream", "Body Lotion"], note: "For clear & even skin",
      price: 149, was: 189,
      art: `<use href="#tube" x="30" y="12" width="84" height="210"/><use href="#tube" x="196" y="56" width="66" height="166"/><use href="#jar" x="96" y="128" width="118" height="100"/>`
    },
    {
      id: "glow", tag: "Popular", tagClass: "", featured: true, name: "Complete Glow Beauty Kit",
      items: ["Gentle Cleanser", "Moisturiser", "Glow Serum"], note: "Get your natural glow",
      price: 199, was: 249,
      art: `<use href="#pump" x="40" y="4" width="72" height="224"/><use href="#dropper" x="200" y="70" width="52" height="160"/><use href="#jar" x="100" y="128" width="118" height="100"/>`
    },
    {
      id: "pinkkey", tag: "New", tagClass: "rose", name: "Pink Key Liquid Lipstick",
      items: ["Little Brown Pink shade", "Long-lasting, non-sticky", "Rich pigment, gentle on lips"], note: "The perfect shade for every you",
      price: 59, was: 79, img: "assets/pinkkey.jpg"
    }
  ];
  const DELIVERY_FEE = 10; // AED, flat rate across the UAE
  const artSvg =(k, cls = "") => k.img
    ? `<img class="prod-photo ${cls}" src="${k.img}" alt="${k.name}">`
    : `<svg class="${cls}" viewBox="0 0 300 230" aria-hidden="true">${k.art}</svg>`;

  // ---------- Safe storage ----------
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };
  let cart = store.get("anz-cart", {});
  let wish = new Set(store.get("anz-wish", []));

  // ---------- Render kits ----------
  $("#kitGrid").innerHTML = KITS.map((k, i) => `
    <article class="kit reveal d${i} ${k.featured ? "featured" : ""}" data-id="${k.id}">
      <span class="tag ${k.tagClass}">${k.tag}</span>
      <button class="wish ${wish.has(k.id) ? "on" : ""}" aria-label="Save to wishlist" data-wish="${k.id}"><svg><use href="#i-heart"/></svg></button>
      <div class="kit-stage">${artSvg(k)}</div>
      <h3>${k.name}</h3>
      <ul class="kit-list">${k.items.map(x => `<li>${x}</li>`).join("")}</ul>
      <p class="kit-note">${k.note}</p>
      <div class="kit-foot">
        <div class="price"><small>Kit price</small>AED ${k.price}<s>${k.was}</s></div>
        <button class="btn ${k.featured ? "btn-gold" : "btn-dark"} btn-sm" data-add="${k.id}">Add to bag <svg><use href="#i-arrow"/></svg></button>
      </div>
    </article>`).join("");

  // ---------- Toast ----------
  let tt;
  const toast = msg => {
    $("#toastMsg").textContent = msg;
    $("#toast").classList.add("show");
    clearTimeout(tt); tt = setTimeout(() => $("#toast").classList.remove("show"), 2600);
  };
  const bump = el => { el.classList.add("bump"); setTimeout(() => el.classList.remove("bump"), 350); };

  // ---------- Cart ----------
  const renderCart = () => {
    const ids = Object.keys(cart).filter(id => cart[id] > 0);
    const count = ids.reduce((n, id) => n + cart[id], 0);
    const total = ids.reduce((n, id) => n + cart[id] * KITS.find(k => k.id === id).price, 0);
    const ship = count ? DELIVERY_FEE : 0;
    $("#cartCount").textContent = count;
    $("#cartSub").textContent = "AED " + total;
    $("#cartShip").textContent = "AED " + ship;
    $("#cartTotal").textContent = "AED " + (total + ship);
    $("#cartBody").innerHTML = ids.length ? ids.map(id => {
      const k = KITS.find(x => x.id === id);
      return `<div class="ci-row"><div class="thumb">${artSvg(k)}</div>
        <div><b>${k.name}</b><span class="qty"><button data-dec="${id}" aria-label="Less">−</button>${cart[id]}<button data-inc="${id}" aria-label="More">+</button></span></div>
        <span>AED ${k.price * cart[id]}</span></div>`;
    }).join("") : `<div class="empty"><span class="script">Your bag is empty</span>Your glow is just one kit away.</div>`;
    store.set("anz-cart", cart);
  };
  const openCart = () => document.body.classList.add("cart-open");
  const closeCart = () => document.body.classList.remove("cart-open");

  document.addEventListener("click", e => {
    const add = e.target.closest("[data-add]");
    if (add) {
      const id = add.dataset.add; cart[id] = (cart[id] || 0) + 1; renderCart(); bump($("#cartCount"));
      toast(KITS.find(k => k.id === id).name + " added to your bag");
    }
    const inc = e.target.closest("[data-inc]"); if (inc) { cart[inc.dataset.inc]++; renderCart(); }
    const dec = e.target.closest("[data-dec]"); if (dec) { cart[dec.dataset.dec]--; renderCart(); }
    const w = e.target.closest("[data-wish]");
    if (w) {
      const id = w.dataset.wish; wish.has(id) ? wish.delete(id) : wish.add(id);
      w.classList.toggle("on", wish.has(id)); $("#wishCount").textContent = wish.size; bump($("#wishCount"));
      store.set("anz-wish", [...wish]); if (wish.has(id)) toast("Saved to your wishlist ♡");
    }
  });
  $("#cartBtn").onclick = openCart;
  $("#cartClose").onclick = closeCart;
  $("#scrim").onclick = closeCart;
  $("#checkout").onclick = closeCart;
  $("#wishCount").textContent = wish.size;
  renderCart();

  // ---------- Mobile menu ----------
  $("#menuBtn").onclick = () => document.body.classList.add("menu-open");
  $("#menuClose").onclick = () => document.body.classList.remove("menu-open");
  $$("#mnav a").forEach(a => a.onclick = () => document.body.classList.remove("menu-open"));
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeCart(); document.body.classList.remove("menu-open"); } });

  // ---------- Header + active nav ----------
  const header = $("#header");
  const onScroll = () => header.classList.toggle("scrolled", scrollY > 20);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const navLinks = $$("#nav a");
  const spy = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const id = en.target.classList.contains("hero") ? "top" : en.target.id;
    navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  ["kits", "finder", "ritual", "story", "reviews", "order"].forEach(id => spy.observe(document.getElementById(id)));
  spy.observe($(".hero"));

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
    en.target.classList.add("in");
    $$("[data-count]", en.target).forEach(countUp);
    io.unobserve(en.target);
  }), { threshold: .15 });
  $$(".reveal, #ritualTrack").forEach(el => io.observe(el));

  // ---------- Kit tilt + light ----------
  $$(".kit").forEach(card => {
    card.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", x * 100 + "%"); card.style.setProperty("--my", y * 100 + "%");
      card.style.transform = `perspective(900px) rotateX(${(.5 - y) * 6}deg) rotateY(${(x - .5) * 8}deg) translateY(-6px)`;
    });
    card.addEventListener("pointerleave", () => card.style.transform = "");
  });

  // ---------- Glow Finder ----------
  const FIND = {
    tan:  { kit: "tan",     title: "Tan Removal Combo Kit", text: "Fades sun tan and dark spots while keeping skin soft — our best seller for life under the UAE sun.", m: [92, 70, 80] },
    dull: { kit: "glow",    title: "Complete Glow Beauty Kit", text: "Cleanse, nourish and finish with serum for that lit-from-within glow, every single day.", m: [70, 95, 78] },
    dry:  { kit: "glow",    title: "Complete Glow Beauty Kit", text: "A hydration-first ritual: gentle cleanser, rich moisturiser and a serum that keeps skin plump.", m: [55, 78, 96] },
    age:  { kit: "glow",    title: "Complete Glow Beauty Kit", text: "Cleanser, moisturiser and serum that smooth, brighten and wake up tired-looking skin.", m: [62, 90, 86] }
  };
  const showFind = c => {
    const f = FIND[c], k = KITS.find(x => x.id === f.kit);
    const copy = $("#resultCopy"), art = $("#resultArt");
    copy.classList.add("out"); art.classList.add("out");
    setTimeout(() => {
      copy.innerHTML = `<span class="r-k">Your perfect match</span><h3 class="gold-text">${f.title}</h3><p>${f.text}</p>
        <div class="meter">${["Even tone", "Radiance", "Hydration"].map((l, i) => `<div>${l}<span><i data-w="${f.m[i]}"></i></span>${f.m[i]}%</div>`).join("")}</div>
        <button class="btn btn-gold" data-add="${k.id}">Add to bag — AED ${k.price} <svg><use href="#i-arrow"/></svg></button>`;
      art.innerHTML = artSvg(k, "r-prod");
      copy.classList.remove("out"); art.classList.remove("out");
      requestAnimationFrame(() => requestAnimationFrame(() => $$("#resultCopy [data-w]").forEach(i => i.style.width = i.dataset.w + "%")));
    }, 300);
  };
  $$("#concerns .concern").forEach(b => b.onclick = () => {
    $$("#concerns .concern").forEach(x => x.classList.toggle("on", x === b)); showFind(b.dataset.c);
  });
  showFind("tan");

  // ---------- Pink Key shade spotlight ----------
  const SHADES = {
    dark:  { img: "assets/pk-dark.jpg",  label: "On dark skin",  text: "A rich rosy-brown that glows against deep skin tones." },
    brown: { img: "assets/pk-brown.jpg", label: "On brown skin", text: "A soft mauve-pink that warms up medium and olive tones." },
    white: { img: "assets/pk-white.jpg", label: "On fair skin",  text: "A natural dusty rose — polished, never too loud." }
  };
  const pkMain = $("#pkMain");
  $$("#pkShades button").forEach(b => b.onclick = () => {
    $$("#pkShades button").forEach(x => x.classList.toggle("on", x === b));
    const s = SHADES[b.dataset.shade];
    pkMain.classList.add("out");
    setTimeout(() => {
      $("img", pkMain).src = s.img; $("#pkLabel").textContent = s.label; $("#pkText").textContent = s.text;
      pkMain.classList.remove("out");
    }, 280);
  });

  // ---------- Back to top ----------
  $("#toTop").onclick = () => scrollTo({ top: 0, behavior: "smooth" });

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

  // ---------- Forms ----------
  // Set your WhatsApp order number (digits only, e.g. "9715XXXXXXXX") to send orders to WhatsApp.
  const WHATSAPP_ORDER_NUMBER = "971566650328";
  $("#orderForm").addEventListener("submit", e => {
    e.preventDefault();
    const name = $("#oName").value.trim(), phone = $("#oPhone").value.trim();
    if (!name || phone.replace(/\D/g, "").length < 9) { toast("Please add your name and a valid mobile number"); return; }
    const msg = `New AnzGlow order%0AName: ${encodeURIComponent(name)}%0APhone: ${encodeURIComponent(phone)}%0AKit: ${encodeURIComponent($("#oKit").value)}%0AEmirate: ${encodeURIComponent($("#oCity").value)}`;
    if (WHATSAPP_ORDER_NUMBER) window.open(`https://wa.me/${WHATSAPP_ORDER_NUMBER}?text=${msg}`, "_blank", "noopener");
    toast(`Thank you, ${name}! We'll call you to confirm your order.`);
    e.target.reset();
  });
  $("#newsForm").addEventListener("submit", e => { e.preventDefault(); toast("Welcome to the Glow Club ✨"); e.target.reset(); });
  $("#yr").textContent = new Date().getFullYear();

  // ---------- Marquee: duplicate for seamless loop ----------
  const mq = $("#marquee"); mq.innerHTML += mq.innerHTML;

  // ---------- Cursor glow ----------
  const glow = $("#cursorGlow");
  addEventListener("pointermove", e => { glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px"; }, { passive: true });

  // ---------- Hero parallax ----------
  const hv = $("#heroVisual");
  if (matchMedia("(pointer:fine)").matches) {
    addEventListener("pointermove", e => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      $$(".float-card", hv).forEach((c, i) => c.style.translate = `${x * (i ? -18 : 18)}px ${y * (i ? -14 : 14)}px`);
    }, { passive: true });
  }

  // ---------- Gold sparkles ----------
  const cv = $("#sparkles"), ctx = cv.getContext("2d");
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

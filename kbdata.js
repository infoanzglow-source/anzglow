/* AnzGlow — K-Beauty products (loaded before common.js on every page).
   PRICES ARE PLACEHOLDERS — replace with real prices, and keep invoice.js PRICES in sync.
   To use a real photo: add  img: "assets/kbeauty/<file>.jpg", clean: true  to a product. */
(() => {
  const tube = (x, y, w, band, cap) => `<use href="#ctube" x="${x}" y="${y}" width="${w}" height="${w * 200 / 70}" style="--tube:#fbf6ee;--band:${band};--cap:${cap}"/>`;
  const drop = (x, y, w, glass, liq, bulb) => `<use href="#cdrop-plain" x="${x}" y="${y}" width="${w}" height="${w * 196 / 70}" style="--glass:${glass};--liquid:${liq};--bulb:${bulb}"/>`;
  const jar = (x, y, w, glass) => `<use href="#cjar-plain" x="${x}" y="${y}" width="${w}" height="${w * 120 / 140}" style="--glass:${glass}"/>`;
  const BOJ = "Beauty of Joseon";

  window.KB_PRODUCTS = [
    { id: "boj-rice-sun", kb: true, cat: "sun", tag: "Best seller", tagClass: "rose", brand: BOJ, title: "Relief Sun: Rice + Probiotics SPF 50+", size: "50 ml", price: 59,
      items: ["Lightweight, creamy SPF 50+ PA++++", "Rice extract + grain probiotics", "No white cast — wear under makeup"],
      desc: "A cult Korean daily sunscreen with a light, moisturising cream texture. Rice extract and grain-derived probiotics keep skin comfortable while SPF 50+ PA++++ protection guards against UVA and UVB — perfect for life under the Gulf sun. 50 ml.",
      use: "Apply generously as the last step of your morning skincare, about 15 minutes before sun exposure. Reapply every 2 hours outdoors.",
      art: tube(115, 14, 70, "#cfe0f3", "#a9c6e8") },
    { id: "boj-aqua-sun", kb: true, cat: "sun", tag: "Fresh", tagClass: "rose", brand: BOJ, title: "Relief Sun Aqua-Fresh SPF 50+", size: "50 ml", price: 59,
      items: ["Watery, fast-absorbing finish", "SPF 50+ PA++++ daily protection", "Great for oily & combination skin"],
      desc: "The fresh, watery version of the Relief Sun — it sinks in quickly with a light, hydrating feel and no greasy finish. SPF 50+ PA++++ for everyday protection. 50 ml.",
      use: "Apply generously as the last skincare step in the morning. Reapply every 2 hours when outdoors.",
      art: tube(115, 14, 70, "#cdeee8", "#9fd6cf") },
    { id: "boj-glow-serum", kb: true, cat: "serum", tag: "Glow", tagClass: "rose", brand: BOJ, title: "Glow Serum: Propolis + Niacinamide", size: "30 ml", price: 65,
      items: ["Honey-glow propolis serum", "Niacinamide for a brighter look", "Soothing & lightweight"],
      desc: "A golden, honey-like serum with propolis extract and niacinamide that soothes, hydrates and leaves skin with a healthy, even-looking glow. 30 ml.",
      use: "After cleansing and toner, press 2–3 drops into the face and neck. Follow with moisturiser and, in the morning, sunscreen.",
      art: drop(116, 10, 68, "#fff4d6", "#e9a93a", "#e7c46a") },
    { id: "boj-dynasty", kb: true, cat: "cream", tag: "Rich care", tagClass: "rose", brand: BOJ, title: "Dynasty Cream", size: "50 ml", price: 79,
      items: ["Rich-yet-light moisturiser", "Inspired by traditional Korean ingredients like rice", "Soft, dewy glow"],
      desc: "A comforting, rich-yet-light moisturiser inspired by traditional Korean beauty — rice-based care that leaves skin soft, plump and dewy. 50 ml.",
      use: "As the last step of your skincare (before sunscreen in the morning), smooth a small amount over face and neck.",
      art: jar(66, 70, 168, "#f6efe4") },
    { id: "cosrx-snail", kb: true, cat: "cream", tag: "Cult favourite", tagClass: "rose", brand: "COSRX", title: "Advanced Snail 92 All in One Cream", size: "100 g", price: 75,
      items: ["92% snail secretion filtrate", "Hydrates & supports skin repair", "Gel-cream texture, all skin types"],
      desc: "A bestselling all-in-one gel cream with 92% snail secretion filtrate that hydrates, soothes and helps skin look smoother and healthier. 100 g.",
      use: "As the last step of your routine, apply an appropriate amount and pat gently until absorbed.",
      art: jar(66, 70, 168, "#3d3739") },
    { id: "boj-sun-duo", kb: true, cat: "set sun", tag: "Set", tagClass: "gold", brand: BOJ, title: "Sun Duo Set (2 × Relief Sun)", size: "2 × 50 ml", price: 109, parts: [["boj-rice-sun", 2]],
      items: ["Two Relief Sun Rice + Probiotics", "One for home, one for your bag", "SPF 50+ PA++++"],
      desc: "Two of the Relief Sun Rice + Probiotics SPF 50+ — keep one at home and one in your bag so you never miss a reapply.",
      use: "Apply generously as the last morning step and reapply every 2 hours outdoors.",
      art: tube(78, 20, 66, "#cfe0f3", "#a9c6e8") + tube(156, 20, 66, "#cfe0f3", "#a9c6e8") },
    { id: "boj-glow-set", kb: true, cat: "set", tag: "Gift set", tagClass: "gold", brand: BOJ, title: "Complete Glow Set (sun + serum + cream)", size: "Set of 3", price: 189,
      parts: [["boj-rice-sun", 1], ["boj-glow-serum", 1], ["boj-dynasty", 1]],
      items: ["Relief Sun SPF 50+", "Glow Serum: Propolis + Niacinamide", "Dynasty Cream"],
      desc: "A complete glow routine in one set — serum to brighten, cream to nourish and sunscreen to protect. A beautiful gift, too 🎁",
      use: "Morning: serum → cream → sunscreen. Evening: serum → cream.",
      art: tube(28, 30, 58, "#cfe0f3", "#a9c6e8") + drop(212, 54, 56, "#fff4d6", "#e9a93a", "#e7c46a") + jar(86, 116, 136, "#f6efe4") }
  ];
  // full names (used in the bag, checkout, invoices); savings for sets vs buying separately
  window.KB_PRODUCTS.forEach(p => {
    p.name = `${p.brand} ${p.title}`; p.short = p.title; p.was = null;
    if (p.parts) {
      const sep = p.parts.reduce((n, [id, q]) => n + q * window.KB_PRODUCTS.find(x => x.id === id).price, 0);
      p.save = sep - p.price;
    }
  });
})();

/* AnzGlow — branded invoice PDF. Works in the browser (window.jspdf) and in Node (require("jspdf")).
   buildInvoice(jsPDF, order, logo) -> jsPDF document
   order = { no, date, customer:{name,phone,email,address,area,city,note}, gift:{on,msg},
             items:[{name, detail, qty, price}], sub, ship, total } */
(function (root) {
  const SHOP = { name: "AnzGlow by Anzix", country: "United Arab Emirates", phone: "+971 56 665 0328", email: "info.anzglow@gmail.com", web: "anzglow.vercel.app" };
  // standard PDF fonts only cover Latin-1: swap common symbols, drop emoji / other scripts
  const clean = v => String(v == null ? "" : v)
    .replace(/[—–]/g, "-").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/…/g, "...")
    .replace(/[^\x20-\x7E -ÿ]/g, "").replace(/\s+/g, " ").trim();
  const aed = n => "AED " + Number(n || 0).toFixed(2);

  function buildInvoice(jsPDF, o, logo) {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = 210, M = 16;
    const ink = [59, 42, 53], body = [108, 88, 100], gold = [167, 124, 53], green = [27, 138, 50], line = [233, 214, 190];

    // header band
    doc.setFillColor(253, 236, 242); doc.rect(0, 0, W, 50, "F");
    doc.setFillColor(243, 234, 252); doc.rect(W * .55, 0, W * .45, 50, "F");
    doc.setDrawColor(...gold); doc.setLineWidth(.6); doc.line(0, 50, W, 50);
    if (logo && logo.data) {
      const lw = 52, lh = lw * logo.h / logo.w;
      try { doc.addImage(logo.data, "JPEG", M - 2, 25 - lh / 2, lw, lh); } catch (e) { /* logo optional */ }
    } else {
      doc.setFont("times", "bolditalic"); doc.setFontSize(26); doc.setTextColor(...gold); doc.text("AnzGlow", M, 28);
    }
    doc.setFont("times", "italic"); doc.setFontSize(30); doc.setTextColor(...ink); doc.text("Invoice", W - M, 24, { align: "right" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...body);
    doc.text(`No. ${clean(o.no)}`, W - M, 32, { align: "right" });
    doc.text(`Date: ${clean(o.date)}`, W - M, 37, { align: "right" });
    doc.text("Payment: Cash on delivery", W - M, 42, { align: "right" });

    // from / bill to
    let y = 62;
    const block = (x, title, lines) => {
      doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...gold); doc.text(title.toUpperCase(), x, y);
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(...ink);
      let yy = y + 6;
      lines.filter(Boolean).forEach((t, i) => {
        if (i === 0) doc.setFont("helvetica", "bold"); else doc.setFont("helvetica", "normal");
        doc.splitTextToSize(clean(t), 80).forEach(part => { doc.text(part, x, yy); yy += 5; });
      });
      return yy;
    };
    const c = o.customer || {};
    const y1 = block(M, "From", [SHOP.name, SHOP.country, `WhatsApp ${SHOP.phone}`, SHOP.email]);
    const y2 = block(W / 2 + 4, "Bill to", [c.name, c.phone, c.email, [c.address, c.area, c.city].filter(Boolean).join(", "), c.note ? `Note: ${c.note}` : ""]);
    y = Math.max(y1, y2) + 6;

    // items table
    const cols = [M, 120, 145, W - M];
    doc.setFillColor(246, 241, 253); doc.roundedRect(M, y, W - 2 * M, 10, 2, 2, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...ink);
    doc.text("ITEM", M + 4, y + 6.5); doc.text("QTY", cols[1], y + 6.5, { align: "center" });
    doc.text("PRICE", cols[2] + 12, y + 6.5, { align: "right" }); doc.text("AMOUNT", cols[3] - 4, y + 6.5, { align: "right" });
    y += 14;
    doc.setFontSize(10);
    (o.items || []).forEach((it, i) => {
      const name = doc.splitTextToSize(clean(it.name), 92);
      const h = Math.max(name.length * 5 + (it.detail ? 5 : 0), 8) + 4;
      if (i % 2 === 1) { doc.setFillColor(255, 250, 247); doc.rect(M, y - 4.5, W - 2 * M, h, "F"); }
      doc.setFont("helvetica", "bold"); doc.setTextColor(...ink);
      name.forEach((t, k) => doc.text(t, M + 4, y + k * 5));
      if (it.detail) { doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...body); doc.text(clean(it.detail), M + 4, y + name.length * 5); doc.setFontSize(10); }
      doc.setFont("helvetica", "normal"); doc.setTextColor(...ink);
      doc.text(String(it.qty), cols[1], y, { align: "center" });
      doc.text(aed(it.price), cols[2] + 12, y, { align: "right" });
      doc.text(aed(it.price * it.qty), cols[3] - 4, y, { align: "right" });
      y += h;
      doc.setDrawColor(...line); doc.setLineWidth(.2); doc.line(M, y - 4.5, W - M, y - 4.5);
    });

    // totals
    y += 4;
    const tx = 122;
    const row = (label, val, bold) => {
      doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setFontSize(bold ? 12 : 10); doc.setTextColor(...(bold ? green : body));
      doc.text(label, tx, y); doc.text(val, W - M - 4, y, { align: "right" }); y += bold ? 8 : 6;
    };
    row("Subtotal", aed(o.sub)); row("Delivery (all UAE)", aed(o.ship));
    doc.setDrawColor(...gold); doc.setLineWidth(.4); doc.line(tx, y - 2, W - M, y - 2); y += 4;
    row("Total due on delivery", aed(o.total), true);

    // gift note
    if (o.gift && o.gift.on) {
      y += 4;
      const msg = clean(o.gift.msg) || "Gift order";
      const lines = doc.splitTextToSize(`Gift note: "${msg}"`, W - 2 * M - 12);
      doc.setFillColor(253, 236, 242); doc.roundedRect(M, y, W - 2 * M, lines.length * 5 + 10, 3, 3, "F");
      doc.setFont("times", "italic"); doc.setFontSize(11); doc.setTextColor(...ink);
      lines.forEach((t, k) => doc.text(t, M + 6, y + 7 + k * 5));
      y += lines.length * 5 + 14;
    }

    // footer
    const fy = 270;
    doc.setDrawColor(...gold); doc.setLineWidth(.4); doc.line(M, fy, W - M, fy);
    doc.setFont("times", "italic"); doc.setFontSize(14); doc.setTextColor(...gold);
    doc.text("Thank you for glowing with AnzGlow", W / 2, fy + 8, { align: "center" });
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...body);
    doc.text(`Prices in AED. Pay cash when your order arrives. Questions? WhatsApp ${SHOP.phone} - ${SHOP.email} - ${SHOP.web}`, W / 2, fy + 14, { align: "center" });
    return doc;
  }

  // Server-side price list — never trust prices sent from the browser.
  const PRICES = { shampoo: 30, tan: 149, glow: 199 };
  const NAMES = { shampoo: "Mamaearth Rosemary Anti-Hair Fall Shampoo 250 ml", tan: "Tan Removal Combo Kit", glow: "Complete Glow Beauty Kit" };
  const SHADES = { "01": "Nude Pink", "02": "Rose Pink", "03": "Baby Pink", "04": "Peach Nude", "05": "Caramel Pink", "06": "Mauve Pink",
    "07": "Pink Berry", "08": "Cherry Pink", "09": "Brown Nude", "10": "Chocolate", "11": "Deep Rose", "12": "Classic Red" };
  const DELIVERY = 10;
  // cart = { "pinkkey:09": 2, "shampoo": 1 } -> priced items
  function priceCart(cart) {
    const items = [];
    Object.entries(cart || {}).forEach(([id, q]) => {
      const qty = Math.max(0, Math.min(50, parseInt(q, 10) || 0)); if (!qty) return;
      const [base, shade] = String(id).split(":");
      if (!(base in PRICES)) return;
      if (base === "pinkkey" && !SHADES[shade]) return;
      items.push({ id, name: NAMES[base], detail: base === "pinkkey" ? `Shade ${shade} - ${SHADES[shade]}` : "", qty, price: PRICES[base] });
    });
    const sub = items.reduce((n, i) => n + i.qty * i.price, 0);
    const ship = items.length ? DELIVERY : 0;
    return { items, sub, ship, total: sub + ship };
  }

  const api = { buildInvoice, priceCart, clean, SHOP };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ANZ_INVOICE = api;
})(typeof window !== "undefined" ? window : globalThis);

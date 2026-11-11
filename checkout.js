/* AnzGlow — checkout page (needs shades.js + common.js first). */
(() => {
  const { $, $$, bagLines, clearCart, artSvg, wa, mail, DELIVERY_FEE, toast, store } = window.AG;
  document.body.classList.add("is-checkout");

  const totals = lines => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const sub = lines.reduce((n, l) => n + l.qty * l.k.price, 0);
    return { count, sub, ship: count ? DELIVERY_FEE : 0, total: sub + (count ? DELIVERY_FEE : 0) };
  };

  const render = () => {
    if (!$("#coDone").hidden) return;
    const lines = bagLines(), t = totals(lines);
    $("#coMain").hidden = !lines.length;
    $("#coEmpty").hidden = !!lines.length;
    $("#coCount").textContent = t.count ? `· ${t.count} item${t.count > 1 ? "s" : ""}` : "";
    $("#coItems").innerHTML = lines.map(l => `
      <div class="co-item">
        <div class="co-thumb">${l.thumb ? `<img src="${l.thumb}" alt="">` : artSvg(l.k)}</div>
        <div class="co-info"><b>${l.k.short || l.k.name}</b>${l.shade ? `<small><i style="background:${l.shade.hex}"></i>${l.shade.no} ${l.shade.name}</small>` : `<small>${l.k.size || ""}</small>`}
          <span class="qty"><button type="button" data-dec="${l.id}" aria-label="Less">−</button>${l.qty}<button type="button" data-inc="${l.id}" aria-label="More">+</button></span></div>
        <span class="co-price">AED ${l.k.price * l.qty}</span>
      </div>`).join("");
    $("#coSub").textContent = "AED " + t.sub;
    $("#coShip").textContent = "AED " + t.ship;
    $("#coTotal").textContent = "AED " + t.total;
    $("#coSubmit").innerHTML = `Place order · AED ${t.total} <svg><use href="#i-arrow"/></svg>`;
  };
  document.addEventListener("cart:change", render);
  render();

  // gift note toggle
  $("#cGift").addEventListener("change", e => { $("#cGiftWrap").hidden = !e.target.checked; if (e.target.checked) $("#cGiftMsg").focus(); });

  // remember details for next time (this browser only)
  const saved = store.get("anz-buyer", {});
  ["cName", "cPhone", "cEmail", "cCity", "cArea", "cAddr"].forEach(id => { if (saved[id]) $("#" + id).value = saved[id]; });

  $("#coForm").addEventListener("submit", e => {
    e.preventDefault();
    const v = id => $("#" + id).value.trim();
    const need = [["cName", "your name"], ["cPhone", "your mobile number"], ["cArea", "your area"], ["cAddr", "your building / flat"]];
    for (const [id, what] of need) {
      if (!v(id)) { $("#" + id).focus(); $("#" + id).closest(".field").classList.add("err"); toast(`Please add ${what}`); return; }
      $("#" + id).closest(".field").classList.remove("err");
    }
    if (v("cPhone").replace(/\D/g, "").length < 9) { $("#cPhone").focus(); toast("Please check your mobile number"); return; }
    const lines = bagLines(); if (!lines.length) { toast("Your bag is empty"); return; }
    const t = totals(lines);
    const no = "AG-" + Date.now().toString(36).slice(-5).toUpperCase();
    const gift = $("#cGift").checked;
    const text = [
      `New AnzGlow order ${no} 🎀`,
      ...lines.map(l => `• ${l.qty} × ${l.label} — AED ${l.k.price * l.qty}`),
      `Subtotal: AED ${t.sub}`, `Delivery: AED ${t.ship}`, `Total: AED ${t.total} (cash on delivery)`, ``,
      `Name: ${v("cName")}`, `Phone: ${v("cPhone")}`, v("cEmail") ? `Email: ${v("cEmail")}` : null,
      `Address: ${v("cAddr")}, ${v("cArea")}, ${v("cCity")}`, v("cNote") ? `Note: ${v("cNote")}` : null,
      gift ? `🎁 Gift order${v("cGiftMsg") ? ` — note: "${v("cGiftMsg")}"` : ""}` : null
    ].filter(x => x !== null).join("\n");

    store.set("anz-buyer", { cName: v("cName"), cPhone: v("cPhone"), cEmail: v("cEmail"), cCity: v("cCity"), cArea: v("cArea"), cAddr: v("cAddr") });

    // success screen
    $("#doneName").textContent = v("cName").split(" ")[0] || "lovely";
    $("#doneNo").textContent = no;
    $("#doneSum").innerHTML = lines.map(l => `<span>${l.qty} × ${l.k.short || l.k.name}${l.shade ? " · " + l.shade.no : ""}</span>`).join("") + `<b>Total AED ${t.total} · cash on delivery</b>`;
    $("#doneWa").href = wa(text);
    $("#doneMail").href = mail(`New order ${no}`, text);
    $("#coMain").hidden = true; $("#coEmpty").hidden = true; $("#coDone").hidden = false;
    $$(".co-steps li").forEach(li => li.classList.add("done"));
    scrollTo({ top: 0, behavior: "smooth" });
    window.open(wa(text), "_blank", "noopener");

    // ---------- Invoice PDF ----------
    const cartNow = { ...store.get("anz-cart", {}) };
    const customer = { name: v("cName"), phone: v("cPhone"), email: v("cEmail"), address: v("cAddr"), area: v("cArea"), city: v("cCity"), note: v("cNote") };
    const giftInfo = { on: gift, msg: v("cGiftMsg") };
    $("#invNo").textContent = no;
    try {
      const INV = window.ANZ_INVOICE, priced = INV.priceCart(cartNow);
      const order = { no, date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), customer, gift: giftInfo, ...priced };
      const doc = INV.buildInvoice(window.jspdf.jsPDF, order, window.ANZ_LOGO);
      const blob = doc.output("blob"), fname = `AnzGlow-invoice-${no}.pdf`;
      $("#invDownload").href = URL.createObjectURL(blob); $("#invDownload").download = fname;
      const file = new File([blob], fname, { type: "application/pdf" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        $("#invShare").hidden = false;
        $("#invShare").onclick = () => navigator.share({ files: [file], title: `AnzGlow invoice ${no}`, text: `My AnzGlow order ${no}` }).catch(() => {});
      }
      $("#invStatus").textContent = "Ready to download.";
    } catch (err) { $("#invStatus").textContent = "We'll send your invoice on WhatsApp."; }

    // email the invoice (to us, and to the customer if they gave an email)
    fetch("/api/order", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ no, customer, gift: giftInfo, cart: cartNow, website: $("#cWebsite").value }) })
      .then(r => r.json().catch(() => ({})).then(j => ({ ok: r.ok, j })))
      .then(({ ok, j }) => {
        if (ok && j.ok) $("#invStatus").textContent = j.emailedCustomer ? `Emailed to ${customer.email} 💌 — and ready to download.` : "Ready to download. Add your email next time to get it by mail too.";
      })
      .catch(() => {});
    clearCart();
  });
})();

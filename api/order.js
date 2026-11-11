/* Vercel serverless function: POST /api/order
   Re-prices the order on the server, builds the invoice PDF and emails it to the shop
   (always) and to the customer (if they gave an email).
   Needs Vercel environment variables:
     GMAIL_USER          = info.anzglow@gmail.com
     GMAIL_APP_PASSWORD  = a Google "App password" for that account (not the normal password)
   Optional: SHOP_EMAIL (where order copies go; defaults to GMAIL_USER). */
const { jsPDF } = require("jspdf");
const nodemailer = require("nodemailer");
const { buildInvoice, priceCart, clean, SHOP } = require("../invoice.js");
const logo = require("../invoice-logo.js");

const hits = new Map(); // simple per-instance rate limit
const esc = s => clean(s).replace(/[<>&"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));
const okEmail = e => /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i.test(e || "");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST only" });
  const user = process.env.GMAIL_USER, pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return res.status(503).json({ ok: false, error: "email-not-configured" });

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0] || "x";
  const now = Date.now(), recent = (hits.get(ip) || []).filter(t => now - t < 10 * 60e3);
  if (recent.length >= 5) return res.status(429).json({ ok: false, error: "too-many-orders" });
  hits.set(ip, [...recent, now]);

  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = {}; } }
  b = b || {};
  if (b.website) return res.status(200).json({ ok: true }); // honeypot: silently ignore bots

  const c = b.customer || {};
  const customer = {
    name: clean(c.name).slice(0, 80), phone: clean(c.phone).slice(0, 20), email: okEmail(c.email) ? String(c.email).trim() : "",
    address: clean(c.address).slice(0, 160), area: clean(c.area).slice(0, 80), city: clean(c.city).slice(0, 40), note: clean(c.note).slice(0, 160)
  };
  if (customer.name.length < 2 || customer.phone.replace(/\D/g, "").length < 9 || !customer.address || !customer.area)
    return res.status(400).json({ ok: false, error: "missing-details" });

  const priced = priceCart(b.cart);
  if (!priced.items.length) return res.status(400).json({ ok: false, error: "empty-order" });

  const no = /^AG-[A-Z0-9]{4,8}$/.test(b.no || "") ? b.no : "AG-" + now.toString(36).slice(-5).toUpperCase();
  const order = {
    no, date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Dubai" }),
    customer, gift: { on: !!(b.gift && b.gift.on), msg: clean(b.gift && b.gift.msg).slice(0, 140) }, ...priced
  };

  const pdf = Buffer.from(buildInvoice(jsPDF, order, logo).output("arraybuffer"));
  const rows = order.items.map(i => `<tr><td style="padding:6px 0">${esc(i.name)}${i.detail ? `<br><small style="color:#8a7380">${esc(i.detail)}</small>` : ""}</td><td align="center">${i.qty}</td><td align="right">AED ${(i.qty * i.price).toFixed(2)}</td></tr>`).join("");
  const html = who => `<div style="font-family:Arial,sans-serif;color:#3b2a35;max-width:560px">
    <h2 style="font-family:Georgia,serif;font-style:italic;color:#a77c35;margin:0 0 6px">AnzGlow</h2>
    <p>${who === "shop" ? `New order <b>${no}</b> from <b>${esc(customer.name)}</b> (${esc(customer.phone)}).` : `Hi ${esc(customer.name.split(" ")[0])}, thank you for your order <b>${no}</b>! Your invoice is attached. We'll confirm on WhatsApp and deliver in 1-2 working days.`}</p>
    <table width="100%" style="border-collapse:collapse;font-size:14px">${rows}
      <tr><td colspan="3" style="border-top:1px solid #e9d6be;padding-top:8px"></td></tr>
      <tr><td>Delivery</td><td></td><td align="right">AED ${order.ship.toFixed(2)}</td></tr>
      <tr><td><b>Total (cash on delivery)</b></td><td></td><td align="right"><b style="color:#1b8a32">AED ${order.total.toFixed(2)}</b></td></tr></table>
    <p style="font-size:13px;color:#6c5864">Deliver to: ${esc([customer.address, customer.area, customer.city].join(", "))}${customer.note ? `<br>Note: ${esc(customer.note)}` : ""}${order.gift.on ? `<br>Gift order${order.gift.msg ? ` - note: "${esc(order.gift.msg)}"` : ""}` : ""}</p>
    <p style="font-size:12px;color:#9a8791">${SHOP.name} · WhatsApp ${SHOP.phone} · ${SHOP.email}</p></div>`;

  const mail = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  const attachments = [{ filename: `AnzGlow-invoice-${no}.pdf`, content: pdf, contentType: "application/pdf" }];
  try {
    await mail.sendMail({ from: `"AnzGlow Orders" <${user}>`, to: process.env.SHOP_EMAIL || user, replyTo: customer.email || undefined,
      subject: `New order ${no} - AED ${order.total} - ${customer.name}`, html: html("shop"), attachments });
    let emailedCustomer = false;
    if (customer.email) {
      await mail.sendMail({ from: `"AnzGlow" <${user}>`, to: customer.email, replyTo: user,
        subject: `Your AnzGlow invoice ${no}`, html: html("customer"), attachments });
      emailedCustomer = true;
    }
    return res.status(200).json({ ok: true, no, total: order.total, emailedCustomer });
  } catch (e) {
    console.error("order mail failed", e && e.message);
    return res.status(502).json({ ok: false, error: "mail-failed" });
  }
};

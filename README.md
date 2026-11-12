# AnzGlow

AnzGlow by Anzix — premium beauty website (static HTML/CSS/JS, no build step).

- `index.html` — home page (`app.js`)
- `shades.js` — old lipstick shade data, no longer shown (kept so old saved carts are cleaned up safely)
- `common.js` — shared bag, WhatsApp checkout, menu, policies
- `styles.css` + `theme.css` — design (theme.css = soft charcoal colours)

The header and footer markup is repeated in both HTML pages — change both when editing them.

Deploy: Vercel, framework preset "Other", no build command.

## Orders, invoices and email

- `checkout.html` + `checkout.js` — checkout page. On "Place order" it opens WhatsApp with the order,
  builds an invoice PDF in the browser (`invoice.js`, `invoice-logo.js`, jsPDF from cdnjs) for the
  customer to download / share, and POSTs the order to `/api/order`.
- `api/order.js` — Vercel serverless function. Re-prices the order on the server (prices live in
  `invoice.js` → `priceCart`; keep them in sync with `common.js` / `shades.js`), builds the same PDF and
  emails it to the shop and to the customer (if they gave an email).
- Email needs two Vercel environment variables (Project → Settings → Environment Variables), then redeploy:
  - `GMAIL_USER` = info.anzglow@gmail.com
  - `GMAIL_APP_PASSWORD` = a Google App Password for that account (Google Account → Security → 2-Step
    Verification on → App passwords). Never commit it.
  - optional `SHOP_EMAIL` = where order copies go (defaults to GMAIL_USER).
  Without them the function returns 503 and checkout still works (download + WhatsApp only).

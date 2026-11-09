/* AnzGlow — "Glow in motion" reels + full-screen story viewer (home page). */
(() => {
  const { $, $$, KITS, priceHtml, wa } = window.AG;
  const stack = $("#reelStack"); if (!stack) return;

  const REELS = [
    { src: "assets/reels/reel-glow.mp4",  poster: "assets/reels/reel-glow.jpg",  title: "The Dubai glow",
      caption: "Golden hour, silk robe, one rich cream — your evening glow ritual.", product: "tan" },
    { src: "assets/reels/reel-serum.mp4", poster: "assets/reels/reel-serum.jpg", title: "Morning serum",
      caption: "Cleanse, then press in a few drops of serum for fresh, dewy skin.", product: "glow" },
    { src: "assets/reels/reel-hair.mp4",  poster: "assets/reels/reel-hair.jpg",  title: "Rosemary hair ritual",
      caption: "Rosemary for stronger, shinier hair — wash, massage, rinse, glow.", product: "shampoo" }
  ];

  // ---------- Cards: play silently only while the section is on screen ----------
  const cards = $$(".reel", stack);
  const vids = cards.map(c => $("video", c));
  const load = v => { if (!v.src) { v.src = v.dataset.src; } };
  const io = new IntersectionObserver(([en]) => {
    vids.forEach(v => {
      if (en.isIntersecting) { load(v); v.play().catch(() => {}); }
      else v.pause();
    });
  }, { threshold: .25 });
  io.observe(stack);

  // hovering a side card brings it to the front (desktop)
  cards.forEach(c => c.addEventListener("pointerenter", () => {
    cards.forEach(x => x.classList.toggle("lift", x === c));
  }));
  stack.addEventListener("pointerleave", () => cards.forEach(x => x.classList.remove("lift")));
  $$("#reelIndex button").forEach((b, i) => {
    b.addEventListener("pointerenter", () => cards.forEach((x, j) => x.classList.toggle("lift", j === i)));
    b.addEventListener("pointerleave", () => cards.forEach(x => x.classList.remove("lift")));
  });

  // ---------- Story viewer ----------
  const viewer = $("#reelViewer"), video = $("#svVideo"), bars = $$("#svBars b");
  let idx = 0, muted = false, holdTimer = null, held = false;

  const soundIcon = () => $("#svSoundIcon").setAttribute("d", muted
    ? "M4 9v6h4l5 4V5L8 9H4zm12.5 3 2.5 2.5-1 1-2.5-2.5-2.5 2.5-1-1 2.5-2.5-2.5-2.5 1-1 2.5 2.5 2.5-2.5 1 1z"
    : "M4 9v6h4l5 4V5L8 9H4zm11.5 3a3.5 3.5 0 0 0-2-3.2v6.4a3.5 3.5 0 0 0 2-3.2zM13.5 4.2v2.1a6 6 0 0 1 0 11.4v2.1a8 8 0 0 0 0-15.6z");

  const renderShop = r => {
    const k = KITS.find(x => x.id === r.product);
    $("#svShop").innerHTML = `
      <img src="${k.img || r.poster}" alt="">
      <span><small>Shop the look</small><b>${k.short || k.name}</b><em>${priceHtml(k)}</em></span>
      <button class="btn btn-buy btn-sm" data-add="${k.id}">Add to cart</button>
      <a class="sv-wa" href="${wa(`Hi AnzGlow, I saw the "${r.title}" video and I'd like to ask about ${k.name}.`)}" target="_blank" rel="noopener" aria-label="Ask on WhatsApp"><svg><use href="#i-wa"/></svg></a>`;
  };

  const show = n => {
    if (n < 0) n = 0;
    if (n >= REELS.length) return close();
    idx = n; const r = REELS[n];
    bars.forEach((b, i) => b.style.width = i < n ? "100%" : "0%");
    video.src = r.src; video.poster = r.poster; video.muted = muted;
    video.currentTime = 0; video.play().catch(() => { muted = true; video.muted = true; soundIcon(); video.play().catch(() => {}); });
    $("#svTitle").textContent = r.title;
    $("#svCaption").textContent = r.caption;
    renderShop(r);
  };
  const open = n => {
    vids.forEach(v => v.pause());
    viewer.classList.add("open"); document.body.classList.add("modal-open");
    soundIcon(); show(n);
  };
  const close = () => {
    viewer.classList.remove("open"); document.body.classList.remove("modal-open");
    video.pause(); video.removeAttribute("src"); video.load();
    vids.forEach(v => v.play().catch(() => {}));
  };

  video.addEventListener("timeupdate", () => {
    if (video.duration) bars[idx].style.width = (video.currentTime / video.duration * 100) + "%";
  });
  video.addEventListener("ended", () => show(idx + 1));

  document.addEventListener("click", e => { const o = e.target.closest("[data-open]"); if (o) open(+o.dataset.open); });
  $("#svClose").onclick = close;
  $("#svSound").onclick = () => { muted = !muted; video.muted = muted; soundIcon(); };
  // tap left/right = previous/next; press and hold = pause
  ["svPrev", "svNext"].forEach(id => {
    const z = $("#" + id);
    z.addEventListener("pointerdown", () => { held = false; holdTimer = setTimeout(() => { held = true; video.pause(); }, 220); });
    z.addEventListener("pointerup", () => {
      clearTimeout(holdTimer);
      if (held) { video.play().catch(() => {}); return; }
      show(idx + (id === "svNext" ? 1 : -1));
    });
  });
  viewer.addEventListener("click", e => { if (e.target === viewer) close(); });
  document.addEventListener("keydown", e => {
    if (!viewer.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") show(idx + 1);
    if (e.key === "ArrowLeft") show(idx - 1);
  });
  // swipe down to close on phones
  let y0 = null;
  viewer.addEventListener("touchstart", e => { y0 = e.touches[0].clientY; }, { passive: true });
  viewer.addEventListener("touchend", e => { if (y0 !== null && e.changedTouches[0].clientY - y0 > 90) close(); y0 = null; }, { passive: true });
})();

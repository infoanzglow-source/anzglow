/* AnzGlow — hero video playlist: clips play one after another with a cross-fade,
   chapter tabs show progress, and the matching product card lights up. */
(() => {
  const A = document.getElementById("edVidA"), B = document.getElementById("edVidB");
  if (!A || !B) return;
  const CLIPS = [
    { src: "assets/reels/reel-glow.mp4",    poster: "assets/editorial/ed-smile.jpg" },
    { src: "assets/reels/reel-cleanse.mp4", poster: "assets/reels/reel-cleanse.jpg" },
    { src: "assets/reels/reel-wash.mp4",    poster: "assets/reels/reel-wash.jpg" }
  ];
  const tabs = [...document.querySelectorAll("#edChapters button")];
  const picks = [...document.querySelectorAll(".ed-pick[data-ch]")];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let idx = 0, cur = A, next = B;

  const mark = n => {
    tabs.forEach((t, i) => { t.classList.toggle("on", i === n); t.classList.toggle("done", i < n); t.querySelector("em").style.width = i < n ? "100%" : "0%"; });
    picks.forEach(p => p.classList.toggle("lit", +p.dataset.ch === n));
    // phones: slide the playing product card into view (sideways only, page doesn't jump)
    const lit = picks.find(p => +p.dataset.ch === n), row = lit && lit.parentElement;
    if (row && row.scrollWidth > row.clientWidth) row.scrollTo({ left: Math.max(0, lit.offsetLeft - 16), behavior: "smooth" });
  };
  const go = n => {
    n = (n + CLIPS.length) % CLIPS.length;
    if (n === idx && cur.src) { cur.currentTime = 0; cur.play().catch(() => {}); mark(n); return; }
    idx = n;
    next.poster = CLIPS[n].poster; next.src = CLIPS[n].src; next.muted = true;
    next.currentTime = 0;
    const swap = () => {
      next.classList.add("on"); cur.classList.remove("on");
      const old = cur; cur = next; next = old;
      setTimeout(() => old.pause(), 700);
    };
    next.play().then(swap).catch(swap);
    mark(n);
  };

  [A, B].forEach(v => {
    v.addEventListener("timeupdate", () => {
      if (v !== cur || !v.duration) return;
      tabs[idx].querySelector("em").style.width = (v.currentTime / v.duration * 100) + "%";
    });
    v.addEventListener("ended", () => { if (v === cur) go(idx + 1); });
  });
  if (reduce) { A.loop = true; mark(0); }   // no auto-advance for reduced motion
  tabs.forEach((t, i) => t.addEventListener("click", () => go(i)));

  // only play while the hero is on screen
  new IntersectionObserver(([en]) => {
    if (en.isIntersecting) cur.play().catch(() => {}); else cur.pause();
  }, { threshold: .15 }).observe(A.closest(".ed-main"));

  // Preload the next clip quietly after the first one starts
  A.addEventListener("playing", () => { const l = document.createElement("link"); l.rel = "prefetch"; l.href = CLIPS[1].src; document.head.appendChild(l); }, { once: true });
  mark(0);
})();

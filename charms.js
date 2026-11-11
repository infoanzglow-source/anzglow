/* AnzGlow — cute floating charms (gifts, bows, hearts, sparkles, bubbles) in the page margins. */
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const layer = document.createElement("div");
  layer.className = "charms"; layer.setAttribute("aria-hidden", "true");
  const EMOJI = ["🎀", "💖", "✨", "🌸", "🎁", "💄", "💕", "🫧", "⭐", "🌷", "💅", "🎀"];
  const SHAPES = ["c-heart", "c-star", "c-bubble", "c-ring", "c-gift"];
  const small = matchMedia("(max-width: 640px)").matches;
  const N = small ? 8 : 18;
  for (let i = 0; i < N; i++) {
    const el = document.createElement("span");
    const useShape = i % 3 === 2;
    el.className = "charm " + (useShape ? SHAPES[i % SHAPES.length] : "c-emoji");
    if (!useShape) el.textContent = EMOJI[i % EMOJI.length];
    // keep charms in the side margins so they rarely sit on text
    const left = i % 2 === 0;
    const x = left ? Math.random() * (small ? 6 : 7) : 100 - Math.random() * (small ? 6 : 7) - 3;
    const y = (i / N) * 100 + Math.random() * (100 / N);
    const size = (small ? 14 : 18) + Math.random() * (small ? 8 : 16);
    el.style.cssText = `left:${x}%;top:${y}%;--s:${size}px;--d:${8 + Math.random() * 9}s;--delay:${-Math.random() * 10}s;--r:${(Math.random() * 40 - 20).toFixed(0)}deg;--o:${(small ? .45 : .6) + Math.random() * .3}`;
    layer.appendChild(el);
  }
  document.body.appendChild(layer);
  // gentle parallax while scrolling
  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => { layer.style.setProperty("--py", (scrollY * -0.04).toFixed(1) + "px"); ticking = false; });
  }, { passive: true });
})();

/* AnzGlow — show every product inside a cute cream jar with a gold dome lid and a diamond on top.
   Tap the lid/cap: it pops up with a sparkle burst and a "View details" bubble appears. */
(() => {
  const GIFT_IDS = new Set(["tan", "glow"]);
  const isGift = card => GIFT_IDS.has(card.dataset.id) || (card.dataset.cat || "").split(" ").includes("set");

  const GEM = `<svg viewBox="0 0 64 56" aria-hidden="true">
    <defs><linearGradient id="vgGold" x1="0" x2="1"><stop offset="0" stop-color="#a77c35"/><stop offset=".45" stop-color="#f3d999"/><stop offset=".7" stop-color="#d4a24c"/><stop offset="1" stop-color="#8a5d1f"/></linearGradient>
      <linearGradient id="vgIce" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#e8f1fb"/><stop offset="1" stop-color="#cfe0f3"/></linearGradient></defs>
    <path d="M14 4h36l12 14-30 26L2 18z" fill="url(#vgIce)" stroke="url(#vgGold)" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M2 18h60M22 4l-6 14 16 26 16-26-6-14M16 18l16-14 16 14" fill="none" stroke="url(#vgGold)" stroke-width="1.6" stroke-linejoin="round"/>
    <rect x="20" y="42" width="24" height="12" rx="3" fill="url(#vgGold)"/>
    <path d="M52 6l1.4 3.2 3.2 1.4-3.2 1.4L52 15.2l-1.4-3.2-3.2-1.4 3.2-1.4z" fill="#fff"/></svg>`;
  const BOW = `<svg viewBox="0 0 90 46" aria-hidden="true">
    <defs><linearGradient id="vgRib" x1="0" x2="1"><stop offset="0" stop-color="#d9668f"/><stop offset=".5" stop-color="#f7b9cf"/><stop offset="1" stop-color="#c94f7c"/></linearGradient></defs>
    <path d="M45 30 C30 8 6 6 8 22 C10 36 32 34 45 30Z" fill="url(#vgRib)"/>
    <path d="M45 30 C60 8 84 6 82 22 C80 36 58 34 45 30Z" fill="url(#vgRib)"/>
    <path d="M40 31 L30 46 L38 44 L42 34Z M50 31 L60 46 L52 44 L48 34Z" fill="#c94f7c"/>
    <circle cx="45" cy="30" r="7" fill="#e48aa9" stroke="#fff" stroke-width="1.5"/>
    <path d="M18 18 Q22 14 28 16" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/></svg>`;
  const BURST = ["✨", "💖", "🎀", "✨", "🌸", "⭐"].map((e, i) => `<i style="--a:${i * 60}deg">${e}</i>`).join("");

  const enhance = root => {
    root.querySelectorAll(".kit:not(.has-vessel)").forEach(card => {
      const stage = card.querySelector(".kit-stage"); if (!stage) return;
      const gift = isGift(card);
      const v = document.createElement("div");
      v.className = "vessel v-jar" + (gift ? " is-set" : "");
      stage.parentNode.insertBefore(v, stage);
      const lid = document.createElement("button");
      lid.type = "button"; lid.className = "lid";
      lid.setAttribute("aria-expanded", "false");
      lid.setAttribute("aria-label", "Open the jar");
      lid.innerHTML = `<span class="lid-dome"></span>${GEM}`;
      v.append(lid, stage);
      const burst = document.createElement("span"); burst.className = "v-burst"; burst.setAttribute("aria-hidden", "true"); burst.innerHTML = BURST;
      const peek = document.createElement("button"); peek.type = "button"; peek.className = "v-peek";
      peek.dataset.qv = stage.dataset.qv || ""; peek.textContent = "✨ View details";
      v.append(burst, peek);
      // tags sit on the vessel instead of the card corner
      card.querySelectorAll(":scope > .tag, :scope > .sale-tag").forEach(t => v.appendChild(t));
      if (!peek.dataset.qv) { // Pink-Key-style links: follow the stage link instead
        peek.removeAttribute("data-qv"); peek.onclick = () => stage.click();
      }
      lid.addEventListener("click", e => {
        e.stopPropagation();
        const open = !v.classList.contains("open");
        v.classList.toggle("open", open); lid.setAttribute("aria-expanded", open);
        if (open) { v.classList.remove("pop"); void v.offsetWidth; v.classList.add("pop"); }
      });
      card.classList.add("has-vessel");
    });
  };
  ["#kitGrid", "#kbGrid"].forEach(sel => { const g = document.querySelector(sel); if (g) enhance(g); });
  // close other open lids when one opens (keeps the grid tidy)
  document.addEventListener("click", e => {
    const lid = e.target.closest(".lid"); if (!lid) return;
    document.querySelectorAll(".vessel.open").forEach(v => { if (!v.contains(lid)) { v.classList.remove("open"); v.querySelector(".lid").setAttribute("aria-expanded", "false"); } });
  });
})();

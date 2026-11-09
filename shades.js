/* Pink Key Liquid Lipstick — 12 matte shades (shared by the home page and the product page). */
window.PK = {
  id: "pinkkey",
  name: "Pink Key Liquid Lipstick",
  price: 10,
  was: 15,          // crossed-out "sale" price (placeholder — set null to hide)
  heroShade: "09",  // light-brown matte that suits every skin tone
  heroNote: "Our light-brown matte — the one shade that flatters every skin tone, from fair to deep.",
  shades: [
    { no: "01", name: "Nude Pink",    hex: "#e98a95", family: "Pinks" },
    { no: "02", name: "Rose Pink",    hex: "#e2607a", family: "Pinks" },
    { no: "03", name: "Baby Pink",    hex: "#ec7887", family: "Pinks" },
    { no: "04", name: "Peach Nude",   hex: "#dc7a6c", family: "Nudes & browns" },
    { no: "05", name: "Caramel Pink", hex: "#cf5c58", family: "Nudes & browns" },
    { no: "06", name: "Mauve Pink",   hex: "#bf6274", family: "Pinks" },
    { no: "07", name: "Pink Berry",   hex: "#ae3552", family: "Pinks" },
    { no: "08", name: "Cherry Pink",  hex: "#b42746", family: "Pinks" },
    { no: "09", name: "Brown Nude",   hex: "#a5493f", family: "Nudes & browns", hero: true },
    { no: "10", name: "Chocolate",    hex: "#8e3a37", family: "Nudes & browns" },
    { no: "11", name: "Deep Rose",    hex: "#8e1524", family: "Reds" },
    { no: "12", name: "Classic Red",  hex: "#a30716", family: "Reds" }
  ],
  // Suggested shades per skin tone (a starting point — every shade can be worn by anyone).
  skin: [
    { tone: "Fair",   hint: "Light pink",      picks: ["01", "03"], dot: "#f3d6c6" },
    { tone: "Medium", hint: "Rosy brown",      picks: ["02", "06"], dot: "#e0b393" },
    { tone: "Olive",  hint: "Warm brown",      picks: ["04", "09"], dot: "#c9976b" },
    { tone: "Tan",    hint: "Caramel pink",    picks: ["05", "07"], dot: "#b57d55" },
    { tone: "Deep",   hint: "Chocolate brown", picks: ["10", "08"], dot: "#8a5a3b" },
    { tone: "Dark",   hint: "Deep mauve",      picks: ["11", "12"], dot: "#5e3a28" }
  ],
  img: no => `assets/pinkkey/shade-${no}.jpg`,
  find: no => window.PK.shades.find(s => s.no === no)
};

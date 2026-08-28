(function () {
  "use strict";

  const root = document.documentElement;
  const themeToggle = document.querySelector(".theme-toggle");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finishCodes = { gloss: 0, matte: 1, jelly: 2, chrome: 3, pearl: 4, glitter: 5, "cat-eye": 6 };
  const designs = [
    { id: "studio-rouge", name: "Studio Rouge", style: "solid", finish: "gloss", motif: "tonal", palette: ["#7c1725", "#a51f32", "#c33549"] },
    { id: "ink-after-dark", name: "Ink After Dark", style: "solid", finish: "matte", motif: "tonal", palette: ["#11151d", "#242b37", "#394152"] },
    { id: "cloud-milk", name: "Cloud Milk", style: "solid", finish: "jelly", motif: "sheer", palette: ["#f5eee8", "#eaded8", "#fffaf4"] },
    { id: "gilded-moss", name: "Gilded Moss", style: "solid", finish: "chrome", motif: "tonal", palette: ["#536348", "#788661", "#b0a36a"] },
    { id: "oyster-veil", name: "Oyster Veil", style: "solid", finish: "pearl", motif: "sheer", palette: ["#e9ded4", "#d9d5df", "#f3e9d8"] },
    { id: "blue-hour", name: "Blue Hour", style: "solid", finish: "gloss", motif: "tonal", palette: ["#283d69", "#445e90", "#7687ae"] },
    { id: "clay-study", name: "Clay Study", style: "solid", finish: "matte", motif: "tonal", palette: ["#914c3c", "#bd735a", "#d89d7d"] },
    { id: "rosewater", name: "Rosewater", style: "solid", finish: "jelly", motif: "sheer", palette: ["#d67480", "#e8a5a8", "#f5cac5"] },
    { id: "silver-line", name: "Silver Line", style: "solid", finish: "cat-eye", motif: "tonal", palette: ["#5d6671", "#9da6af", "#dce0e2"] },
    { id: "sugarplum", name: "Sugarplum", style: "solid", finish: "glitter", motif: "tonal", palette: ["#6e315f", "#9d568a", "#d69bc5"] },
    { id: "carmine-french", name: "Carmine French", style: "classic", finish: "gloss", motif: "french", palette: ["#edc9b8", "#a9192e", "#f7e4d9"] },
    { id: "espresso-tips", name: "Espresso Tips", style: "classic", finish: "matte", motif: "french", palette: ["#c9977e", "#3b241f", "#e0b4a0"] },
    { id: "barely-there", name: "Barely There", style: "classic", finish: "jelly", motif: "french", palette: ["#f2d8ca", "#fff8ee", "#dcae9e"] },
    { id: "moonlit-half", name: "Moonlit Half-Moon", style: "classic", finish: "cat-eye", motif: "half-moon", palette: ["#1e2948", "#d7d4c8", "#737da0"] },
    { id: "tortoise-veil", name: "Tortoise Veil", style: "classic", finish: "jelly", motif: "tortoise", palette: ["#c17932", "#50291e", "#e6af54"] },
    { id: "ballet-ribbon", name: "Ballet Ribbon", style: "classic", finish: "pearl", motif: "french", palette: ["#e8c9c8", "#f9ece8", "#b8868c"] },
    { id: "velvet-bordeaux", name: "Velvet Bordeaux", style: "classic", finish: "matte", motif: "ombre", palette: ["#2d1720", "#721f37", "#bb5365"] },
    { id: "champagne-cuticle", name: "Champagne Cuticle", style: "classic", finish: "glitter", motif: "half-moon", palette: ["#b98a58", "#f0d3a5", "#fff2dc"] },
    { id: "modern-noir", name: "Modern Noir", style: "classic", finish: "gloss", motif: "french", palette: ["#d8a897", "#171719", "#f4d8cc"] },
    { id: "copper-outline", name: "Copper Outline", style: "classic", finish: "chrome", motif: "outline", palette: ["#412b2a", "#b7694d", "#e6a078"] },
    { id: "tidepool", name: "Tidepool", style: "artistic", finish: "chrome", motif: "wave", palette: ["#174b55", "#39939a", "#a8d7cf"] },
    { id: "mineral-bloom", name: "Mineral Bloom", style: "artistic", finish: "pearl", motif: "marble", palette: ["#c8b7bd", "#8f7485", "#f2e7df"] },
    { id: "bauhaus-garden", name: "Bauhaus Garden", style: "artistic", finish: "matte", motif: "geometric", palette: ["#d9a027", "#2f674e", "#b94c3d"] },
    { id: "solar-flare", name: "Solar Flare", style: "artistic", finish: "cat-eye", motif: "rays", palette: ["#7d241d", "#ed7f2c", "#ffd578"] },
    { id: "midnight-orbit", name: "Midnight Orbit", style: "artistic", finish: "glitter", motif: "celestial", palette: ["#141934", "#5260a0", "#ddd4ac"] },
    { id: "matcha-current", name: "Matcha Current", style: "artistic", finish: "gloss", motif: "wave", palette: ["#4f683c", "#a6b66f", "#e9e2b8"] },
    { id: "terracotta-grid", name: "Terracotta Grid", style: "artistic", finish: "matte", motif: "grid", palette: ["#b25d43", "#e1a076", "#553c35"] },
    { id: "koi-pond", name: "Koi Pond", style: "artistic", finish: "jelly", motif: "blobs", palette: ["#b7d8d4", "#e9694f", "#f2c469"] },
    { id: "aurora-thread", name: "Aurora Thread", style: "artistic", finish: "cat-eye", motif: "wave", palette: ["#172a36", "#4eb3a6", "#a579bc"] },
    { id: "confetti-press", name: "Confetti Press", style: "artistic", finish: "glitter", motif: "confetti", palette: ["#f1d9c8", "#dc536c", "#456f9b", "#d7ad41"] },
    { id: "porcelain-vine", name: "Porcelain Vine", style: "artistic", finish: "pearl", motif: "floral", palette: ["#f4ede3", "#315b63", "#a6b59b"] },
    { id: "electric-petal", name: "Electric Petal", style: "artistic", finish: "chrome", motif: "floral", palette: ["#57256f", "#df4d9a", "#65c5c6"] },
    { id: "dusk-horizon", name: "Dusk Horizon", style: "artistic", finish: "cat-eye", motif: "ombre", palette: ["#2c254f", "#99516e", "#e1a378"] },
    { id: "paper-cut", name: "Paper Cut", style: "artistic", finish: "matte", motif: "geometric", palette: ["#ede3cf", "#222d39", "#d66f49"] },
    { id: "sea-glass", name: "Sea Glass", style: "artistic", finish: "jelly", motif: "mosaic", palette: ["#a8d5c8", "#5c9dab", "#d8c99d"] },
    { id: "comet-tail", name: "Comet Tail", style: "artistic", finish: "glitter", motif: "celestial", palette: ["#292a48", "#8d6fa5", "#f2d29c"] },
    { id: "lacquered-check", name: "Lacquered Check", style: "artistic", finish: "gloss", motif: "checker", palette: ["#162f38", "#e6c97a", "#d85f4c"] },
    { id: "glazed-topography", name: "Glazed Topography", style: "artistic", finish: "pearl", motif: "topography", palette: ["#d6c5ad", "#f5eee1", "#8b7967"] },
    { id: "molten-ribbon", name: "Molten Ribbon", style: "artistic", finish: "chrome", motif: "wave", palette: ["#3d2222", "#c35e36", "#f2b654"] },
    { id: "night-garden", name: "Night Garden", style: "artistic", finish: "cat-eye", motif: "floral", palette: ["#142d2a", "#4e8d71", "#b7b65c"] },
  ];
  const atlasCache = new Map();
  const previewCache = new Map();
  const designById = new Map(designs.map((design) => [design.id, design]));
  const filters = { style: "all", finish: "all" };
  let viewerApi = null;
  let selectedDesign = designs[0];

  function label(value) {
    return value.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join("-");
  }

  function seededRandom(seed) {
    let value = 2166136261;
    for (const character of seed) value = Math.imul(value ^ character.charCodeAt(0), 16777619);
    return () => {
      value += 0x6d2b79f5;
      let result = value;
      result = Math.imul(result ^ (result >>> 15), result | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
  }

  function paintFinger(context, design, finger, x, y, width, height) {
    const colors = design.palette;
    const base = colors[finger % colors.length];
    const accent = colors[(finger + 1) % colors.length];
    const highlight = colors[(finger + 2) % colors.length];
    const random = seededRandom(`${design.id}-${finger}`);
    const gradient = context.createLinearGradient(x, y + height, x + width, y);
    gradient.addColorStop(0, base);
    gradient.addColorStop(1, accent);
    context.fillStyle = design.motif === "ombre" ? gradient : base;
    context.fillRect(x, y, width, height);

    if (design.motif === "french") {
      context.fillStyle = accent;
      context.beginPath();
      context.moveTo(x, y + height * (0.18 + finger * 0.012));
      context.quadraticCurveTo(x + width / 2, y + height * 0.3, x + width, y + height * 0.16);
      context.lineTo(x + width, y);
      context.lineTo(x, y);
      context.closePath();
      context.fill();
    } else if (design.motif === "half-moon") {
      context.fillStyle = accent;
      context.beginPath();
      context.ellipse(x + width / 2, y + height * 1.02, width * 0.44, height * 0.22, 0, 0, Math.PI * 2);
      context.fill();
    } else if (design.motif === "tortoise" || design.motif === "blobs") {
      for (let index = 0; index < 7; index += 1) {
        context.globalAlpha = design.motif === "tortoise" ? 0.62 : 0.78;
        context.fillStyle = index % 2 ? accent : highlight;
        context.beginPath();
        context.ellipse(x + random() * width, y + random() * height, width * (0.12 + random() * 0.22), height * (0.05 + random() * 0.11), random() * Math.PI, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
    } else if (["wave", "marble", "topography"].includes(design.motif)) {
      const lines = design.motif === "topography" ? 7 : 4;
      context.lineCap = "round";
      for (let index = 0; index < lines; index += 1) {
        context.strokeStyle = index % 2 ? accent : highlight;
        context.globalAlpha = design.motif === "marble" ? 0.62 : 0.86;
        context.lineWidth = Math.max(1.2, width * (design.motif === "topography" ? 0.025 : 0.09));
        const offset = (index + 0.4) / lines;
        context.beginPath();
        context.moveTo(x - width * 0.1, y + height * offset);
        context.bezierCurveTo(x + width * 0.28, y + height * (offset - 0.18), x + width * 0.65, y + height * (offset + 0.2), x + width * 1.1, y + height * (offset - 0.08));
        context.stroke();
      }
      context.globalAlpha = 1;
    } else if (design.motif === "geometric") {
      context.fillStyle = accent;
      context.fillRect(x, y + height * (0.48 + (finger % 2) * 0.12), width, height * 0.25);
      context.fillStyle = highlight;
      context.beginPath();
      context.arc(x + width * (finger % 2 ? 0.3 : 0.7), y + height * 0.32, width * 0.24, 0, Math.PI * 2);
      context.fill();
    } else if (design.motif === "rays") {
      context.fillStyle = accent;
      for (let index = 0; index < 7; index += 1) {
        context.beginPath();
        context.moveTo(x + width / 2, y + height * 0.7);
        const angleA = -2.8 + index * 0.45;
        const angleB = angleA + 0.18;
        context.lineTo(x + width / 2 + Math.cos(angleA) * height, y + height * 0.7 + Math.sin(angleA) * height);
        context.lineTo(x + width / 2 + Math.cos(angleB) * height, y + height * 0.7 + Math.sin(angleB) * height);
        context.fill();
      }
    } else if (design.motif === "celestial") {
      context.fillStyle = highlight;
      for (let index = 0; index < 9; index += 1) {
        const radius = index === finger ? width * 0.12 : width * (0.018 + random() * 0.045);
        context.beginPath();
        context.arc(x + random() * width, y + random() * height, radius, 0, Math.PI * 2);
        context.fill();
      }
      context.strokeStyle = accent;
      context.lineWidth = width * 0.035;
      context.beginPath();
      context.arc(x + width * 0.5, y + height * 0.42, width * 0.36, 0.3, 2.8);
      context.stroke();
    } else if (design.motif === "grid" || design.motif === "checker") {
      const size = width / (design.motif === "checker" ? 3 : 4);
      context.strokeStyle = accent;
      context.lineWidth = Math.max(1, width * 0.035);
      for (let column = -1; column < 6; column += 1) {
        for (let row = -1; row < height / size + 1; row += 1) {
          if (design.motif === "checker" && (column + row + finger) % 2 === 0) {
            context.fillStyle = (column + finger) % 3 === 0 ? highlight : accent;
            context.fillRect(x + column * size, y + row * size, size, size);
          } else if (design.motif === "grid") {
            context.strokeRect(x + column * size, y + row * size, size, size);
          }
        }
      }
    } else if (design.motif === "confetti") {
      for (let index = 0; index < 16; index += 1) {
        context.fillStyle = colors[index % colors.length];
        context.save();
        context.translate(x + random() * width, y + random() * height);
        context.rotate(random() * Math.PI);
        context.fillRect(-width * 0.045, -height * 0.018, width * 0.09, height * 0.036);
        context.restore();
      }
    } else if (design.motif === "floral") {
      context.strokeStyle = accent;
      context.lineWidth = Math.max(1.2, width * 0.035);
      context.beginPath();
      context.moveTo(x + width * 0.15, y + height);
      context.bezierCurveTo(x + width * 0.85, y + height * 0.72, x + width * 0.1, y + height * 0.38, x + width * 0.7, y);
      context.stroke();
      context.fillStyle = highlight;
      for (let index = 0; index < 4; index += 1) {
        const flowerY = y + height * (0.18 + index * 0.2);
        const flowerX = x + width * (index % 2 ? 0.67 : 0.34);
        context.beginPath();
        context.ellipse(flowerX, flowerY, width * 0.16, height * 0.045, index, 0, Math.PI * 2);
        context.fill();
      }
    } else if (design.motif === "mosaic") {
      context.strokeStyle = "rgba(255,255,255,.48)";
      context.lineWidth = Math.max(1, width * 0.025);
      for (let index = 0; index < 10; index += 1) {
        context.fillStyle = colors[index % colors.length];
        const cellX = x + (index % 3) * width * 0.34 - width * 0.02;
        const cellY = y + Math.floor(index / 3) * height * 0.26 - height * 0.03;
        context.fillRect(cellX, cellY, width * 0.36, height * 0.29);
        context.strokeRect(cellX, cellY, width * 0.36, height * 0.29);
      }
    } else if (design.motif === "outline") {
      context.strokeStyle = accent;
      context.lineWidth = width * 0.13;
      context.strokeRect(x + width * 0.07, y + height * 0.03, width * 0.86, height * 0.94);
    }

    if (design.finish === "gloss") {
      const shine = context.createLinearGradient(x, y, x + width, y);
      shine.addColorStop(0, "rgba(255,255,255,0)");
      shine.addColorStop(0.38, "rgba(255,255,255,.34)");
      shine.addColorStop(0.55, "rgba(255,255,255,0)");
      context.fillStyle = shine;
      context.fillRect(x, y, width, height);
    } else if (design.finish === "jelly") {
      context.fillStyle = "rgba(255,245,238,.2)";
      context.fillRect(x, y, width, height);
      context.strokeStyle = "rgba(255,255,255,.34)";
      context.lineWidth = width * 0.05;
      context.strokeRect(x + width * 0.08, y + height * 0.04, width * 0.84, height * 0.92);
    } else if (design.finish === "chrome") {
      const metal = context.createLinearGradient(x, y, x, y + height);
      metal.addColorStop(0, "rgba(255,255,255,.5)");
      metal.addColorStop(0.24, "rgba(255,255,255,0)");
      metal.addColorStop(0.5, "rgba(8,12,18,.35)");
      metal.addColorStop(0.68, "rgba(255,255,255,.58)");
      metal.addColorStop(1, "rgba(0,0,0,.18)");
      context.fillStyle = metal;
      context.fillRect(x, y, width, height);
    } else if (design.finish === "pearl") {
      const pearl = context.createRadialGradient(x + width * 0.25, y + height * 0.3, 0, x + width * 0.45, y + height * 0.5, height * 0.7);
      pearl.addColorStop(0, "rgba(174,228,226,.38)");
      pearl.addColorStop(0.45, "rgba(255,255,255,.12)");
      pearl.addColorStop(0.78, "rgba(235,166,217,.27)");
      pearl.addColorStop(1, "rgba(255,226,163,.12)");
      context.fillStyle = pearl;
      context.fillRect(x, y, width, height);
    } else if (design.finish === "glitter") {
      for (let index = 0; index < 42; index += 1) {
        context.globalAlpha = 0.38 + random() * 0.62;
        context.fillStyle = index % 3 ? "#fff7d6" : highlight;
        context.beginPath();
        context.arc(x + random() * width, y + random() * height, width * (0.008 + random() * 0.025), 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
    } else if (design.finish === "cat-eye") {
      const eye = context.createLinearGradient(x, y + height, x + width, y);
      eye.addColorStop(0, "rgba(255,255,255,0)");
      eye.addColorStop(0.42, "rgba(255,244,185,0)");
      eye.addColorStop(0.5, "rgba(255,244,185,.72)");
      eye.addColorStop(0.58, "rgba(255,244,185,0)");
      eye.addColorStop(1, "rgba(255,255,255,0)");
      context.fillStyle = eye;
      context.fillRect(x, y, width, height);
    }
  }

  function drawNailAtlas(design) {
    if (atlasCache.has(design.id)) return atlasCache.get(design.id);
    const atlas = document.createElement("canvas");
    atlas.width = 1280;
    atlas.height = 256;
    const context = atlas.getContext("2d");
    for (let finger = 0; finger < 5; finger += 1) {
      const cellX = finger * 256;
      context.save();
      context.beginPath();
      context.rect(cellX, 0, 256, 256);
      context.clip();
      paintFinger(context, design, finger, cellX, 0, 256, 256);
      context.restore();
    }
    atlasCache.set(design.id, atlas);
    return atlas;
  }

  function nailPreviewPath(context, x, y, width, height) {
    context.beginPath();
    context.moveTo(x + width * 0.08, y + height);
    context.lineTo(x + width * 0.02, y + height * 0.35);
    context.bezierCurveTo(x, y + height * 0.09, x + width * 0.21, y, x + width / 2, y);
    context.bezierCurveTo(x + width * 0.79, y, x + width, y + height * 0.09, x + width * 0.98, y + height * 0.35);
    context.lineTo(x + width * 0.92, y + height);
    context.quadraticCurveTo(x + width / 2, y + height * 0.94, x + width * 0.08, y + height);
    context.closePath();
  }

  function drawFiveNailPreview(design) {
    if (previewCache.has(design.id)) return previewCache.get(design.id);
    const preview = document.createElement("canvas");
    preview.width = 520;
    preview.height = 176;
    preview.className = "design-preview";
    preview.setAttribute("aria-hidden", "true");
    const context = preview.getContext("2d");
    const widths = [72, 64, 68, 63, 55];
    const heights = [126, 145, 158, 142, 112];
    let x = 43;
    for (let finger = 0; finger < 5; finger += 1) {
      const y = 10 + (158 - heights[finger]);
      context.save();
      nailPreviewPath(context, x, y, widths[finger], heights[finger]);
      context.clip();
      paintFinger(context, design, finger, x, y, widths[finger], heights[finger]);
      context.restore();
      nailPreviewPath(context, x, y, widths[finger], heights[finger]);
      context.strokeStyle = "rgba(38,32,29,.25)";
      context.lineWidth = 2;
      context.stroke();
      x += widths[finger] + 18;
    }
    previewCache.set(design.id, preview);
    return preview;
  }

  function currentTheme() {
    return root.dataset.theme || (systemTheme.matches ? "dark" : "light");
  }

  function updateThemeToggle() {
    const dark = currentTheme() === "dark";
    const label = `Use ${dark ? "light" : "dark"} theme`;
    themeToggle.setAttribute("aria-label", label);
    themeToggle.title = label;
    themeColor.content = dark ? "#191817" : "#f1eee8";
  }

  themeToggle.addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    updateThemeToggle();
  });

  systemTheme.addEventListener("change", () => {
    if (!root.dataset.theme) updateThemeToggle();
  });
  updateThemeToggle();

  const designGrid = document.querySelector("#design-grid");
  const catalogCount = document.querySelector("#catalog-count");
  const catalogEmpty = document.querySelector("#catalog-empty");
  const selectedDesignName = document.querySelector("#selected-design-name");
  const selectedDesignMeta = document.querySelector("#selected-design-meta");
  const mobileCatalog = window.matchMedia("(max-width: 560px)");
  let catalogScrollFrame = 0;
  let catalogScrollTimer = 0;

  function scrollToCard(card, behavior = reduceMotion.matches ? "auto" : "smooth") {
    if (!mobileCatalog.matches || !card || card.hidden) return;
    cancelAnimationFrame(catalogScrollFrame);
    catalogScrollFrame = requestAnimationFrame(() => {
      if (card.hidden) return;
      const scrollRect = designGrid.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      designGrid.scrollTo({
        left: designGrid.scrollLeft + cardRect.left - scrollRect.left,
        behavior,
      });
    });
  }

  function selectDesign(design, scroll = false) {
    selectedDesign = design;
    let selectedCard = null;
    document.querySelectorAll(".design-card").forEach((card) => {
      const selected = card.dataset.design === design.id;
      card.classList.toggle("is-selected", selected);
      card.setAttribute("aria-pressed", String(selected));
      if (selected) selectedCard = card;
    });
    selectedDesignName.textContent = design.name;
    selectedDesignMeta.textContent = `${label(design.style)} · ${label(design.finish)}`;
    canvas.setAttribute("aria-label", `Interactive 3D view of a rigged hand wearing ${design.name}`);
    viewerApi?.setDesign(design);
    if (scroll) scrollToCard(selectedCard);
  }

  function visibleCards() {
    return Array.from(document.querySelectorAll(".design-card:not([hidden])"));
  }

  function selectSettledCard() {
    clearTimeout(catalogScrollTimer);
    if (!mobileCatalog.matches) return;
    const scrollLeft = designGrid.getBoundingClientRect().left;
    const settledCard = visibleCards().reduce((closest, card) => (
      !closest
      || Math.abs(card.getBoundingClientRect().left - scrollLeft)
        < Math.abs(closest.getBoundingClientRect().left - scrollLeft)
        ? card
        : closest
    ), null);
    if (!settledCard || settledCard.dataset.design === selectedDesign.id) return;
    selectDesign(designById.get(settledCard.dataset.design));
  }

  designGrid.addEventListener("scroll", () => {
    clearTimeout(catalogScrollTimer);
    catalogScrollTimer = window.setTimeout(selectSettledCard, 140);
  }, { passive: true });
  if ("onscrollend" in designGrid) {
    designGrid.addEventListener("scrollend", selectSettledCard);
  }

  mobileCatalog.addEventListener("change", () => {
    clearTimeout(catalogScrollTimer);
    cancelAnimationFrame(catalogScrollFrame);
    if (mobileCatalog.matches) {
      scrollToCard(document.querySelector(`.design-card[data-design="${selectedDesign.id}"]`), "auto");
    } else {
      designGrid.scrollTo({ left: 0, behavior: "auto" });
    }
  });

  function applyFilters() {
    let visible = 0;
    document.querySelectorAll(".design-card").forEach((card) => {
      const design = designById.get(card.dataset.design);
      const matches = (filters.style === "all" || design.style === filters.style)
        && (filters.finish === "all" || design.finish === filters.finish);
      card.hidden = !matches;
      if (matches) visible += 1;
    });
    catalogCount.textContent = `${visible} design${visible === 1 ? "" : "s"}`;
    catalogEmpty.hidden = visible !== 0;
    const currentVisible = (filters.style === "all" || selectedDesign.style === filters.style)
      && (filters.finish === "all" || selectedDesign.finish === filters.finish);
    if (!currentVisible && visible) {
      const firstDesign = designs.find((design) => (
        (filters.style === "all" || design.style === filters.style)
        && (filters.finish === "all" || design.finish === filters.finish)
      ));
      selectDesign(firstDesign);
    }
    scrollToCard(document.querySelector(`.design-card[data-design="${selectedDesign.id}"]`), "auto");
  }

  designs.forEach((design) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "design-card";
    card.dataset.design = design.id;
    card.setAttribute("aria-pressed", String(design === selectedDesign));
    card.setAttribute("aria-label", `${design.name}, ${label(design.style)}, ${label(design.finish)}`);
    card.append(drawFiveNailPreview(design));

    const copy = document.createElement("span");
    copy.className = "design-card-copy";
    const name = document.createElement("strong");
    name.textContent = design.name;
    const tags = document.createElement("span");
    tags.className = "design-tags";
    [label(design.style), label(design.finish), label(design.motif)].forEach((text) => {
      const tag = document.createElement("small");
      tag.textContent = text;
      tags.append(tag);
    });
    const check = document.createElement("span");
    check.className = "design-check";
    check.setAttribute("aria-hidden", "true");
    check.textContent = "✓";
    copy.append(name, tags, check);
    card.append(copy);
    card.addEventListener("click", () => selectDesign(design, true));
    card.addEventListener("keydown", (event) => {
      const cards = visibleCards();
      const index = cards.indexOf(card);
      const rowStep = mobileCatalog.matches ? 1 : 2;
      const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -rowStep, ArrowDown: rowStep };
      let target = null;
      if (event.key === "Home") target = cards[0];
      else if (event.key === "End") target = cards[cards.length - 1];
      else if (moves[event.key]) target = cards[Math.max(0, Math.min(cards.length - 1, index + moves[event.key]))];
      if (!target || target === card) return;
      event.preventDefault();
      target.focus({ preventScroll: mobileCatalog.matches });
      scrollToCard(target);
    });
    designGrid.append(card);
  });
  applyFilters();

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.filter;
      filters[type] = button.dataset.value;
      document.querySelectorAll(`[data-filter="${type}"]`).forEach((pill) => {
        pill.setAttribute("aria-pressed", String(pill === button));
      });
      applyFilters();
    });
  });
  document.querySelectorAll("[data-view-action]").forEach((button) => {
    button.addEventListener("click", () => viewerApi?.action(button.dataset.viewAction));
  });

  const canvas = document.querySelector("#hand-canvas");
  const viewport = document.querySelector("#viewport");
  const loadingState = document.querySelector("#loading-state");
  const fallback = document.querySelector("#viewer-fallback");
  const status = document.querySelector("#viewer-status");
  selectDesign(selectedDesign);

  viewport.addEventListener("contextmenu", (event) => event.preventDefault());

  function showFallback(message) {
    loadingState.classList.add("is-hidden");
    viewport.classList.add("has-fallback");
    fallback.hidden = false;
    canvas.hidden = true;
    status.textContent = message || "3D preview unavailable";
  }

  const M = {
    identity() {
      return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    },

    multiply(a, b) {
      const out = new Float32Array(16);
      for (let c = 0; c < 4; c += 1) {
        for (let r = 0; r < 4; r += 1) {
          out[c * 4 + r] =
            a[r] * b[c * 4] +
            a[4 + r] * b[c * 4 + 1] +
            a[8 + r] * b[c * 4 + 2] +
            a[12 + r] * b[c * 4 + 3];
        }
      }
      return out;
    },

    fromTRS(t, q, s) {
      const [x, y, z, w] = q;
      const x2 = x + x;
      const y2 = y + y;
      const z2 = z + z;
      const xx = x * x2;
      const xy = x * y2;
      const xz = x * z2;
      const yy = y * y2;
      const yz = y * z2;
      const zz = z * z2;
      const wx = w * x2;
      const wy = w * y2;
      const wz = w * z2;
      return new Float32Array([
        (1 - (yy + zz)) * s[0], (xy + wz) * s[0], (xz - wy) * s[0], 0,
        (xy - wz) * s[1], (1 - (xx + zz)) * s[1], (yz + wx) * s[1], 0,
        (xz + wy) * s[2], (yz - wx) * s[2], (1 - (xx + yy)) * s[2], 0,
        t[0], t[1], t[2], 1,
      ]);
    },

    translation(x, y, z) {
      const out = M.identity();
      out[12] = x;
      out[13] = y;
      out[14] = z;
      return out;
    },

    scale(x, y, z) {
      const out = M.identity();
      out[0] = x;
      out[5] = y;
      out[10] = z;
      return out;
    },

    rotationX(angle) {
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
    },

    rotationZ(angle) {
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    },

    invert(a) {
      const out = new Float32Array(16);
      const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
      const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
      const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
      const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
      const b00 = a00 * a11 - a01 * a10;
      const b01 = a00 * a12 - a02 * a10;
      const b02 = a00 * a13 - a03 * a10;
      const b03 = a01 * a12 - a02 * a11;
      const b04 = a01 * a13 - a03 * a11;
      const b05 = a02 * a13 - a03 * a12;
      const b06 = a20 * a31 - a21 * a30;
      const b07 = a20 * a32 - a22 * a30;
      const b08 = a20 * a33 - a23 * a30;
      const b09 = a21 * a32 - a22 * a31;
      const b10 = a21 * a33 - a23 * a31;
      const b11 = a22 * a33 - a23 * a32;
      let determinant = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
      if (!determinant) return M.identity();
      determinant = 1 / determinant;
      out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * determinant;
      out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * determinant;
      out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * determinant;
      out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * determinant;
      out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * determinant;
      out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * determinant;
      out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * determinant;
      out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * determinant;
      out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * determinant;
      out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * determinant;
      out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * determinant;
      out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * determinant;
      out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * determinant;
      out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * determinant;
      out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * determinant;
      out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * determinant;
      return out;
    },

    perspective(fovy, aspect, near, far) {
      const f = 1 / Math.tan(fovy / 2);
      const nf = 1 / (near - far);
      return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) * nf, -1,
        0, 0, 2 * far * near * nf, 0,
      ]);
    },

    lookAt(eye, center, up) {
      let zx = eye[0] - center[0];
      let zy = eye[1] - center[1];
      let zz = eye[2] - center[2];
      let length = Math.hypot(zx, zy, zz) || 1;
      zx /= length; zy /= length; zz /= length;
      let xx = up[1] * zz - up[2] * zy;
      let xy = up[2] * zx - up[0] * zz;
      let xz = up[0] * zy - up[1] * zx;
      length = Math.hypot(xx, xy, xz) || 1;
      xx /= length; xy /= length; xz /= length;
      const yx = zy * xz - zz * xy;
      const yy = zz * xx - zx * xz;
      const yz = zx * xy - zy * xx;
      return new Float32Array([
        xx, yx, zx, 0,
        xy, yy, zy, 0,
        xz, yz, zz, 0,
        -(xx * eye[0] + xy * eye[1] + xz * eye[2]),
        -(yx * eye[0] + yy * eye[1] + yz * eye[2]),
        -(zx * eye[0] + zy * eye[1] + zz * eye[2]),
        1,
      ]);
    },

    point(matrix, point) {
      const [x, y, z] = point;
      return [
        matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
        matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
        matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14],
      ];
    },
  };

  function slerp(a, b, t) {
    let cos = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
    const end = [...b];
    if (cos < 0) {
      cos = -cos;
      for (let i = 0; i < 4; i += 1) end[i] = -end[i];
    }
    if (cos > 0.9995) {
      const out = a.map((value, index) => value + (end[index] - value) * t);
      const length = Math.hypot(...out) || 1;
      return out.map((value) => value / length);
    }
    const theta = Math.acos(Math.min(1, cos));
    const sinTheta = Math.sin(theta);
    const one = Math.sin((1 - t) * theta) / sinTheta;
    const two = Math.sin(t * theta) / sinTheta;
    return a.map((value, index) => value * one + end[index] * two);
  }

  function quatFromAxisAngle(axis, angle) {
    const half = angle / 2;
    const s = Math.sin(half);
    return [axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(half)];
  }

  function quatMultiply(a, b) {
    const [ax, ay, az, aw] = a;
    const [bx, by, bz, bw] = b;
    return [
      aw * bx + ax * bw + ay * bz - az * by,
      aw * by - ax * bz + ay * bw + az * bx,
      aw * bz + ax * by - ay * bx + az * bw,
      aw * bw - ax * bx - ay * by - az * bz,
    ];
  }

  function quatNormalize(q) {
    const length = Math.hypot(q[0], q[1], q[2], q[3]) || 1;
    return [q[0] / length, q[1] / length, q[2] / length, q[3] / length];
  }

  function quatRotateVector(q, v) {
    const qx = q[0], qy = q[1], qz = q[2], qw = q[3];
    const uvx = qy * v[2] - qz * v[1];
    const uvy = qz * v[0] - qx * v[2];
    const uvz = qx * v[1] - qy * v[0];
    const uuvx = qy * uvz - qz * uvy;
    const uuvy = qz * uvx - qx * uvz;
    const uuvz = qx * uvy - qy * uvx;
    return [
      v[0] + (uvx * qw + uuvx) * 2,
      v[1] + (uvy * qw + uuvy) * 2,
      v[2] + (uvz * qw + uuvz) * 2,
    ];
  }

  const accessorTypes = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
  const componentTypes = {
    5120: Int8Array,
    5121: Uint8Array,
    5122: Int16Array,
    5123: Uint16Array,
    5125: Uint32Array,
    5126: Float32Array,
  };

  function parseGLB(buffer) {
    const view = new DataView(buffer);
    if (view.getUint32(0, true) !== 0x46546c67 || view.getUint32(4, true) !== 2) {
      throw new Error("The hand asset is not a valid glTF 2.0 binary.");
    }
    let offset = 12;
    let json;
    let binary;
    while (offset < buffer.byteLength) {
      const length = view.getUint32(offset, true);
      const type = view.getUint32(offset + 4, true);
      const chunk = buffer.slice(offset + 8, offset + 8 + length);
      if (type === 0x4e4f534a) {
        json = JSON.parse(new TextDecoder().decode(chunk).replace(/\0+$/, ""));
      } else if (type === 0x004e4942) {
        binary = chunk;
      }
      offset += 8 + length;
    }
    if (!json || !binary) throw new Error("The hand asset is incomplete.");
    return { json, binary };
  }

  function createAccessorReader(json, binary) {
    return function readAccessor(index) {
      const accessor = json.accessors[index];
      const view = json.bufferViews[accessor.bufferView];
      const Constructor = componentTypes[accessor.componentType];
      const itemSize = accessorTypes[accessor.type];
      const componentSize = Constructor.BYTES_PER_ELEMENT;
      const packedStride = componentSize * itemSize;
      const stride = view.byteStride || packedStride;
      const byteOffset = (view.byteOffset || 0) + (accessor.byteOffset || 0);
      if (stride === packedStride && byteOffset % componentSize === 0) {
        return new Constructor(binary, byteOffset, accessor.count * itemSize).slice();
      }
      const output = new Constructor(accessor.count * itemSize);
      const source = new DataView(binary);
      const getters = {
        5120: "getInt8",
        5121: "getUint8",
        5122: "getInt16",
        5123: "getUint16",
        5125: "getUint32",
        5126: "getFloat32",
      };
      const getter = getters[accessor.componentType];
      for (let item = 0; item < accessor.count; item += 1) {
        for (let component = 0; component < itemSize; component += 1) {
          output[item * itemSize + component] = source[getter](byteOffset + item * stride + component * componentSize, true);
        }
      }
      return output;
    };
  }

  function compileProgram(gl, vertexSource, fragmentSource) {
    function compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`WebGL shader error: ${message}`);
      }
      return shader;
    }
    const program = gl.createProgram();
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`WebGL program error: ${gl.getProgramInfoLog(program)}`);
    }
    return program;
  }

  function uploadAttribute(gl, location, data, size, integer) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(location);
    let type = gl.FLOAT;
    if (data instanceof Uint16Array) type = gl.UNSIGNED_SHORT;
    else if (data instanceof Uint8Array) type = gl.UNSIGNED_BYTE;
    else if (data instanceof Int16Array) type = gl.SHORT;
    else if (data instanceof Int8Array) type = gl.BYTE;
    if (integer) gl.vertexAttribIPointer(location, size, type, 0, 0);
    else gl.vertexAttribPointer(location, size, type, false, 0, 0);
    return buffer;
  }

  function decodeImage(blob) {
    if ("createImageBitmap" in window) return createImageBitmap(blob);
    return new Promise((resolve, reject) => {
      const image = new Image();
      const url = URL.createObjectURL(blob);
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("The hand texture could not be decoded."));
      };
      image.src = url;
    });
  }

  async function createViewer() {
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    if (!gl) throw new Error("WebGL 2 is not available in this browser.");

    const response = await fetch("/assets/models/rigged-hand.glb");
    if (!response.ok) throw new Error(`The hand model could not be loaded (${response.status}).`);
    const { json, binary } = parseGLB(await response.arrayBuffer());
    const readAccessor = createAccessorReader(json, binary);
    const primitive = json.meshes[0].primitives[0];

    if (primitive.attributes.JOINTS_0 == null || primitive.attributes.WEIGHTS_0 == null || !json.skins?.length) {
      throw new Error("The supplied model does not contain the expected hand rig.");
    }

    const skinVertex = `#version 300 es
      precision highp float;
      precision highp int;
      layout(location=0) in vec3 a_position;
      layout(location=1) in vec3 a_normal;
      layout(location=2) in vec2 a_uv;
      layout(location=3) in uvec4 a_joints;
      layout(location=4) in vec4 a_weights;
      uniform mat4 u_projection;
      uniform mat4 u_view;
      uniform mat4 u_viewer;
      uniform highp sampler2D u_bones;
      out vec2 v_uv;
      out vec3 v_normal;
      out vec3 v_position;
      mat4 bone(uint index) {
        int row = int(index);
        return mat4(
          texelFetch(u_bones, ivec2(0, row), 0),
          texelFetch(u_bones, ivec2(1, row), 0),
          texelFetch(u_bones, ivec2(2, row), 0),
          texelFetch(u_bones, ivec2(3, row), 0)
        );
      }
      void main() {
        vec4 weights = a_weights / max(dot(a_weights, vec4(1.0)), 0.0001);
        mat4 skin = weights.x * bone(a_joints.x)
                  + weights.y * bone(a_joints.y)
                  + weights.z * bone(a_joints.z)
                  + weights.w * bone(a_joints.w);
        vec4 world = u_viewer * skin * vec4(a_position, 1.0);
        v_position = world.xyz;
        v_normal = normalize(mat3(u_viewer * skin) * a_normal);
        v_uv = a_uv;
        gl_Position = u_projection * u_view * world;
      }
    `;

    // Nail UV islands: each rectangle is a region of the shared skin UV map
    // that is remapped to local 0..1 coordinates and sampled from the dynamic
    // nail texture instead of the skin texture.
    const skinFragment = `#version 300 es
      precision highp float;
      in vec2 v_uv;
      in vec3 v_normal;
      in vec3 v_position;
      uniform sampler2D u_skinTexture;
      uniform sampler2D u_nailTexture;
      uniform int u_nailFinish;
      out vec4 outColor;

      const int NAIL_COUNT = 5;
      const vec4 NAIL_UV_RECTS[NAIL_COUNT] = vec4[NAIL_COUNT](
        vec4(0.7237607241, 0.3519485891, 0.7907230854, 0.4083442986),
        vec4(0.7300586700, 0.2282793373, 0.7766602039, 0.2878110707),
        vec4(0.8480325937, 0.3488490283, 0.8956496119, 0.4065266252),
        vec4(0.8529052138, 0.2294050008, 0.8949750662, 0.2841750085),
        vec4(0.7338642478, 0.1401616335, 0.7712491155, 0.1821782440)
      );

      void main() {
        vec3 normal = normalize(v_normal);
        vec3 key = normalize(vec3(-0.42, 0.82, 0.58));
        vec3 fill = normalize(vec3(0.72, 0.15, 0.68));
        float diffuse = max(dot(normal, key), 0.0) * 0.72 + max(dot(normal, fill), 0.0) * 0.22;
        vec3 viewDirection = normalize(vec3(0.0, 0.0, 4.0) - v_position);
        float rim = pow(1.0 - abs(dot(normal, viewDirection)), 2.4);

        bool isNail = false;
        vec2 localUv = vec2(0.0);
        int fingerIndex = 0;
        for (int i = 0; i < NAIL_COUNT; i += 1) {
          vec4 rect = NAIL_UV_RECTS[i];
          if (v_uv.x >= rect.x && v_uv.x <= rect.z && v_uv.y >= rect.y && v_uv.y <= rect.w) {
            localUv = (v_uv - rect.xy) / (rect.zw - rect.xy);
            fingerIndex = i;
            isNail = true;
          }
        }

        vec3 color;
        if (isNail) {
          vec2 cellUv = mix(vec2(0.5 / 256.0), vec2(255.5 / 256.0), clamp(localUv, 0.0, 1.0));
          vec2 atlasUv = vec2((float(fingerIndex) + cellUv.x) / 5.0, cellUv.y);
          vec3 base = texture(u_nailTexture, atlasUv).rgb;
          vec3 halfVector = normalize(key + viewDirection);
          float specularPower = 62.0;
          float specularStrength = 0.68;
          float diffuseStrength = 0.66;
          if (u_nailFinish == 1) {
            specularPower = 14.0;
            specularStrength = 0.08;
            diffuseStrength = 0.52;
          } else if (u_nailFinish == 2) {
            specularPower = 48.0;
            specularStrength = 0.42;
            base = mix(base, vec3(0.98, 0.83, 0.78), 0.12);
          } else if (u_nailFinish == 3) {
            specularPower = 118.0;
            specularStrength = 1.05;
            diffuseStrength = 0.34;
          } else if (u_nailFinish == 4) {
            specularPower = 42.0;
            specularStrength = 0.5;
          } else if (u_nailFinish == 5) {
            specularPower = 82.0;
            specularStrength = 0.78;
          } else if (u_nailFinish == 6) {
            specularPower = 92.0;
            specularStrength = 0.72;
          }
          float gloss = pow(max(dot(normal, halfVector), 0.0), specularPower);
          color = base * (0.48 + diffuse * diffuseStrength) + vec3(1.0) * gloss * specularStrength;
          if (u_nailFinish == 3) {
            float metalBand = smoothstep(0.18, 0.8, abs(normal.y * 0.8 + normal.x * 0.35));
            color = mix(color, vec3(dot(base, vec3(0.3, 0.56, 0.14))), 0.22) + vec3(metalBand * 0.24);
          } else if (u_nailFinish == 4) {
            vec3 pearlShift = 0.5 + 0.5 * cos(vec3(0.0, 2.1, 4.2) + rim * 5.0 + localUv.y * 2.0);
            color += pearlShift * rim * 0.28;
          } else if (u_nailFinish == 5) {
            float sparkle = pow(max(0.0, sin(localUv.x * 267.0 + localUv.y * 193.0)), 24.0);
            color += vec3(sparkle * (0.14 + gloss * 0.5));
          } else if (u_nailFinish == 6) {
            float eyeBand = pow(max(0.0, 1.0 - abs(localUv.x + localUv.y * 0.34 - 0.68) * 5.2), 2.0);
            color += vec3(1.0, 0.82, 0.42) * eyeBand * (0.16 + rim * 0.38);
          }
          color += vec3(0.72, 0.78, 1.0) * rim * (u_nailFinish == 1 ? 0.06 : 0.22);
        } else {
          vec3 base = texture(u_skinTexture, v_uv).rgb;
          base = mix(base, vec3(0.96, 0.72, 0.62), 0.055);
          color = base * (0.47 + diffuse) + vec3(0.24, 0.18, 0.25) * rim * 0.18;
        }
        outColor = vec4(pow(color, vec3(0.92)), 1.0);
      }
    `;

    const skinProgram = compileProgram(gl, skinVertex, skinFragment);
    const skinUniforms = {
      projection: gl.getUniformLocation(skinProgram, "u_projection"),
      view: gl.getUniformLocation(skinProgram, "u_view"),
      viewer: gl.getUniformLocation(skinProgram, "u_viewer"),
      bones: gl.getUniformLocation(skinProgram, "u_bones"),
      skinTexture: gl.getUniformLocation(skinProgram, "u_skinTexture"),
      nailTexture: gl.getUniformLocation(skinProgram, "u_nailTexture"),
      nailFinish: gl.getUniformLocation(skinProgram, "u_nailFinish"),
    };

    const positionData = readAccessor(primitive.attributes.POSITION);
    const jointData = readAccessor(primitive.attributes.JOINTS_0);
    const weightData = readAccessor(primitive.attributes.WEIGHTS_0);
    const skinVao = gl.createVertexArray();
    gl.bindVertexArray(skinVao);
    uploadAttribute(gl, 0, positionData, 3, false);
    uploadAttribute(gl, 1, readAccessor(primitive.attributes.NORMAL), 3, false);
    uploadAttribute(gl, 2, readAccessor(primitive.attributes.TEXCOORD_0), 2, false);
    uploadAttribute(gl, 3, jointData, 4, true);
    uploadAttribute(gl, 4, weightData, 4, false);
    const indexData = readAccessor(primitive.indices);
    const skinIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skinIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);
    const skinIndexType = indexData instanceof Uint32Array ? gl.UNSIGNED_INT : indexData instanceof Uint16Array ? gl.UNSIGNED_SHORT : gl.UNSIGNED_BYTE;

    const skinTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, skinTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([225, 163, 142, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    const baseTextureIndex = json.materials?.[primitive.material]?.pbrMetallicRoughness?.baseColorTexture?.index;
    if (baseTextureIndex != null) {
      const imageIndex = json.textures[baseTextureIndex].source;
      const imageInfo = json.images[imageIndex];
      const imageView = json.bufferViews[imageInfo.bufferView];
      const imageBytes = binary.slice(imageView.byteOffset || 0, (imageView.byteOffset || 0) + imageView.byteLength);
      const image = await decodeImage(new Blob([imageBytes], { type: imageInfo.mimeType }));
      gl.bindTexture(gl.TEXTURE_2D, skinTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_2D);
      image.close?.();
    }

    const nailTexture = gl.createTexture();
    let activeFinishCode = finishCodes[selectedDesign.finish];
    function setDesign(design) {
      const textureCanvas = drawNailAtlas(design);
      activeFinishCode = finishCodes[design.finish];
      gl.bindTexture(gl.TEXTURE_2D, nailTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureCanvas);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    }
    setDesign(selectedDesign);

    const nodes = json.nodes;
    const parent = new Int16Array(nodes.length).fill(-1);
    nodes.forEach((node, nodeIndex) => node.children?.forEach((child) => { parent[child] = nodeIndex; }));
    const basePose = nodes.map((node) => ({
      translation: [...(node.translation || [0, 0, 0])],
      rotation: [...(node.rotation || [0, 0, 0, 1])],
      scale: [...(node.scale || [1, 1, 1])],
      matrix: node.matrix ? new Float32Array(node.matrix) : null,
    }));
    const pose = basePose.map((entry) => ({
      translation: [...entry.translation],
      rotation: [...entry.rotation],
      scale: [...entry.scale],
      matrix: entry.matrix,
    }));
    const localMatrices = nodes.map(() => M.identity());
    const worldMatrices = nodes.map(() => M.identity());
    const visiting = new Uint8Array(nodes.length);

    const animation = json.animations?.[0];
    const tracks = animation ? animation.channels.map((channel) => {
      const sampler = animation.samplers[channel.sampler];
      return {
        node: channel.target.node,
        path: channel.target.path,
        input: readAccessor(sampler.input),
        output: readAccessor(sampler.output),
        width: channel.target.path === "rotation" ? 4 : 3,
      };
    }) : [];
    const animationDuration = tracks.reduce((maximum, track) => Math.max(maximum, track.input[track.input.length - 1] || 0), 0);

    function sampleTrack(track, time) {
      const times = track.input;
      let low = 0;
      let high = times.length - 1;
      while (low < high - 1) {
        const middle = (low + high) >> 1;
        if (times[middle] <= time) low = middle;
        else high = middle;
      }
      const next = Math.min(low + 1, times.length - 1);
      const range = times[next] - times[low];
      const alpha = range > 0 ? Math.max(0, Math.min(1, (time - times[low]) / range)) : 0;
      const start = Array.from(track.output.subarray(low * track.width, low * track.width + track.width));
      const end = Array.from(track.output.subarray(next * track.width, next * track.width + track.width));
      return track.path === "rotation"
        ? slerp(start, end, alpha)
        : start.map((value, index) => value + (end[index] - value) * alpha);
    }

    function updatePose(time) {
      for (let index = 0; index < pose.length; index += 1) {
        pose[index].translation.splice(0, 3, ...basePose[index].translation);
        pose[index].rotation.splice(0, 4, ...basePose[index].rotation);
        pose[index].scale.splice(0, 3, ...basePose[index].scale);
      }
      tracks.forEach((track) => {
        pose[track.node][track.path] = sampleTrack(track, time);
      });
      visiting.fill(0);
      function updateNode(index) {
        if (visiting[index] === 2) return;
        if (visiting[index] === 1) throw new Error("The hand rig contains a node cycle.");
        visiting[index] = 1;
        const p = pose[index];
        localMatrices[index] = p.matrix || M.fromTRS(p.translation, p.rotation, p.scale);
        if (parent[index] >= 0) {
          updateNode(parent[index]);
          worldMatrices[index] = M.multiply(worldMatrices[parent[index]], localMatrices[index]);
        } else {
          worldMatrices[index] = localMatrices[index];
        }
        visiting[index] = 2;
      }
      nodes.forEach((_, index) => updateNode(index));
    }
    updatePose(animationDuration * 0.1);

    const skin = json.skins[0];
    const inverseBindData = readAccessor(skin.inverseBindMatrices);
    const jointMatrices = new Float32Array(skin.joints.length * 16);
    skin.joints.forEach((nodeIndex, jointIndex) => {
      const inverseBind = inverseBindData.subarray(jointIndex * 16, jointIndex * 16 + 16);
      jointMatrices.set(M.multiply(worldMatrices[nodeIndex], inverseBind), jointIndex * 16);
    });

    const worldMin = [Infinity, Infinity, Infinity];
    const worldMax = [-Infinity, -Infinity, -Infinity];
    for (let vertex = 0; vertex < positionData.length / 3; vertex += 1) {
      const position = positionData.subarray(vertex * 3, vertex * 3 + 3);
      const weightOffset = vertex * 4;
      const weightTotal = Math.max(
        weightData[weightOffset] + weightData[weightOffset + 1] + weightData[weightOffset + 2] + weightData[weightOffset + 3],
        0.0001,
      );
      const skinned = [0, 0, 0];
      for (let influence = 0; influence < 4; influence += 1) {
        const jointIndex = jointData[weightOffset + influence];
        const matrix = jointMatrices.subarray(jointIndex * 16, jointIndex * 16 + 16);
        const point = M.point(matrix, position);
        const weight = weightData[weightOffset + influence] / weightTotal;
        for (let axis = 0; axis < 3; axis += 1) skinned[axis] += point[axis] * weight;
      }
      for (let axis = 0; axis < 3; axis += 1) {
        worldMin[axis] = Math.min(worldMin[axis], skinned[axis]);
        worldMax[axis] = Math.max(worldMax[axis], skinned[axis]);
      }
    }
    const center = worldMin.map((value, axis) => (value + worldMax[axis]) / 2);
    const extent = Math.max(...worldMax.map((value, axis) => value - worldMin[axis]));
    const modelScale = 2.55 / extent;
    const viewerBase = M.multiply(
      M.scale(modelScale, modelScale, modelScale),
      M.multiply(M.rotationX(Math.PI / 2), M.translation(-center[0], -center[1], -center[2])),
    );

    const boneTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, boneTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 4, skin.joints.length, 0, gl.RGBA, gl.FLOAT, jointMatrices);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Nail regions are painted directly in the skin fragment shader by
    // remapping fixed UV islands (see NAIL_UV_RECTS above) to local 0..1
    // coordinates and sampling the dynamic nail texture there.
    const nailRegionNames = ["thumb", "index", "middle", "ring", "pinky"];

    const initialYaw = 0.18;
    const initialPitch = 0.08;
    const initialDistance = 4.15;
    const initialQuat = quatNormalize(
      quatMultiply(
        quatFromAxisAngle([0, 1, 0], initialYaw),
        quatFromAxisAngle([1, 0, 0], -initialPitch),
      ),
    );
    const camera = {
      quat: initialQuat,
      targetQuat: initialQuat,
      distance: initialDistance,
      targetDistance: initialDistance,
      pan: [0, 0, 0],
      targetPan: [0, 0, 0],
    };
    const distanceLimits = [2.75, 5.8];

    function clampCamera() {
      camera.targetDistance = Math.max(distanceLimits[0], Math.min(distanceLimits[1], camera.targetDistance));
    }

    function action(name) {
      if (name === "left") {
        camera.targetQuat = quatNormalize(quatMultiply(quatFromAxisAngle([0, 1, 0], -0.22), camera.targetQuat));
      }
      if (name === "right") {
        camera.targetQuat = quatNormalize(quatMultiply(quatFromAxisAngle([0, 1, 0], 0.22), camera.targetQuat));
      }
      if (name === "in") camera.targetDistance -= 0.35;
      if (name === "out") camera.targetDistance += 0.35;
      if (name === "reset") {
        camera.targetQuat = initialQuat;
        camera.targetDistance = initialDistance;
        camera.targetPan = [0, 0, 0];
      }
      clampCamera();
    }

    let drag = null;
    canvas.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 && event.button !== 2) return;
      canvas.setPointerCapture(event.pointerId);
      drag = { pointerId: event.pointerId, button: event.button, x: event.clientX, y: event.clientY };
      event.preventDefault();
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (drag.button === 2) {
        const rightWorld = quatRotateVector(camera.targetQuat, [1, 0, 0]);
        const upWorld = quatRotateVector(camera.targetQuat, [0, 1, 0]);
        const panScale = camera.targetDistance * 0.0016;
        camera.targetPan = [
          camera.targetPan[0] + (rightWorld[0] * -dx + upWorld[0] * dy) * panScale,
          camera.targetPan[1] + (rightWorld[1] * -dx + upWorld[1] * dy) * panScale,
          camera.targetPan[2] + (rightWorld[2] * -dx + upWorld[2] * dy) * panScale,
        ];
      } else {
        const dragLength = Math.hypot(dx, dy);
        if (dragLength > 0) {
          const localAxis = [-dy / dragLength, -dx / dragLength, 0];
          const worldAxis = quatRotateVector(camera.targetQuat, localAxis);
          const angle = dragLength * 0.008;
          const deltaQuat = quatFromAxisAngle(worldAxis, angle);
          camera.targetQuat = quatNormalize(quatMultiply(deltaQuat, camera.targetQuat));
        }
      }
      drag.x = event.clientX;
      drag.y = event.clientY;
      clampCamera();
    });
    function releasePointer(event) {
      if (drag?.pointerId === event.pointerId) drag = null;
    }
    canvas.addEventListener("pointerup", releasePointer);
    canvas.addEventListener("pointercancel", releasePointer);
    canvas.addEventListener("wheel", (event) => {
      camera.targetDistance += event.deltaY * 0.0035;
      clampCamera();
      event.preventDefault();
    }, { passive: false });
    canvas.addEventListener("keydown", (event) => {
      const actions = {
        ArrowLeft: "left",
        ArrowRight: "right",
        "+": "in",
        "=": "in",
        "-": "out",
        _: "out",
        r: "reset",
        R: "reset",
      };
      if (event.key === "ArrowUp") {
        camera.targetQuat = quatNormalize(quatMultiply(quatFromAxisAngle([1, 0, 0], -0.15), camera.targetQuat));
      } else if (event.key === "ArrowDown") {
        camera.targetQuat = quatNormalize(quatMultiply(quatFromAxisAngle([1, 0, 0], 0.15), camera.targetQuat));
      } else if (actions[event.key]) action(actions[event.key]);
      else return;
      clampCamera();
      event.preventDefault();
    });

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.clearColor(0, 0, 0, 0);

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      return width / height;
    }

    let contextLost = false;
    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      contextLost = true;
      showFallback("The 3D context was lost");
    });

    const startTime = performance.now();
    function render(now) {
      if (contextLost) return;
      const time = (now - startTime) / 1000;
      const staticPose = animationDuration * 0.1;
      const poseTime = reduceMotion.matches || !animationDuration
        ? staticPose
        : animationDuration * (0.1 + 0.022 * (0.5 + 0.5 * Math.sin(time * 0.72)));
      updatePose(poseTime);

      const damping = reduceMotion.matches ? 1 : 0.1;
      camera.quat = reduceMotion.matches ? camera.targetQuat : quatNormalize(slerp(camera.quat, camera.targetQuat, damping));
      camera.distance += (camera.targetDistance - camera.distance) * damping;
      camera.pan = [0, 1, 2].map((axis) => camera.pan[axis] + (camera.targetPan[axis] - camera.pan[axis]) * damping);

      const upWorld = quatRotateVector(camera.quat, [0, 1, 0]);
      const eye = quatRotateVector(camera.quat, [0, 0, camera.distance]).map((value, axis) => value + camera.pan[axis]);
      const target = camera.pan;
      const projection = M.perspective(Math.PI / 4.1, resize(), 0.05, 30);
      const view = M.lookAt(eye, target, upWorld);
      const idleTilt = reduceMotion.matches ? 0 : Math.sin(time * 0.42) * 0.008;
      const viewerMatrix = M.multiply(M.rotationZ(idleTilt), viewerBase);

      skin.joints.forEach((nodeIndex, jointIndex) => {
        const inverseBind = inverseBindData.subarray(jointIndex * 16, jointIndex * 16 + 16);
        jointMatrices.set(M.multiply(worldMatrices[nodeIndex], inverseBind), jointIndex * 16);
      });
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, boneTexture);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 4, skin.joints.length, gl.RGBA, gl.FLOAT, jointMatrices);

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(skinProgram);
      gl.uniformMatrix4fv(skinUniforms.projection, false, projection);
      gl.uniformMatrix4fv(skinUniforms.view, false, view);
      gl.uniformMatrix4fv(skinUniforms.viewer, false, viewerMatrix);
      gl.uniform1i(skinUniforms.bones, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, skinTexture);
      gl.uniform1i(skinUniforms.skinTexture, 1);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, nailTexture);
      gl.uniform1i(skinUniforms.nailTexture, 2);
      gl.uniform1i(skinUniforms.nailFinish, activeFinishCode);
      gl.bindVertexArray(skinVao);
      gl.drawElements(gl.TRIANGLES, indexData.length, skinIndexType, 0);
      gl.bindVertexArray(null);
      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
    return { setDesign, action, jointCount: skin.joints.length, nailCount: nailRegionNames.length };
  }

  createViewer()
    .then((api) => {
      viewerApi = api;
      loadingState.classList.add("is-hidden");
      status.textContent = `Ready · ${api.jointCount}-joint rig · ${api.nailCount} nail regions`;
    })
    .catch((error) => {
      console.error(error);
      showFallback(error.message);
    });
})();

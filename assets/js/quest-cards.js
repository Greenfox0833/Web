(() => {
  const cards = document.querySelectorAll(".quest-category-card[data-quest-src]");
  if (!cards.length) {
    return;
  }

  const base = document.body.dataset.base || "";
  const prefix = base ? `${base}/` : "";

  const resolvePath = (path) => {
    if (!path) {
      return "";
    }
    if (/^(https?:)?\/\//.test(path)) {
      return path;
    }
    if (path.startsWith("../") || path.startsWith("./")) {
      return path;
    }
    return `${prefix}${path}`;
  };

  const applyCardSkin = (card, data) => {
    const bannerImage = resolvePath(data.bannerImage);
    const bannerBg = data.bannerBg || data.bannerGradient || "";
    if (bannerImage) {
      card.style.setProperty("--quest-cover", `url("${bannerImage}")`);
    }
    if (bannerBg) {
      card.style.setProperty("--quest-banner-bg", bannerBg);
    }
  };

  cards.forEach((card) => {
    const src = card.dataset.questSrc || "";
    if (!src) {
      return;
    }
    fetch(`${prefix}${src}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data) {
          return;
        }
        applyCardSkin(card, data);
      })
      .catch(() => {});
  });
})();

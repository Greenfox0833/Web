(() => {
  const root = document.querySelector("[data-quest-mode][data-quest-type]");
  if (!root) {
    return;
  }

  const mode = root.dataset.questMode;
  const type = root.dataset.questType;
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

  const renderList = (data) => {
    const title = data.title || "Quests";
    const items = Array.isArray(data.items) ? data.items : [];

    root.innerHTML = `
      <h1 class="quest-page-title">${title}</h1>
      <div class="quest-list">
        ${items
          .map((item) => {
            const name = item.name || "";
            const desc = item.desc || "";
            const chip = item.chip || "";
            const chipLabel = item.chipLabel || chip.toUpperCase();
            return `
              <div class="quest-item">
                <div>
                  <p class="quest-name">${name}</p>
                  <p class="quest-desc">${desc}</p>
                </div>
                <span class="quest-chip ${chip}">${chipLabel}</span>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  };

  const renderWeekly = (data) => {
    const title = data.title || "Weekly Quests";
    const expires = data.expires || "";
    const bannerImage = resolvePath(data.bannerImage);
    const bannerAlt = data.bannerAlt || "クエストキャラクター";
    const weeks = Array.isArray(data.weeks) ? data.weeks : [];
    const currentWeek = Number(data.currentWeek || 0);

    if (Number.isFinite(currentWeek)) {
      root.dataset.currentWeek = String(currentWeek);
    }

    root.innerHTML = `
      <section class="quest-detail-banner-wrap">
        <div class="quest-detail-banner">
          <div class="quest-detail-banner-text">
            <h1 class="quest-detail-banner-title">${title}</h1>
            <p class="quest-detail-banner-label">${expires}</p>
          </div>
        </div>
        ${
          bannerImage
            ? `<img class="quest-detail-banner-art" src="${bannerImage}" alt="${bannerAlt}">`
            : ""
        }
      </section>
      ${weeks
        .map((week) => {
          const weekNumber = Number(week.week || 0);
          const label = week.label || `ウィーク${weekNumber || ""}`;
          const tasks = Array.isArray(week.tasks) ? week.tasks : [];
          return `
            <details class="quest-week" data-week="${weekNumber}">
              <summary>${label}</summary>
              <div class="quest-task-list">
                ${tasks
                  .map((task) => {
                    const taskTitle = task.title || "";
                    const taskStart = task.start || "";
                    const taskXp = task.xp || "";
                    const icon = resolvePath(task.icon);
                    const iconAlt = task.iconAlt || "XP";
                    return `
                      <article class="quest-task-card" data-start="${taskStart}">
                        <div class="quest-task-body">
                          <p class="quest-task-title">${taskTitle}</p>
                          <p class="quest-task-date"></p>
                        </div>
                        <div class="quest-task-side">
                          ${
                            icon
                              ? `<img class="quest-task-icon" src="${icon}" width="48" height="48" alt="${iconAlt}">`
                              : ""
                          }
                          <span class="quest-task-xp">${taskXp}</span>
                        </div>
                      </article>
                    `;
                  })
                  .join("")}
              </div>
            </details>
          `;
        })
        .join("")}
    `;
  };

  fetch(`${prefix}assets/data/quests/${mode}_${type}.json`)
    .then((response) => response.json())
    .then((data) => {
      if (!data) {
        root.innerHTML = "<p class=\"quest-empty\">クエストがまだありません</p>";
        return;
      }
      if (data.layout === "weekly") {
        renderWeekly(data);
        return;
      }
      renderList(data);
    })
    .catch(() => {
      root.innerHTML = "<p class=\"quest-empty\">読み込みに失敗しました</p>";
    });
})();

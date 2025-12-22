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

  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1);
    const day = String(date.getDate());
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
  };

  const applyListLocks = () => {
    const now = new Date();
    root.querySelectorAll(".quest-item[data-start]").forEach((item) => {
      const startRaw = item.dataset.start || "";
      if (!startRaw) {
        return;
      }
      const startAt = new Date(startRaw);
      if (Number.isNaN(startAt.getTime())) {
        return;
      }
      const dateLabel = item.querySelector(".quest-item-date");
      if (now < startAt) {
        item.classList.add("is-locked");
        if (dateLabel) {
          dateLabel.textContent = `公開日: ${formatDateTime(startAt)}`;
        }
      } else {
        item.classList.remove("is-locked");
        if (dateLabel) {
          dateLabel.textContent = "";
        }
      }
    });
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
            const start = item.start || "";
            const startAttr = start ? ` data-start="${start}"` : "";
            return `
              <div class="quest-item"${startAttr}>
                <div>
                  <p class="quest-name">${name}</p>
                  <p class="quest-desc">${desc}</p>
                  ${start ? `<p class="quest-item-date quest-task-date"></p>` : ""}
                </div>
                <span class="quest-chip ${chip}">${chipLabel}</span>
              </div>
            `;
          })
          .join("")}
      </div>
    `;

    applyListLocks();
  };

  const renderWeekly = (data) => {
    const title = data.title || "Weekly Quests";
    const expires = data.expires || "";
    const bannerImage = resolvePath(data.bannerImage);
    const bannerAlt = data.bannerAlt || "クエストキャラクター";
    const bannerBg = data.bannerBg || data.bannerGradient || "";
    const weeks = Array.isArray(data.weeks) ? data.weeks : [];
    const currentWeek = Number(data.currentWeek || 0);

    if (Number.isFinite(currentWeek)) {
      root.dataset.currentWeek = String(currentWeek);
    }

    const resolveWeekStart = (tasks) => {
      let earliest = null;
      let earliestRaw = "";
      tasks.forEach((task) => {
        const start = task.start || "";
        if (!start) {
          return;
        }
        const date = new Date(start);
        if (Number.isNaN(date.getTime())) {
          return;
        }
        if (!earliest || date < earliest) {
          earliest = date;
          earliestRaw = start;
        }
      });
      return earliestRaw;
    };

    root.innerHTML = `
      <section class="quest-detail-banner-wrap">
        <div class="quest-detail-banner" ${
          bannerBg ? `style="--quest-banner-bg: ${bannerBg};"` : ""
        }>
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
          const weekStart = resolveWeekStart(tasks);
          return `
            <details class="quest-week" data-week="${weekNumber}" data-week-start="${weekStart}">
              <summary>
                <span class="quest-week-title">${label}</span>
                <span class="quest-week-meta" aria-live="polite"></span>
              </summary>
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

    root.dispatchEvent(
      new CustomEvent("quest:weekly-rendered", {
        bubbles: true,
        detail: { currentWeek },
      })
    );
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

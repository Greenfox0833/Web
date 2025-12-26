(() => {
  const root = document.querySelector("[data-quest-mode][data-quest-type]");
  if (!root) {
    return;
  }

  const mode = root.dataset.questMode;
  const type = root.dataset.questType;
  const base = document.body.dataset.base || "";
  const prefix = base ? `${base}/` : "";
  const bannerScale = root.dataset.questBannerScale;
  if (bannerScale) {
    const trimmed = bannerScale.trim();
    if (/^\d*\.?\d+$/.test(trimmed)) {
      root.style.setProperty("--quest-banner-scale", trimmed);
    }
  }

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

  const normalizeIcons = (iconValue) => {
    if (!iconValue) {
      return [];
    }
    if (Array.isArray(iconValue)) {
      return iconValue.filter(Boolean).map((value) => resolvePath(value));
    }
    if (typeof iconValue === "string") {
      return [resolvePath(iconValue)];
    }
    return [];
  };

  const renderQuestText = (text) => {
    if (!text) {
      return "";
    }
    return String(text).replace(
      /<img\s+id=(["']?)([^"'\s/>]+)\1\s*\/?>/gi,
      (_match, _quote, iconId) => {
        const src = resolvePath(`assets/img/QuestIcon/${iconId}.png`);
        return `<img class="quest-inline-icon" src="${src}" alt="">`;
      }
    );
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

  const applyTaskRewardRotation = () => {
    root.querySelectorAll(".quest-task-icon[data-icons]").forEach((icon) => {
      const icons = (icon.dataset.icons || "")
        .split("|")
        .map((value) => value.trim())
        .filter(Boolean);
      if (icons.length < 2) {
        return;
      }
      let index = 0;
      icon.src = icons[index];
      const intervalMs = Number(icon.dataset.iconInterval || 2500);
      setInterval(() => {
        index = (index + 1) % icons.length;
        icon.src = icons[index];
      }, intervalMs);
    });
  };

  const applyWeekControls = () => {
    const controls = root.querySelector(".quest-week-controls");
    if (!controls) {
      return;
    }
    const toggleWeeks = (shouldOpen) => {
      root.querySelectorAll(".quest-week").forEach((section) => {
        if (section.classList.contains("is-locked")) {
          return;
        }
        section.open = shouldOpen;
      });
    };
    controls.querySelectorAll("[data-quest-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.questToggle;
        toggleWeeks(action === "open");
      });
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
                  <p class="quest-name">${renderQuestText(name)}</p>
                  <p class="quest-desc">${renderQuestText(desc)}</p>
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
      <div class="quest-week-controls" role="group" aria-label="クエストをまとめて開閉">
        <button class="btn ghost" type="button" data-quest-toggle="close">全部閉じる</button>
        <button class="btn primary" type="button" data-quest-toggle="open">全部開く</button>
      </div>
      ${weeks
        .map((week) => {
          const weekNumber = Number(week.week || 0);
          const label = week.label || `ウィーク${weekNumber || ""}`;
          const tasks = Array.isArray(week.tasks) ? week.tasks : [];
          const weekStart = resolveWeekStart(tasks);
          return `
            <details class="quest-week" data-week="${weekNumber}" data-week-start="${weekStart}" open>
              <summary>
                <span class="quest-week-title">${label}</span>
                <span class="quest-week-meta" aria-live="polite"></span>
              </summary>
              <div class="quest-task-list">
                ${tasks
                  .map((task) => {
                    const taskTitle = renderQuestText(task.title || "");
                    const taskStart = task.start || "";
                    const taskXp = task.xp || "";
                    const icons = normalizeIcons(task.icon);
                    const iconAlt = task.iconAlt || "XP";
                    const iconSrc = icons[0] || "";
                    const iconData =
                      icons.length > 1
                        ? ` data-icons="${icons.join("|")}" data-icon-interval="2500"`
                        : "";
                    return `
                      <article class="quest-task-card" data-start="${taskStart}">
                        <div class="quest-task-body">
                          <p class="quest-task-title">${taskTitle}</p>
                          <p class="quest-task-date"></p>
                        </div>
                        <div class="quest-task-side">
                          ${
                            iconSrc
                              ? `<img class="quest-task-icon" src="${iconSrc}" width="48" height="48" alt="${iconAlt}"${iconData}>`
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

    applyTaskRewardRotation();
    applyWeekControls();

    root.dispatchEvent(
      new CustomEvent("quest:weekly-rendered", {
        bubbles: true,
        detail: { currentWeek },
      })
    );
  };

  const uniqueList = (items) => [...new Set(items.filter(Boolean))];
  const toTitle = (value) =>
    value ? `${value[0].toUpperCase()}${value.slice(1).toLowerCase()}` : "";

  const loadQuestData = (paths) => {
    if (!paths.length) {
      return Promise.reject(new Error("Quest data not found"));
    }
    const [current, ...rest] = paths;
    return fetch(current)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Quest data not found");
        }
        return response.json();
      })
      .catch((error) => {
        if (!rest.length) {
          throw error;
        }
        return loadQuestData(rest);
      });
  };

  const fileModes = uniqueList([mode, mode.toLowerCase()]);
  const fileTypes = uniqueList([type, type.toLowerCase(), toTitle(type)]);
  const folderModes = uniqueList([mode, mode.toUpperCase(), toTitle(mode)]);
  const fileNames = fileModes.flatMap((modePart) =>
    fileTypes.map((typePart) => `${modePart}_${typePart}.json`)
  );
  const candidates = [
    ...fileNames.map((name) => `${prefix}assets/data/quests/${name}`),
    ...folderModes.flatMap((folder) =>
      fileNames.map((name) => `${prefix}assets/data/quests/${folder}/${name}`)
    ),
  ];

  loadQuestData(candidates)
    .then((data) => {
      if (!data) {
        root.innerHTML = '<p class="quest-empty">クエストがまだありません</p>';
        return;
      }
      if (data.layout === "weekly") {
        renderWeekly(data);
        return;
      }
      renderList(data);
    })
    .catch(() => {
      root.innerHTML = '<p class="quest-empty">読み込みに失敗しました</p>';
    });

})();




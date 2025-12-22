(() => {
  const page = document.querySelector(".quest-detail-page");
  if (!page) {
    return;
  }

  let now = new Date();

  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1);
    const day = String(date.getDate());
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
  };

  const formatCountdown = (target, baseTime) => {
    const diffMs = target.getTime() - baseTime.getTime();
    if (diffMs <= 0) {
      return "追加済み";
    }
    const totalMinutes = Math.floor(diffMs / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    if (days >= 1) {
      return `追加まであと ${days}日 ${hours}時間${minutes}分`;
    }
    if (hours >= 1) {
      return `追加まであと ${hours}時間${minutes}分`;
    }
    if (totalMinutes >= 1) {
      return `追加まであと ${minutes}分`;
    }
    return "まもなく追加";
  };

  const runSchedule = () => {
    const currentWeek = Number(page.dataset.currentWeek || "0");
    const lockedWeeks = [];

    page.querySelectorAll(".quest-week[data-week]").forEach((section) => {
      const week = Number(section.dataset.week || "0");
      const summary = section.querySelector("summary");
      const meta = section.querySelector(".quest-week-meta");
      const weekStartRaw = section.dataset.weekStart || "";
      const weekStart = weekStartRaw ? new Date(weekStartRaw) : null;
      if (week > currentWeek) {
        section.classList.add("is-locked");
        section.open = false;
        if (summary) {
          summary.addEventListener("click", (event) => {
            if (section.classList.contains("is-locked")) {
              event.preventDefault();
            }
          });
        }
        if (meta) {
          lockedWeeks.push({
            meta,
            start: weekStart && !Number.isNaN(weekStart.getTime()) ? weekStart : null,
          });
        }
      }
    });

    const updateLockedLabels = () => {
      now = new Date();
      lockedWeeks.forEach((item) => {
        if (!item.start) {
          item.meta.textContent = "追加日未定";
          return;
        }
        item.meta.textContent = formatCountdown(item.start, now);
      });
    };

    if (lockedWeeks.length > 0) {
      updateLockedLabels();
      window.setInterval(updateLockedLabels, 60000);
    }

    page.querySelectorAll(".quest-task-card[data-start]").forEach((card) => {
      const startRaw = card.dataset.start;
      if (!startRaw) {
        return;
      }

      const startAt = new Date(startRaw);
      if (Number.isNaN(startAt.getTime())) {
        return;
      }

      if (now < startAt) {
        card.classList.add("is-locked");
        const dateLabel = card.querySelector(".quest-task-date");
        if (dateLabel) {
          dateLabel.textContent = `公開日: ${formatDateTime(startAt)}`;
        }
      } else {
        card.classList.remove("is-locked");
        const dateLabel = card.querySelector(".quest-task-date");
        if (dateLabel) {
          dateLabel.textContent = "";
        }
      }
    });

  };

  const tryStart = () => {
    if (page.dataset.scheduleReady === "1") {
      return true;
    }
    const hasWeek = page.querySelector(".quest-week[data-week]");
    if (!hasWeek) {
      return false;
    }
    page.dataset.scheduleReady = "1";
    runSchedule();
    return true;
  };

  tryStart();
  document.addEventListener("quest:weekly-rendered", () => {
    tryStart();
  });
})();

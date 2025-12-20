(() => {
  const page = document.querySelector(".quest-detail-page");
  if (!page) {
    return;
  }

  const currentWeek = Number(page.dataset.currentWeek || "0");
  const now = new Date();

  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1);
    const day = String(date.getDate());
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
  };

  document.querySelectorAll(".quest-detail-section[data-week]").forEach((section) => {
    const week = Number(section.dataset.week || "0");
    if (week > currentWeek + 1) {
      section.hidden = true;
    }
  });

  document.querySelectorAll(".quest-task-card[data-start]").forEach((card) => {
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
})();

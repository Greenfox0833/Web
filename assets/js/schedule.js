(() => {
    const list = document.getElementById("schedule-list");
    if (!list) {
        return;
    }

    const titleEl = document.getElementById("schedule-section-title");
    const noteEl = document.getElementById("schedule-section-note");
    const weekFiltersEl = document.getElementById("schedule-week-filters");
    const base = document.body.dataset.base || "";
    const prefix = base ? `${base}/` : "";
    const dataUrl = `${prefix}assets/data/schedule.json`;
    const tournamentUrl = `${prefix}assets/data/calendar_by_date.json`;

    const buildTag = (tag, extraClass) => {
        const span = document.createElement("span");
        span.className = "timeline-tag";
        if (extraClass) {
            span.classList.add(extraClass);
        }
        span.textContent = tag && tag.name ? tag.name : "";
        if (tag && tag.color) {
            span.style.setProperty("--tag-color", tag.color);
            if (isLightColor(tag.color)) {
                span.style.color = "#0b0b10";
            }
        }
        return span;
    };

    const isLightColor = (value) => {
        const hex = normalizeHexColor(value);
        if (!hex) {
            return false;
        }
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        return luminance > 0.7;
    };

    const normalizeHexColor = (value) => {
        if (!value) {
            return "";
        }
        const trimmed = String(value).trim();
        const hex = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
        if (/^[0-9a-fA-F]{3}$/.test(hex)) {
            return hex
                .split("")
                .map((char) => char + char)
                .join("");
        }
        if (/^[0-9a-fA-F]{6}$/.test(hex)) {
            return hex;
        }
        return "";
    };

    const resolveModeTags = (modes, modeConfig) => {
        if (!Array.isArray(modes)) {
            return [];
        }
        return modes
            .map((mode) => {
                if (!mode) {
                    return null;
                }
                if (typeof mode === "string") {
                    const config = modeConfig && modeConfig[mode] ? modeConfig[mode] : null;
                    return {
                        name: config && config.label ? config.label : mode,
                        color: config && config.color ? config.color : "",
                    };
                }
                const name = mode.name || mode.label;
                if (!name) {
                    return null;
                }
                return {
                    name,
                    color: mode.color || "",
                };
            })
            .filter(Boolean);
    };

    const buildItem = (item) => {
        const row = document.createElement("div");
        row.className = "timeline-item";
        if (item && item.leftColor) {
            row.style.setProperty("--timeline-accent", item.leftColor);
        }

        const main = document.createElement("div");
        main.className = "timeline-main";

        const time = document.createElement("p");
        time.className = "timeline-date";
        time.textContent = item && item.time ? item.time : "";

        const info = document.createElement("div");
        info.className = "timeline-info";

        if (item && Array.isArray(item.modeTags) && item.modeTags.length > 0) {
            const modeWrap = document.createElement("div");
            modeWrap.className = "timeline-mode-tags";
            item.modeTags.forEach((mode) => {
                if (!mode) {
                    return;
                }
                if (typeof mode === "string") {
                    modeWrap.appendChild(buildTag({ name: mode }, "mode"));
                    return;
                }
                if (mode.name) {
                    modeWrap.appendChild(buildTag(mode, "mode"));
                }
            });
            if (modeWrap.childElementCount > 0) {
                info.appendChild(modeWrap);
            }
        }

        const title = document.createElement("p");
        title.className = "timeline-title";
        title.textContent = item && item.title ? item.title : "";

        info.appendChild(title);
        main.append(time, info);
        row.appendChild(main);

        const tagsWrap = document.createElement("div");
        tagsWrap.className = "timeline-tags";
        if (item && Array.isArray(item.tags)) {
            item.tags.forEach((tag) => {
                if (!tag || !tag.name) {
                    return;
                }
                tagsWrap.appendChild(buildTag(tag));
            });
        }
        if (tagsWrap.childElementCount > 0) {
            row.appendChild(tagsWrap);
        }

        return row;
    };

    const buildDay = (day) => {
        const section = document.createElement("section");
        section.className = "tournament-day";

        const head = document.createElement("div");
        head.className = "tournament-day-head";

        const date = document.createElement("h2");
        date.className = "tournament-date";
        date.textContent = day && day.label ? day.label : "";

        const count = document.createElement("p");
        count.className = "tournament-count";
        const total = Array.isArray(day && day.items) ? day.items.length : 0;
        count.textContent = `${total}件`;

        head.append(date, count);

        const listWrap = document.createElement("div");
        listWrap.className = "timeline-list";

        if (Array.isArray(day && day.items)) {
            day.items.forEach((item) => {
                listWrap.appendChild(buildItem(item));
            });
        }

        section.append(head, listWrap);
        return section;
    };

    const formatMonthDay = (value) => {
        if (!value) {
            return "";
        }
        const parts = value.split("-");
        if (parts.length !== 3) {
            return value;
        }
        const month = Number(parts[1]);
        const day = Number(parts[2]);
        if (Number.isNaN(month) || Number.isNaN(day)) {
            return value;
        }
        return `${month}月${day}日`;
    };

    const formatTime = (start) => {
        if (start) {
            return start;
        }
        return "時間未定";
    };

    const getDayStart = (dateKey) => {
        if (!dateKey) {
            return null;
        }
        const parts = dateKey.split("-");
        if (parts.length !== 3) {
            return null;
        }
        const year = Number(parts[0]);
        const month = Number(parts[1]);
        const day = Number(parts[2]);
        if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
            return null;
        }
        return new Date(year, month - 1, day);
    };

    const parseTime = (value) => {
        if (!value) {
            return null;
        }
        const match = String(value).match(/^(\d{1,2}):(\d{2})$/);
        if (!match) {
            return null;
        }
        const hour = Number(match[1]);
        const minute = Number(match[2]);
        if (Number.isNaN(hour) || Number.isNaN(minute)) {
            return null;
        }
        return { hour, minute };
    };

    const timeToMinutes = (value) => {
        const parts = parseTime(value);
        if (!parts) {
            return null;
        }
        return parts.hour * 60 + parts.minute;
    };

    const sortItemsByTime = (items) => {
        if (!Array.isArray(items)) {
            return items;
        }
        return items.slice().sort((a, b) => {
            const aMinutes = timeToMinutes(a && a.time ? a.time : "");
            const bMinutes = timeToMinutes(b && b.time ? b.time : "");
            if (aMinutes === null && bMinutes === null) {
                return 0;
            }
            if (aMinutes === null) {
                return 1;
            }
            if (bMinutes === null) {
                return -1;
            }
            return aMinutes - bMinutes;
        });
    };

    const isPastItem = (dateKey, time) => {
        const dayStart = getDayStart(dateKey);
        if (!dayStart) {
            return false;
        }
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (dayStart < todayStart) {
            return true;
        }
        if (dayStart > todayStart) {
            return false;
        }
        const timeParts = parseTime(time);
        if (!timeParts) {
            return false;
        }
        const itemDateTime = new Date(
            dayStart.getFullYear(),
            dayStart.getMonth(),
            dayStart.getDate(),
            timeParts.hour,
            timeParts.minute,
        );
        return itemDateTime < now;
    };

    const getMonthWeek = (dateKey) => {
        if (!dateKey) {
            return null;
        }
        const parts = dateKey.split("-");
        if (parts.length !== 3) {
            return null;
        }
        const year = Number(parts[0]);
        const month = Number(parts[1]);
        const day = Number(parts[2]);
        if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
            return null;
        }
        const firstDay = new Date(year, month - 1, 1);
        const mondayOffset = (firstDay.getDay() + 6) % 7;
        const weekIndex = Math.floor((day - 1 + mondayOffset) / 7) + 1;
        return {
            key: `${year}-${String(month).padStart(2, "0")}-w${weekIndex}`,
            label: `${month}月第${weekIndex}週`,
        };
    };

    const mergeDays = (scheduleData, tournamentData) => {
        const dayMap = new Map();
        let orderSeed = 0;

        const registerDay = (day) => {
            if (!day || !day.key) {
                return;
            }
            if (!dayMap.has(day.key)) {
                day.order = orderSeed;
                orderSeed += 1;
                dayMap.set(day.key, day);
            }
        };

        if (scheduleData && Array.isArray(scheduleData.days)) {
            scheduleData.days.forEach((day) => {
                const dateKey = day && day.dateKey ? day.dateKey : "";
                const label = day && day.date ? day.date : formatMonthDay(dateKey);
                const items = Array.isArray(day && day.items) ? day.items : [];
                const key = dateKey || `custom-${orderSeed}`;
                registerDay({
                    key,
                    label,
                    items: sortItemsByTime(items),
                    sortKey: dateKey,
                });
            });
        }
        if (scheduleData && scheduleData.schedule && typeof scheduleData.schedule === "object") {
            Object.keys(scheduleData.schedule).forEach((dateKey) => {
                const entries = scheduleData.schedule[dateKey];
                const items = Array.isArray(entries)
                    ? entries.map((entry) => {
                        const tagName = entry && entry.tag ? entry.tag : "";
                        const tagColor = scheduleData.tags && scheduleData.tags[tagName]
                            ? scheduleData.tags[tagName].color
                            : "";
                        const modeTags = resolveModeTags(
                            entry && Array.isArray(entry.modes) ? entry.modes : [],
                            scheduleData.modeTags || null,
                        );
                        return {
                            time: entry && entry.time ? entry.time : "",
                            title: entry && entry.title ? entry.title : "",
                            leftColor: entry && entry.leftColor ? entry.leftColor : "",
                            modeTags,
                            tags: tagName
                                ? [{ name: tagName, color: tagColor }]
                                : [],
                        };
                    })
                    : [];
                registerDay({
                    key: dateKey,
                    label: formatMonthDay(dateKey),
                    items: sortItemsByTime(items),
                    sortKey: dateKey,
                });
            });
        }

        const tournamentDates = tournamentData && Array.isArray(tournamentData.dates)
            ? tournamentData.dates
            : (tournamentData && Array.isArray(tournamentData.competitiveDates) ? tournamentData.competitiveDates : []);

        tournamentDates.forEach((day) => {
            if (!day || !day.date) {
                return;
            }
            const key = day.date;
            const label = formatMonthDay(key);
            const items = Array.isArray(day.entries)
                ? day.entries.map((entry) => ({
                    time: formatTime(entry.start),
                    title: entry.title || "(タイトル未設定)",
                    tags: [
                        { name: "競技", color: "#2563eb" },
                    ],
                    leftColor: "#2563eb",
                }))
                : [];

            if (!dayMap.has(key)) {
                registerDay({
                    key,
                    label,
                    items: sortItemsByTime(items),
                    sortKey: key,
                });
                return;
            }
            const targetDay = dayMap.get(key);
            if (targetDay && Array.isArray(targetDay.items)) {
                targetDay.items.push(...items);
                targetDay.items = sortItemsByTime(targetDay.items);
                if (!targetDay.sortKey) {
                    targetDay.sortKey = key;
                }
            }
        });

        return Array.from(dayMap.values())
            .filter(Boolean)
            .sort((a, b) => {
                if (a.sortKey && b.sortKey) {
                    return a.sortKey.localeCompare(b.sortKey);
                }
                if (a.sortKey && !b.sortKey) {
                    return -1;
                }
                if (!a.sortKey && b.sortKey) {
                    return 1;
                }
                return (a.order || 0) - (b.order || 0);
            });
    };

    let activeWeekKey = "all";

    const renderList = (days) => {
        list.innerHTML = "";
        days.forEach((day) => {
            list.appendChild(buildDay(day));
        });
    };

    const renderWeekFilters = (days) => {
        if (!weekFiltersEl) {
            return;
        }
        const uniqueWeeks = [];
        const seen = new Set();
        days.forEach((day) => {
            if (!day.week) {
                return;
            }
            if (!seen.has(day.week.key)) {
                seen.add(day.week.key);
                uniqueWeeks.push(day.week);
            }
        });

        weekFiltersEl.innerHTML = "";

        const makeButton = (label, key) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "filter-chip";
            if (activeWeekKey === key) {
                button.classList.add("active");
            }
            button.textContent = label;
            button.addEventListener("click", () => {
                activeWeekKey = key;
                renderWeekFilters(days);
                const filtered = activeWeekKey === "all"
                    ? days
                    : days.filter((day) => day.week && day.week.key === activeWeekKey);
                renderList(filtered);
            });
            return button;
        };

        weekFiltersEl.appendChild(makeButton("すべて", "all"));
        uniqueWeeks.forEach((week) => {
            weekFiltersEl.appendChild(makeButton(week.label, week.key));
        });
    };

    const render = (scheduleData, tournamentData) => {
        const mergedDays = mergeDays(scheduleData, tournamentData)
            .map((day) => {
                const items = Array.isArray(day.items)
                    ? day.items.filter((item) => !isPastItem(day.key, item && item.time))
                    : [];
                const week = getMonthWeek(day.key);
                return { ...day, items, week };
            })
            .filter((day) => day.items.length > 0);
        if (mergedDays.length === 0) {
            list.innerHTML = "<p class=\"tournament-empty\">データがまだありません。</p>";
            return;
        }
        if (titleEl && scheduleData && scheduleData.sectionTitle) {
            titleEl.textContent = scheduleData.sectionTitle;
        }
        if (noteEl && scheduleData && scheduleData.sectionNote) {
            noteEl.textContent = scheduleData.sectionNote;
        }
        const availableKeys = new Set(mergedDays.map((day) => day.week && day.week.key).filter(Boolean));
        if (activeWeekKey !== "all" && !availableKeys.has(activeWeekKey)) {
            activeWeekKey = "all";
        }
        renderWeekFilters(mergedDays);
        const filteredDays = activeWeekKey === "all"
            ? mergedDays
            : mergedDays.filter((day) => day.week && day.week.key === activeWeekKey);
        renderList(filteredDays);
    };

    Promise.all([
        fetch(dataUrl).then((response) => response.json()).catch(() => null),
        fetch(tournamentUrl).then((response) => response.json()).catch(() => null),
    ])
        .then(([scheduleData, tournamentData]) => {
            render(scheduleData, tournamentData);
        })
        .catch(() => {
            list.innerHTML = "<p class=\"tournament-empty\">読み込みに失敗しました。</p>";
        });
})();

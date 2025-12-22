(() => {
    const applyBaseLinks = (root) => {
        const base = document.body.dataset.base || "";
        const prefix = base ? `${base}/` : "";
        root.querySelectorAll("[data-href]").forEach((el) => {
            const href = el.getAttribute("data-href");
            if (href) {
                el.setAttribute("href", `${prefix}${href}`);
            }
        });
    };

    const applyActiveNav = (root) => {
        const page = document.body.dataset.page;
        if (!page) {
            return;
        }
        const link = root.querySelector(`[data-page="${page}"]`);
        if (link) {
            link.classList.add("active");
        }
    };

    const loadInclude = async (container) => {
        const src = container.getAttribute("data-include");
        if (!src) {
            return;
        }
        try {
            const res = await fetch(src);
            if (!res.ok) {
                return;
            }
            const html = await res.text();
            container.innerHTML = html;
            applyBaseLinks(container);
            applyActiveNav(container);
        } catch (_e) {
        }
    };

    const loadAlerts = async () => {
        const page = document.body.dataset.page || "";
        const base = document.body.dataset.base || "";
        const prefix = base ? `${base}/` : "";
        try {
            const res = await fetch(`${prefix}assets/data/alerts.json`);
            if (!res.ok) {
                return;
            }
            const data = await res.json();
            const alerts = [];
            if (Array.isArray(data && data.all)) {
                alerts.push(...data.all);
            }
            if (data && data.pages && Array.isArray(data.pages[page])) {
                alerts.push(...data.pages[page]);
            }
            if (alerts.length === 0) {
                return;
            }
            const main = document.querySelector("main.page") || document.querySelector("main") || document.body;
            const stack = document.createElement("div");
            stack.className = "alert-stack";
            alerts.forEach((message) => {
                if (!message) {
                    return;
                }
                const item = document.createElement("div");
                item.className = "alert-banner";
                item.textContent = String(message);
                stack.appendChild(item);
            });
            if (stack.childElementCount > 0) {
                main.prepend(stack);
            }
        } catch (_e) {
        }
    };

    const init = () => {
        document.querySelectorAll("[data-include]").forEach((container) => {
            loadInclude(container);
        });
        loadAlerts();
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

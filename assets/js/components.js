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

    const init = () => {
        document.querySelectorAll("[data-include]").forEach((container) => {
            loadInclude(container);
        });
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();

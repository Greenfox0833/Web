const latestList = document.getElementById("blog-latest-list");
const tagsContainer = document.getElementById("blog-tags");

if (latestList) {
  const maxItems = 6;
  let tagMap = {};

  const normalizeDateTime = (value) => {
    if (typeof value !== "string") {
      return "";
    }
    const trimmed = value.trim();
    if (!trimmed) {
      return "";
    }
    const match = trimmed.match(
      /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})(:\d{2})?(Z|[+-]\d{2}:\d{2})?$/
    );
    if (!match) {
      return trimmed;
    }
    const seconds = match[2] ? match[2] : ":00";
    const zone = match[3] ? match[3] : "";
    return `${match[1]}${seconds}${zone}`;
  };

  const parseDate = (value) => {
    const normalized = normalizeDateTime(value);
    const time = Date.parse(normalized);
    return Number.isFinite(time) ? time : Number.NaN;
  };

  const getPostTime = (post) => {
    const publishTime = parseDate(post.publishAt);
    if (Number.isFinite(publishTime)) {
      return publishTime;
    }
    const dateTime = parseDate(post.date);
    return Number.isFinite(dateTime) ? dateTime : 0;
  };

  const renderTags = (tags) => {
    if (!Array.isArray(tags) || tags.length === 0) {
      return "";
    }
    const tagLabels = tags.map((tag) => tagMap[tag] || tag);
    return `<div class="blog-tags">${tagLabels
      .map((tag) => `<span class="blog-tag">${tag}</span>`)
      .join("")}</div>`;
  };

  const renderLatest = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      latestList.innerHTML = "<p class=\"blog-empty\">記事がまだありません。</p>";
      return;
    }

    const resolvePath = (path) => {
      if (!path) {
        return "blog.html";
      }
      if (/^(https?:)?\/\//.test(path)) {
        return path;
      }
      if (path.startsWith("../") || path.startsWith("./")) {
        return path;
      }
      return `../../../${path}`;
    };

    latestList.innerHTML = items
      .map((post) => {
        const title = post.title || "Untitled";
        const date = post.date || "";
        const category = post.category || "";
        const cover = post.cover || "";
        const id = post.id || "";
        const tags = Array.isArray(post.tags) ? post.tags : [];
        const rawPath = post.path || (id ? `blog/posts/${id}/index.html` : "blog.html");
        const path = resolvePath(rawPath);

        return `
          <a class="latest-link" href="${path}">
            ${cover ? `<img class="latest-thumb" src="${cover}" alt="${title}">` : ""}
            <p class="latest-title">${title}</p>
            ${renderTags(tags)}
            <p class="latest-meta">${date} / ${category}</p>
          </a>
        `;
      })
      .join("");
  };

  Promise.all([
    fetch("../../../assets/data/blog.json").then((response) => response.json()),
    fetch("../../../assets/data/tags.json")
      .then((response) => response.json())
      .catch(() => ({})),
  ])
    .then(([data, tags]) => {
      tagMap = tags && typeof tags === "object" ? tags : {};
      const now = Date.now();
      const posts = Array.isArray(data)
        ? data.filter((post) => {
            if (!post.publishAt) {
              return true;
            }
            const publishTime = parseDate(post.publishAt);
            return Number.isFinite(publishTime) ? publishTime <= now : true;
          })
        : [];

      posts.sort((a, b) => getPostTime(b) - getPostTime(a));
      renderLatest(posts.slice(0, maxItems));

      if (tagsContainer) {
        const currentPath = window.location.pathname.replace(/\\/g, "/");
        const currentPost = posts.find(
          (post) => post.path && currentPath.endsWith(post.path)
        );
        tagsContainer.innerHTML = renderTags(currentPost ? currentPost.tags : []);
      }
    })
    .catch(() => {
      latestList.innerHTML = "<p class=\"blog-empty\">読み込みに失敗しました。</p>";
      if (tagsContainer) {
        tagsContainer.innerHTML = "";
      }
    });
}

const list = document.getElementById("blog-list");
const pagination = document.getElementById("blog-pagination");
const filters = document.getElementById("blog-filters");
const pageSize = 15;
let posts = [];
let filteredPosts = [];
let currentPage = 1;
let tagMap = {};
let activeTag = "all";

function renderPosts(items) {
  if (!Array.isArray(items) || items.length === 0) {
    list.innerHTML = "<p class=\"blog-empty\">記事がまだありません。</p>";
    pagination.innerHTML = "";
    return;
  }

  list.innerHTML = items
    .map((post) => {
      const title = post.title || "Untitled";
      const date = post.date || "";
      const category = post.category || "";
      const excerpt = post.excerpt || "";
      const cover = post.cover || "";
      const id = post.id || "";
      const tags = Array.isArray(post.tags) ? post.tags : [];
      const path = post.path || (id ? `blog/posts/${id}/index.html` : "blog.html");
      const tagLabels = tags.map((tag) => tagMap[tag] || tag);
      const tagHtml = tagLabels.length
        ? `<div class="blog-tags">${tagLabels
            .map((tag) => `<span class="blog-tag">${tag}</span>`)
            .join("")}</div>`
        : "";

      return `
        <a class="blog-link" href="${path}">
          <article class="blog-card">
            <div class="blog-cover">
              ${cover ? `<img src="${cover}" alt="${title}">` : ""}
            </div>
            <div class="blog-body">
              <p class="blog-meta">${date} / ${category}</p>
              <h3>${title}</h3>
              ${tagHtml}
              <p class="blog-excerpt">${excerpt}</p>
              <span class="blog-read">続きを読む</span>
            </div>
          </article>
        </a>
      `;
    })
    .join("");
}

function renderPagination(total) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) {
    pagination.innerHTML = "";
    return;
  }

  const buttons = [];
  buttons.push(
    `<button class="page-btn" data-page="${Math.max(1, currentPage - 1)}" ${currentPage === 1 ? "disabled" : ""}>前へ</button>`
  );

  for (let i = 1; i <= totalPages; i += 1) {
    buttons.push(
      `<button class="page-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`
    );
  }

  buttons.push(
    `<button class="page-btn" data-page="${Math.min(totalPages, currentPage + 1)}" ${currentPage === totalPages ? "disabled" : ""}>次へ</button>`
  );

  pagination.innerHTML = buttons.join("");
}

function renderPage() {
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  renderPosts(filteredPosts.slice(start, end));
  renderPagination(filteredPosts.length);
}

function buildFilters(items) {
  if (!filters) {
    return;
  }

  const tags = new Set();
  items.forEach((post) => {
    if (Array.isArray(post.tags)) {
      post.tags.forEach((tag) => tags.add(tag));
    }
  });

  if (tags.size === 0) {
    filters.innerHTML = "";
    return;
  }

  const buttons = [
    `<button class="filter-chip ${activeTag === "all" ? "active" : ""}" data-tag="all">全て</button>`,
    ...Array.from(tags).map((tag) => {
      const label = tagMap[tag] || tag;
      const active = activeTag === tag ? "active" : "";
      return `<button class="filter-chip ${active}" data-tag="${tag}">${label}</button>`;
    }),
  ];

  filters.innerHTML = buttons.join("");
}

function applyFilter() {
  if (activeTag === "all") {
    filteredPosts = posts.slice();
  } else {
    filteredPosts = posts.filter(
      (post) => Array.isArray(post.tags) && post.tags.includes(activeTag)
    );
  }
  currentPage = 1;
  renderPage();
}

Promise.all([
  fetch("assets/data/blog.json").then((response) => response.json()),
  fetch("assets/data/tags.json")
    .then((response) => response.json())
    .catch(() => ({})),
])
  .then(([data, tags]) => {
    tagMap = tags && typeof tags === "object" ? tags : {};
    const now = Date.now();
    posts = Array.isArray(data)
      ? data.filter((post) => {
          if (!post.publishAt) {
            return true;
          }
          const publishTime = Date.parse(post.publishAt);
          return Number.isFinite(publishTime) && publishTime <= now;
        })
      : [];
    filteredPosts = posts.slice();
    buildFilters(posts);
    applyFilter();
  })
  .catch(() => {
    list.innerHTML = "<p class=\"blog-empty\">読み込みに失敗しました。</p>";
    pagination.innerHTML = "";
    if (filters) {
      filters.innerHTML = "";
    }
  });

pagination.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }
  const nextPage = Number(target.dataset.page);
  if (!Number.isNaN(nextPage) && nextPage !== currentPage) {
    currentPage = nextPage;
    renderPage();
    pagination.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

if (filters) {
  filters.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }
    const tag = target.dataset.tag;
    if (!tag || tag === activeTag) {
      return;
    }
    activeTag = tag;
    buildFilters(posts);
    applyFilter();
    filters.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

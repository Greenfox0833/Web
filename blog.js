const list = document.getElementById("blog-list");
const pagination = document.getElementById("blog-pagination");
const pageSize = 15;
let posts = [];
let currentPage = 1;

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
      const path = post.path || (id ? `blog/posts/${id}/index.html` : "blog.html");

      return `
        <a class="blog-link" href="${path}">
          <article class="blog-card">
            <div class="blog-cover">
              ${cover ? `<img src="${cover}" alt="${title}">` : ""}
            </div>
            <div class="blog-body">
              <p class="blog-meta">${date} / ${category}</p>
              <h3>${title}</h3>
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
  renderPosts(posts.slice(start, end));
  renderPagination(posts.length);
}

fetch("blog.json")
  .then((response) => response.json())
  .then((data) => {
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
    currentPage = 1;
    renderPage();
  })
  .catch(() => {
    list.innerHTML = "<p class=\"blog-empty\">読み込みに失敗しました。</p>";
    pagination.innerHTML = "";
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

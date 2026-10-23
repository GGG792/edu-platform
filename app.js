/* =========================================================
   用户端逻辑 - 课程展示与视频播放
   ========================================================= */

let currentCategory = "全部";

function initSiteInfo() {
  const settings = getSettings();
  document.getElementById("siteName").textContent = settings.siteName || "云课堂";
  document.title = (settings.siteName || "云课堂") + " - 在线教育平台";
  if (settings.siteSubtitle) {
    document.getElementById("siteSubtitle").textContent = settings.siteSubtitle;
  }
}

function renderCategories() {
  const bar = document.getElementById("categoryBar");
  const cats = ["全部", ...getCategories()];
  bar.innerHTML = cats
    .map(
      (c) =>
        `<span class="cat-chip ${c === currentCategory ? "active" : ""}" data-cat="${c}">${c}</span>`
    )
    .join("");
  bar.querySelectorAll(".cat-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      currentCategory = chip.dataset.cat;
      renderCategories();
      renderCourses();
    });
  });
}

function renderCourses() {
  const grid = document.getElementById("courseGrid");
  const empty = document.getElementById("emptyState");
  let courses = getCourses();

  if (currentCategory !== "全部") {
    courses = courses.filter((c) => c.category === currentCategory);
  }

  if (courses.length === 0) {
    grid.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  grid.innerHTML = courses
    .map(
      (c, i) => `
    <div class="course-card" data-id="${c.id}" style="animation-delay:${i * 0.05}s">
      <img class="course-thumb" src="${c.thumbnail || ''}" alt="${c.title}" onerror="this.style.display='none'" />
      <div class="course-body">
        <span class="course-cat">${c.category || '未分类'}</span>
        <div class="course-title">${c.title}</div>
        <div class="course-desc">${c.description || ''}</div>
        <div class="course-meta">
          <span>⏱ ${c.duration || '未知'}</span>
          <span>▶ 播放</span>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  grid.querySelectorAll(".course-card").forEach((card) => {
    card.addEventListener("click", () => playVideo(card.dataset.id));
  });
}

function playVideo(id) {
  const course = getCourse(id);
  if (!course) return;
  const modal = document.getElementById("videoModal");
  const video = document.getElementById("videoPlayer");
  document.getElementById("modalCat").textContent = course.category || "";
  document.getElementById("modalTitle").textContent = course.title;
  document.getElementById("modalDesc").textContent = course.description || "";
  video.src = course.videoUrl;
  video.play().catch(() => {});
  modal.classList.add("show");
}

document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("videoModal").addEventListener("click", (e) => {
  if (e.target.id === "videoModal") closeModal();
});

function closeModal() {
  const modal = document.getElementById("videoModal");
  const video = document.getElementById("videoPlayer");
  video.pause();
  video.src = "";
  modal.classList.remove("show");
}

function showToast(msg, isError = false) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "toast show" + (isError ? " error" : "");
  setTimeout(() => t.classList.remove("show"), 2500);
}

// 初始化
initSiteInfo();
renderCategories();
renderCourses();

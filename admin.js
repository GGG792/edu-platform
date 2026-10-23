/* =========================================================
   管理后台逻辑 - 登录、课程CRUD、站点设置、数据备份
   ========================================================= */

const ADMIN_SESSION = "edu_admin_logged";

// ---------- 登录 ----------
const loginPage = document.getElementById("loginPage");
const adminPage = document.getElementById("adminPage");
const pwdInput = document.getElementById("pwdInput");
const loginBtn = document.getElementById("loginBtn");

function checkLogin() {
  if (sessionStorage.getItem(ADMIN_SESSION) === "1") {
    loginPage.style.display = "none";
    adminPage.style.display = "grid";
    renderCourseList();
    loadSettings();
    return true;
  }
  loginPage.style.display = "flex";
  adminPage.style.display = "none";
  return false;
}

loginBtn.addEventListener("click", doLogin);
pwdInput.addEventListener("keydown", (e) => { if (e.key === "Enter") doLogin(); });

function doLogin() {
  const settings = getSettings();
  if (pwdInput.value === settings.adminPassword) {
    sessionStorage.setItem(ADMIN_SESSION, "1");
    checkLogin();
    showToast("登录成功");
  } else {
    showToast("密码错误", true);
  }
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  sessionStorage.removeItem(ADMIN_SESSION);
  checkLogin();
  showToast("已退出登录");
});

// ---------- 导航切换 ----------
document.querySelectorAll(".admin-nav a[data-tab]").forEach((a) => {
  a.addEventListener("click", () => {
    document.querySelectorAll(".admin-nav a").forEach((x) => x.classList.remove("active"));
    a.classList.add("active");
    const tab = a.dataset.tab;
    ["courses", "settings", "data"].forEach((t) => {
      document.getElementById("tab-" + t).style.display = t === tab ? "block" : "none";
    });
  });
});

// ---------- 课程管理 ----------
let editingId = null;

function renderCourseList() {
  const courses = getCourses();
  const box = document.getElementById("courseList");
  if (courses.length === 0) {
    box.innerHTML = `<div class="empty-state"><div class="icon">📭</div><p>暂无课程，点击右上角"新增课程"添加</p></div>`;
    return;
  }
  box.innerHTML = `
    <table class="admin-table">
      <thead><tr><th>课程</th><th>分类</th><th>时长</th><th>操作</th></tr></thead>
      <tbody>
        ${courses.map((c) => `
          <tr>
            <td>
              <div class="course-cell">
                <img src="${c.thumbnail || ''}" onerror="this.style.display='none'" />
                <div>
                  <div style="font-weight:600">${c.title}</div>
                  <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${(c.description||'').slice(0,40)}${c.description&&c.description.length>40?'...':''}</div>
                </div>
              </div>
            </td>
            <td>${c.category || '-'}</td>
            <td>${c.duration || '-'}</td>
            <td>
              <div class="action-btns">
                <button class="btn btn-ghost btn-sm" data-edit="${c.id}">编辑</button>
                <button class="btn btn-danger btn-sm" data-del="${c.id}">删除</button>
              </div>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
  box.querySelectorAll("[data-edit]").forEach((b) => {
    b.addEventListener("click", () => openCourseModal(b.dataset.edit));
  });
  box.querySelectorAll("[data-del]").forEach((b) => {
    b.addEventListener("click", () => {
      if (confirm("确定删除该课程吗？")) {
        deleteCourse(b.dataset.del);
        renderCourseList();
        showToast("已删除");
      }
    });
  });
}

document.getElementById("addCourseBtn").addEventListener("click", () => openCourseModal(null));

function openCourseModal(id) {
  editingId = id;
  const modal = document.getElementById("courseModal");
  document.getElementById("courseModalTitle").textContent = id ? "编辑课程" : "新增课程";
  if (id) {
    const c = getCourse(id);
    document.getElementById("fTitle").value = c.title || "";
    document.getElementById("fDesc").value = c.description || "";
    document.getElementById("fVideo").value = c.videoUrl || "";
    document.getElementById("fThumb").value = c.thumbnail || "";
    document.getElementById("fCat").value = c.category || "";
    document.getElementById("fDur").value = c.duration || "";
  } else {
    ["fTitle", "fDesc", "fVideo", "fThumb", "fCat", "fDur"].forEach((f) => (document.getElementById(f).value = ""));
  }
  modal.classList.add("show");
}

document.getElementById("courseModalClose").addEventListener("click", closeCourseModal);
document.getElementById("courseCancelBtn").addEventListener("click", closeCourseModal);
document.getElementById("courseModal").addEventListener("click", (e) => {
  if (e.target.id === "courseModal") closeCourseModal();
});
function closeCourseModal() {
  document.getElementById("courseModal").classList.remove("show");
  editingId = null;
}

document.getElementById("courseSaveBtn").addEventListener("click", () => {
  const data = {
    title: document.getElementById("fTitle").value.trim(),
    description: document.getElementById("fDesc").value.trim(),
    videoUrl: document.getElementById("fVideo").value.trim(),
    thumbnail: document.getElementById("fThumb").value.trim(),
    category: document.getElementById("fCat").value.trim() || "未分类",
    duration: document.getElementById("fDur").value.trim(),
  };
  if (!data.title) return showToast("请填写课程标题", true);
  if (!data.videoUrl) return showToast("请填写视频地址", true);

  if (editingId) {
    updateCourse(editingId, data);
    showToast("课程已更新");
  } else {
    addCourse(data);
    showToast("课程已添加");
  }
  closeCourseModal();
  renderCourseList();
});

// ---------- 站点设置 ----------
function loadSettings() {
  const s = getSettings();
  document.getElementById("setName").value = s.siteName || "";
  document.getElementById("setSubtitle").value = s.siteSubtitle || "";
  document.getElementById("setPwd").value = s.adminPassword || "";
}

document.getElementById("saveSettingsBtn").addEventListener("click", () => {
  const s = getSettings();
  s.siteName = document.getElementById("setName").value.trim() || "云课堂";
  s.siteSubtitle = document.getElementById("setSubtitle").value.trim();
  s.adminPassword = document.getElementById("setPwd").value.trim() || "admin123";
  saveSettings(s);
  showToast("设置已保存");
});

// ---------- 数据备份 ----------
document.getElementById("exportBtn").addEventListener("click", () => {
  const data = {
    courses: getCourses(),
    settings: getSettings(),
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `edu-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("数据已导出");
});

document.getElementById("importFile").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if (data.courses) saveCourses(data.courses);
      if (data.settings) saveSettings(data.settings);
      renderCourseList();
      loadSettings();
      showToast("数据已导入");
    } catch (err) {
      showToast("文件格式错误", true);
    }
  };
  reader.readAsText(file);
  e.target.value = "";
});

document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("确定恢复默认课程吗？当前课程将被覆盖。")) {
    localStorage.removeItem(DATA_KEY);
    initData();
    renderCourseList();
    showToast("已恢复默认课程");
  }
});

// ---------- 提示 ----------
function showToast(msg, isError = false) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "toast show" + (isError ? " error" : "");
  setTimeout(() => t.classList.remove("show"), 2500);
}

// 初始化
checkLogin();

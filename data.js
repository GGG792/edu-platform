/* =========================================================
   数据层 - 基于 localStorage 的课程与设置管理
   供用户端和管理后台共享
   ========================================================= */

const DATA_KEY = "edu_platform_data";
const SETTINGS_KEY = "edu_platform_settings";

// 默认课程数据（首次访问时写入）
const DEFAULT_COURSES = [
  {
    id: "c1",
    title: "Web 前端开发入门",
    description: "从零开始学习 HTML、CSS、JavaScript，掌握现代前端开发基础技能，适合编程初学者。",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=600&h=340&fit=crop",
    category: "编程开发",
    duration: "45 分钟",
    createdAt: Date.now() - 500000,
  },
  {
    id: "c2",
    title: "Python 数据分析实战",
    description: "使用 Pandas、NumPy、Matplotlib 进行数据清洗、分析与可视化，适合有一定编程基础的学员。",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop",
    category: "数据科学",
    duration: "60 分钟",
    createdAt: Date.now() - 400000,
  },
  {
    id: "c3",
    title: "UI/UX 设计基础",
    description: "学习用户界面与用户体验设计原则，掌握 Figma 基本操作，做出美观易用的设计作品。",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b8?w=600&h=340&fit=crop",
    category: "设计创意",
    duration: "38 分钟",
    createdAt: Date.now() - 300000,
  },
  {
    id: "c4",
    title: "英语口语提升",
    description: "通过情景对话和常用表达训练，快速提升英语口语流利度，适合有一定基础的英语学习者。",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnail: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&h=340&fit=crop",
    category: "语言学习",
    duration: "30 分钟",
    createdAt: Date.now() - 200000,
  },
  {
    id: "c5",
    title: "商业摄影技巧",
    description: "学习商业摄影的用光、构图与后期处理，拍出具有专业质感的产品与人像照片。",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnail: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=340&fit=crop",
    category: "设计创意",
    duration: "52 分钟",
    createdAt: Date.now() - 100000,
  },
  {
    id: "c6",
    title: "高效时间管理",
    description: "掌握番茄工作法、GTD 等时间管理方法，提升工作与学习效率，告别拖延症。",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    thumbnail: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&h=340&fit=crop",
    category: "个人成长",
    duration: "28 分钟",
    createdAt: Date.now() - 50000,
  },
];

const DEFAULT_SETTINGS = {
  siteName: "云课堂",
  siteSubtitle: "随时随地，想学就学",
  adminPassword: "admin123",
};

// 初始化数据（首次访问）
function initData() {
  if (!localStorage.getItem(DATA_KEY)) {
    localStorage.setItem(DATA_KEY, JSON.stringify(DEFAULT_COURSES));
  }
  if (!localStorage.getItem(SETTINGS_KEY)) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
  }
}

// 获取所有课程
function getCourses() {
  initData();
  return JSON.parse(localStorage.getItem(DATA_KEY) || "[]");
}

// 保存所有课程
function saveCourses(courses) {
  localStorage.setItem(DATA_KEY, JSON.stringify(courses));
}

// 获取单个课程
function getCourse(id) {
  return getCourses().find((c) => c.id === id) || null;
}

// 添加课程
function addCourse(course) {
  const courses = getCourses();
  course.id = course.id || "c" + Date.now();
  course.createdAt = Date.now();
  courses.unshift(course);
  saveCourses(courses);
  return course;
}

// 更新课程
function updateCourse(id, updates) {
  const courses = getCourses();
  const idx = courses.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  courses[idx] = { ...courses[idx], ...updates };
  saveCourses(courses);
  return true;
}

// 删除课程
function deleteCourse(id) {
  const courses = getCourses().filter((c) => c.id !== id);
  saveCourses(courses);
}

// 获取设置
function getSettings() {
  initData();
  return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
}

// 保存设置
function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// 获取所有分类
function getCategories() {
  const courses = getCourses();
  const cats = [...new Set(courses.map((c) => c.category).filter(Boolean))];
  return cats;
}

// 生成 ID
function genId() {
  return "c" + Date.now() + Math.floor(Math.random() * 1000);
}

// ============================================================
// TODOIT! - APP.JS (PHIÊN BẢN COMMENT DỄ HIỂU)
// ============================================================
// Tác giả: Lê Công Minh
// Mô tả: Quản lý task với localStorage, phân trang, CRUD
// ============================================================

// ============================================================
// PHẦN 1: ĐỊNH NGHĨA CẤU TRÚC DỮ LIỆU TASK
// ============================================================

/**
 * Constructor Task - tạo một object task chuẩn
 * @param {number} id - ID duy nhất (dùng timestamp)
 * @param {string} title - Tiêu đề task
 * @param {string} description - Mô tả (có thể trống)
 * @param {string} priority - Low / Medium / High
 * @param {string} dueDate - Ngày đến hạn (ISO string)
 * @param {string} status - todo / in-progress / done
 * @param {string} createdAt - Thời gian tạo (ISO string)
 */
function Task(id, title, description, priority, dueDate, status, createdAt) {
  this.id = id; // ID duy nhất
  this.title = title; // Tiêu đề task
  this.description = description || ""; // Mô tả, mặc định rỗng
  this.priority = priority || "Medium"; // Độ ưu tiên, mặc định Medium
  this.dueDate = dueDate || null; // Ngày đến hạn, có thể null
  this.status = status || "todo"; // Trạng thái: todo, in-progress, done
  this.createdAt = createdAt || new Date().toISOString(); // Thời gian tạo
}

// ============================================================
// PHẦN 2: KHAI BÁO BIẾN TOÀN CỤC VÀ HẰNG SỐ
// ============================================================

const STORAGE_KEY = "todoit_tasks"; // Key lưu trong localStorage
let tasks = []; // Mảng chứa tất cả task (trong bộ nhớ)

// Phân trang cho trang chủ
let homeCurrentPage = 1; // Trang hiện tại (bắt đầu từ 1)
const HOME_TASKS_PER_PAGE = 10; // Mỗi lần load thêm 10 task

// ============================================================
// PHẦN 2.5: QUẢN LÝ NHẠC NỀN TOÀN CỤC (SỬA ĐƯỜNG DẪN TUYỆT ĐỐI)
// ============================================================
let backgroundAudio = null;        // Đối tượng Audio hiện tại
let currentSongId = localStorage.getItem("todoit_current_song") || "song1";
let isMusicPlaying = localStorage.getItem("todoit_music_playing") === "true";

/**
 * playMusic - Phát nhạc với đường dẫn tuyệt đối từ thư mục gốc
 * @param {string} songId - 'song1', 'song2', ... hoặc 'off'
 */
function playMusic(songId) {
  console.log(`🎵 playMusic called with: "${songId}"`);
  if (songId === "off" || !songId) {
    if (backgroundAudio) {
      backgroundAudio.pause();
      backgroundAudio = null;
    }
    isMusicPlaying = false;
    localStorage.setItem("todoit_music_playing", "false");
    localStorage.setItem("todoit_current_song", "off");
    console.log("🔇 Music turned off");
    return;
  }

  // Dừng bài cũ
  if (backgroundAudio) {
    backgroundAudio.pause();
    backgroundAudio = null;
  }

  // Tạo audio mới với đường dẫn tuyệt đối (từ thư mục gốc của dự án)
  const audioSrc = `/assets/music/${songId}.mp3`;
  console.log(`🎵 Loading audio from: ${audioSrc}`);
  const audio = new Audio(audioSrc);
  audio.loop = true;

  // Thêm sự kiện lỗi để biết file có vấn đề gì
  audio.addEventListener("error", (e) => {
    console.error(`❌ Audio error for ${audioSrc}:`, e);
    console.error(
      ` - code: ${audio.error ? audio.error.code : "unknown"}, message: ${audio.error ? audio.error.message : "no detail"}`,
    );
  });

  // Thử phát
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        backgroundAudio = audio;
        currentSongId = songId;
        isMusicPlaying = true;
        localStorage.setItem("todoit_music_playing", "true");
        localStorage.setItem("todoit_current_song", songId);
        console.log(`✅ Now playing: ${songId}`);
      })
      .catch((err) => {
        console.error(`❌ Playback failed for ${audioSrc}:`, err);
        isMusicPlaying = false;
        localStorage.setItem("todoit_music_playing", "false");
        // Thông báo cho người dùng biết cần click vào trang
        if (err.name === "NotAllowedError") {
          alert(
            "Trình duyệt chặn tự động phát nhạc. Hãy click chuột vào bất kỳ đâu trên trang để bật nhạc.",
          );
        }
      });
  } else {
    console.warn("Audio.play() không trả về Promise (trình duyệt cũ)");
  }
}

// Khởi tạo nếu có yêu cầu phát (gọi sau khi load trang)
function initGlobalMusic() {
  if (isMusicPlaying && !backgroundAudio && currentSongId !== "off") {
    playMusic(currentSongId);
  }
}

// Gọi khi có tương tác đầu tiên của người dùng (click chuột bất kỳ)
function enableMusicOnFirstInteraction() {
  const handler = () => {
    if (isMusicPlaying && !backgroundAudio && currentSongId !== "off") {
      playMusic(currentSongId);
    }
    document.removeEventListener("click", handler);
    document.removeEventListener("keydown", handler);
  };
  document.addEventListener("click", handler);
  document.addEventListener("keydown", handler);
}

// Khởi tạo khi load trang
initGlobalMusic();
enableMusicOnFirstInteraction();

// ============================================================
// PHẦN 3: HÀM ĐỌC/GHI LOCALSTORAGE
// ============================================================

/**
 * loadTasksFromStorage - Tải dữ liệu từ localStorage vào mảng tasks
 */
function loadTasksFromStorage() {
  const storedTasks = localStorage.getItem(STORAGE_KEY);
  if (storedTasks) {
    try {
      const parsedTasks = JSON.parse(storedTasks);
      if (Array.isArray(parsedTasks)) {
        // Chuyển đổi từ plain object thành instance của Task
        tasks = parsedTasks.map(
          (taskData) =>
            new Task(
              taskData.id,
              taskData.title,
              taskData.description,
              taskData.priority,
              taskData.dueDate,
              taskData.status,
              taskData.createdAt,
            ),
        );
      } else {
        console.warn("Stored tasks is not an array. Reset to empty.");
        tasks = [];
      }
    } catch (error) {
      console.error("Error parsing tasks:", error);
      tasks = [];
    }
  } else {
    tasks = [];
  }
}

/**
 * saveTasksToStorage - Lưu mảng tasks hiện tại vào localStorage
 */
function saveTasksToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ============================================================
// PHẦN 4: CÁC HÀM CRUD (THÊM, SỬA, XÓA, XÓA TẤT CẢ)
// ============================================================

/**
 * addTask - Thêm task mới vào danh sách
 * @returns {Task} Task vừa tạo
 */
function addTask(title, description, priority, dueDate) {
  const newTask = new Task(
    Date.now(), // ID = thời gian hiện tại (ms)
    title,
    description,
    priority,
    dueDate,
    "todo", // Mặc định trạng thái "todo"
    new Date().toISOString(),
  );
  tasks.push(newTask);
  saveTasksToStorage();
  return newTask;
}

/**
 * deleteTask - Xóa task theo id
 */
function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasksToStorage();
}

/**
 * updateTask - Cập nhật một hoặc nhiều trường của task
 * @param {object} updatedData - Ví dụ: { title: "New title" }
 */
function updateTask(id, updatedData) {
  const taskIndex = tasks.findIndex((task) => task.id === id);
  if (taskIndex !== -1) {
    Object.assign(tasks[taskIndex], updatedData);
    saveTasksToStorage();
  } else {
    console.warn(`Task with ID ${id} not found.`);
  }
}

/**
 * clearAllTasks - Xóa toàn bộ task (phiên bản gốc)
 * (Sẽ bị ghi đè bởi phiên bản nâng cấp ở phần 7)
 */
function clearAllTasks() {
  if (
    confirm(
      "Are you sure you want to clear all tasks? This action cannot be undone.",
    )
  ) {
    tasks = [];
    saveTasksToStorage();
  }
}

// ============================================================
// PHẦN 5: HÀM TIỆN ÍCH (HELPER)
// ============================================================

/**
 * escapeHtml - Bảo vệ chống XSS: chuyển & < > thành mã HTML an toàn
 */
function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>]/g, function (m) {
    if (m === "&") return "&amp;";
    if (m === "<") return "&lt;";
    if (m === ">") return "&gt;";
    return m;
  });
}

/**
 * handleTaskClick - Khi click vào task ở trang chủ, chuyển sang Tasks.html để chỉnh sửa
 */
function handleTaskClick(event) {
  const taskDiv = event.currentTarget;
  const taskId = taskDiv.getAttribute("data-id");
  if (taskId) {
    window.location.href = `pages/Tasks.html?edit=${taskId}`;
  }
}

// ============================================================
// PHẦN 6: RENDER TRANG CHỦ (HOME) - HIỂN THỊ DANH SÁCH TASK
// ============================================================

/**
 * attachHomeTaskClickEvents - Gắn sự kiện click cho từng task trên trang chủ
 */
function attachHomeTaskClickEvents() {
  const taskItems = document.querySelectorAll(".home-task-item");
  taskItems.forEach((item) => {
    item.removeEventListener("click", handleTaskClick); // Tránh trùng lặp
    item.addEventListener("click", handleTaskClick);
  });
}

/**
 * renderTasks - Hiển thị danh sách task trên trang chủ (có phân trang Load More)
 */
function renderTasks() {
  const todoContainer = document.querySelector(".todos");
  const emptyImg = document.querySelector(".empty-image");
  const loadMoreBtn = document.getElementById("loadMoreHome");

  if (!todoContainer) return; // Không phải trang chủ thì thoát

  // Sắp xếp task mới nhất lên đầu
  const sortedTasks = [...tasks].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  // Nếu không có task nào
  if (sortedTasks.length === 0) {
    if (emptyImg) emptyImg.style.display = "block";
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
    todoContainer.innerHTML = "";
    return;
  }

  // Có task -> ẩn ảnh empty
  if (emptyImg) emptyImg.style.display = "none";

  // Tính số lượng task cần hiển thị dựa trên trang hiện tại
  const endIndex = homeCurrentPage * HOME_TASKS_PER_PAGE;
  const tasksToShow = sortedTasks.slice(0, endIndex);

  // Tạo HTML cho các task
  const taskHTML = tasksToShow
    .map(
      (task) => `
        <div class="home-task-item" data-id="${task.id}">
            ${escapeHtml(task.title)}
        </div>
    `,
    )
    .join("");

  todoContainer.innerHTML = taskHTML;

  // Xử lý nút Load more (hiện nếu còn task chưa hiển thị)
  if (loadMoreBtn) {
    loadMoreBtn.style.display = sortedTasks.length > endIndex ? "flex" : "none";
  }

  // Gắn sự kiện click cho từng task
  attachHomeTaskClickEvents();
}

// ============================================================
// PHẦN 7: CÁC HÀM XỬ LÝ SỰ KIỆN CHO TRANG CHỦ
// ============================================================

/**
 * openAddTask - Focus vào ô nhập task và cuộn đến đó (dùng cho sidebar)
 */
function openAddTask() {
  const inputField = document.querySelector(".todos-input");
  if (inputField) {
    inputField.focus();
    inputField.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

/**
 * clearAllTasks - Phiên bản nâng cấp: xóa toàn bộ task và cập nhật giao diện
 * (Ghi đè lên hàm clearAllTasks ở phần 4)
 */
function clearAllTasks() {
  if (
    confirm(
      "⚠️ Are you sure you want to DELETE ALL TASKS? This action cannot be undone.",
    )
  ) {
    tasks = [];
    saveTasksToStorage();
    homeCurrentPage = 1;
    renderTasks(); // Cập nhật lại giao diện
  }
}

let musicModeOn = false; // Biến nhớ trạng thái Music Mode (demo)

/**
 * toggleFocusMode - Bật/tắt chế độ nhạc (chỉ demo màu sắc)
 */
function toggleFocusMode() {
  musicModeOn = !musicModeOn;
  const btn = document.querySelector(".sidebar-content:last-child");
  if (musicModeOn) {
    // Bật nhạc: lấy bài hát hiện tại từ localStorage hoặc mặc định song1
    let song = localStorage.getItem("todoit_current_song");
    if (!song || song === "off") song = "song1";
    playMusic(song);
    if (btn) btn.style.color = "#FF00FF";
  } else {
    // Tắt nhạc: dừng audio
    if (backgroundAudio) {
      backgroundAudio.pause();
      backgroundAudio = null;
    }
    isMusicPlaying = false;
    localStorage.setItem("todoit_music_playing", "false");
    if (btn) btn.style.color = "";
  }
}

/**
 * setupAddTaskButton - Gắn sự kiện cho nút Add Task và phím Enter
 */
function setupAddTaskButton() {
  const addBtn = document.querySelector(".add-button");
  const inputField = document.querySelector(".todos-input");
  if (!addBtn || !inputField) return;

  const handleAdd = () => {
    const title = inputField.value.trim();
    if (title === "") {
      alert("Please enter a task title!");
      return;
    }
    addTask(title, "", "Medium", null);
    inputField.value = "";
    homeCurrentPage = 1; // Về trang đầu để thấy task mới
    renderTasks();
  };

  addBtn.addEventListener("click", handleAdd);
  inputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleAdd();
  });
}

/**
 * setupLoadMoreButton - Gắn sự kiện cho nút "Load more tasks..."
 */
function setupLoadMoreButton() {
  const loadMoreBtn = document.getElementById("loadMoreHome");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      homeCurrentPage++;
      renderTasks();
    });
  }
}

/**
 * setupSidebarButtons - Gắn sự kiện cho 3 nút trong sidebar
 */
function setupSidebarButtons() {
  const btns = document.querySelectorAll(".sidebar-content");
  if (btns.length >= 3) {
    btns[0].onclick = openAddTask; // Add Task
    btns[1].onclick = clearAllTasks; // Clear All
    btns[2].onclick = toggleFocusMode; // Music Mode
  }
}

// ============================================================
// PHẦN 8: KHỞI TẠO TRANG CHỦ
// ============================================================

/**
 * initHomePage - Chạy các bước khởi tạo cho trang index.html
 */
function initHomePage() {
  loadTasksFromStorage(); // 1. Đọc dữ liệu
  setupAddTaskButton(); // 2. Nút Add
  setupLoadMoreButton(); // 3. Load more
  setupSidebarButtons(); // 4. Sidebar
  renderTasks(); // 5. Hiển thị
}

// Khi DOM tải xong, nếu có ô input (.todos-input) thì khởi tạo trang chủ
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".todos-input")) {
    initHomePage();
  }
});

// ============================================================
// PHẦN 9: TRANG TASKS.HTML – CÓ STATUS (TODO/IN-PROGRESS/DONE)
// ============================================================
if (
  window.location.pathname.includes("Tasks.html") ||
  document.querySelector(".searchbox-container-2")
) {
  const TASKS_PER_PAGE = 5;
  let tasksCurrentPage = 1;
  let tasksFilter = { search: "", priority: "all", sortBy: "newest" };
  let filteredSortedTasks = [];

  function getTasks() {
    return tasks;
  }

  function filterTasks() {
    let filtered = [...getTasks()];
    const searchTerm = tasksFilter.search.trim().toLowerCase();
    if (searchTerm)
      filtered = filtered.filter((t) =>
        t.title.toLowerCase().includes(searchTerm),
      );
    if (tasksFilter.priority !== "all")
      filtered = filtered.filter((t) => t.priority === tasksFilter.priority);
    return filtered;
  }

  function sortTasks(list) {
    const sorted = [...list];
    switch (tasksFilter.sortBy) {
      case "newest":
        return sorted.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
      case "oldest":
        return sorted.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        );
      case "priority":
        const order = { High: 3, Medium: 2, Low: 1 };
        return sorted.sort((a, b) => order[b.priority] - order[a.priority]);
      case "alpha":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  }

  function updateFilteredSorted() {
    filteredSortedTasks = sortTasks(filterTasks());
  }

  function setupTaskDelegation() {
    const container = document.querySelector(".task-list-container");
    if (!container) return;
    container.removeEventListener("change", handleTaskChange);
    container.removeEventListener("click", handleTaskClick);
    container.removeEventListener("blur", handleTaskBlur, true);
    container.addEventListener("change", handleTaskChange);
    container.addEventListener("click", handleTaskClick);
    container.addEventListener("blur", handleTaskBlur, true);
  }

  function handleTaskChange(e) {
    const target = e.target;
    const taskDiv = target.closest(".task-item-real");
    if (!taskDiv) return;
    const taskId = parseInt(taskDiv.dataset.id);
    if (!taskId) return;

    if (target.matches("input[type='text']")) {
      updateTask(taskId, { description: target.value });
    } else if (target.matches("select.priority-select")) {
      updateTask(taskId, { priority: target.value });
    } else if (target.matches("input[type='date']")) {
      updateTask(taskId, { dueDate: target.value });
    } else if (target.matches("select.status-select")) {
      updateTask(taskId, { status: target.value });
    }
    // Không gọi renderTasksPage() để giữ focus
  }

  function handleTaskBlur(e) {
    const target = e.target;
    if (!target.isContentEditable) return;
    const taskDiv = target.closest(".task-item-real");
    if (!taskDiv) return;
    const taskId = parseInt(taskDiv.dataset.id);
    if (!taskId) return;
    const newTitle = target.innerText.trim();
    if (newTitle === "") return;
    updateTask(taskId, { title: newTitle });
  }

  function handleTaskClick(e) {
    const target = e.target;
    const taskDiv = target.closest(".task-item-real");
    if (!taskDiv) return;
    const taskId = parseInt(taskDiv.dataset.id);
    if (!taskId) return;

    if (target.closest(".delete")) {
      e.stopPropagation();
      if (confirm("Delete this task?")) {
        deleteTask(taskId);
        const totalAfter = filteredSortedTasks.length - 1;
        const maxPage = Math.ceil(totalAfter / TASKS_PER_PAGE);
        if (tasksCurrentPage > maxPage && tasksCurrentPage > 1)
          tasksCurrentPage--;
        renderTasksPage();
      }
    } else if (target.closest(".check")) {
      e.stopPropagation();
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        // Vòng tròn: todo -> in-progress -> done -> todo
        let newStatus = "todo";
        if (task.status === "todo") newStatus = "in-progress";
        else if (task.status === "in-progress") newStatus = "done";
        else newStatus = "todo";
        updateTask(taskId, { status: newStatus });
        renderTasksPage();
      }
    }
  }

  function renderTasksPage() {
    const container = document.querySelector(".task-list-container");
    if (!container) return;

    updateFilteredSorted();
    const total = filteredSortedTasks.length;
    const start = (tasksCurrentPage - 1) * TASKS_PER_PAGE;
    const tasksToShow = filteredSortedTasks.slice(
      start,
      start + TASKS_PER_PAGE,
    );

    container.innerHTML = "";
    const template = document.querySelector(".task-item");
    if (!template) return;

    if (tasksToShow.length === 0) {
      const emptyMsg = document.createElement("div");
      emptyMsg.className = "empty-tasks-message";
      emptyMsg.textContent = "✨ No tasks found. Create a new one! ✨";
      emptyMsg.style.cssText =
        "text-align:center; padding:40px; color:var(--text);";
      container.appendChild(emptyMsg);
    } else {
      tasksToShow.forEach((task) => {
        const taskDiv = template.cloneNode(true);
        taskDiv.style.display = "block";
        taskDiv.classList.add("task-item-real");
        taskDiv.dataset.id = task.id;

        const titleH2 = taskDiv.querySelector("h2");
        if (titleH2) {
          titleH2.innerText = task.title;
          titleH2.setAttribute("contenteditable", "true");
        }

        const descInput = taskDiv.querySelector("input[type='text']");
        if (descInput) descInput.value = task.description || "";

        const prioritySelect = taskDiv.querySelector(".priority-select");
        if (prioritySelect) prioritySelect.value = task.priority;

        const statusSelect = taskDiv.querySelector(".status-select");
        if (statusSelect) statusSelect.value = task.status;

        const dateInput = taskDiv.querySelector("input[type='date']");
        if (dateInput) {
          dateInput.value =
            task.dueDate && task.dueDate.match(/\d{4}-\d{2}-\d{2}/)
              ? task.dueDate
              : "";
        }

        if (task.status === "done") taskDiv.classList.add("completed");
        else taskDiv.classList.remove("completed");

        container.appendChild(taskDiv);
      });
    }

    const loadMoreBtn = document.querySelector(".load-more");
    if (loadMoreBtn) {
      loadMoreBtn.style.display =
        total > start + TASKS_PER_PAGE ? "flex" : "none";
    }

    const editId = getEditIdFromUrl();
    if (editId) {
      const target = document.querySelector(
        `.task-item-real[data-id='${editId}']`,
      );
      if (target) {
        target.classList.add("highlight");
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => target.classList.remove("highlight"), 3000);
        history.replaceState(null, "", "Tasks.html");
      }
    }
  }

  function getEditIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("edit");
    return id ? parseInt(id) : null;
  }

  function setupTasksControls() {
    const searchInput = document.querySelector(
      ".searchbox-container-2 input[type='text']",
    );
    const searchIcon = document.querySelector(
      ".searchbox-container-2 .fa-magnifying-glass",
    );
    const applySearch = () => {
      tasksFilter.search = searchInput ? searchInput.value : "";
      tasksCurrentPage = 1;
      renderTasksPage();
    };
    if (searchInput) searchInput.addEventListener("input", applySearch);
    if (searchIcon) searchIcon.addEventListener("click", applySearch);

    const priorityFilter =
      document.getElementById("priorityFilter") ||
      document.querySelector(".filter-sort-box select:first-child");
    if (priorityFilter) {
      priorityFilter.addEventListener("change", (e) => {
        tasksFilter.priority = e.target.value;
        tasksCurrentPage = 1;
        renderTasksPage();
      });
    }

    const sortSelect =
      document.getElementById("sortSelect") ||
      document.querySelector(".filter-sort-box select:last-child");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        tasksFilter.sortBy = e.target.value;
        tasksCurrentPage = 1;
        renderTasksPage();
      });
    }

    const loadMore = document.querySelector(".load-more");
    if (loadMore) {
      loadMore.addEventListener("click", () => {
        tasksCurrentPage++;
        renderTasksPage();
      });
    }

    const header = document.querySelector(".task-list-header");
    if (header && !document.querySelector(".add-task-btn-header")) {
      const addBtn = document.createElement("button");
      addBtn.className = "setting-btn add-task-btn-header";
      addBtn.innerHTML = '<i class="fas fa-plus"></i> Add Task';
      addBtn.style.marginLeft = "auto";
      addBtn.onclick = () => {
        const newTask = addTask("New task", "", "Medium", null);
        tasksCurrentPage = 1;
        tasksFilter.search = "";
        tasksFilter.priority = "all";
        tasksFilter.sortBy = "newest";
        if (searchInput) searchInput.value = "";
        if (priorityFilter) priorityFilter.value = "all";
        if (sortSelect) sortSelect.value = "newest";
        renderTasksPage();
        setTimeout(() => {
          const newItem = document.querySelector(
            `.task-item-real[data-id='${newTask.id}']`,
          );
          if (newItem) {
            newItem.classList.add("highlight");
            newItem.scrollIntoView({ behavior: "smooth", block: "center" });
            setTimeout(() => newItem.classList.remove("highlight"), 3000);
          }
        }, 100);
      };
      header.style.display = "flex";
      header.style.alignItems = "center";
      header.style.justifyContent = "space-between";
      header.appendChild(addBtn);
    }
  }

  function initTasks() {
    loadTasksFromStorage();
    if (!document.querySelector(".task-list-container")) {
      const container = document.createElement("div");
      container.className = "task-list-container";
      const header = document.querySelector(".task-list-header");
      if (header) header.insertAdjacentElement("afterend", container);
      else document.querySelector("main").appendChild(container);
    }
    const template = document.querySelector(".task-item");
    if (template) template.style.display = "none";

    setupTasksControls();
    setupTaskDelegation();
    renderTasksPage();
  }

  initTasks();
}

// ============================================================
// PHẦN 10: TRANG STATS.HTML – HIỂN THỊ THỐNG KÊ TASK + CLICK ĐỂ SỬA
// ============================================================
if (window.location.pathname.includes("Stats.html")) {
  function renderStats() {
    const todoContainer = document.getElementById("todo-list");
    const progressContainer = document.getElementById("progress-list");
    const completedContainer = document.getElementById("completed-list");

    if (!todoContainer) return; // không phải trang Stats

    // Xóa nội dung cũ (giữ lại cấu trúc column-body)
    todoContainer.innerHTML = "";
    progressContainer.innerHTML = "";
    completedContainer.innerHTML = "";

    // Duyệt qua tất cả task và phân loại
    tasks.forEach((task) => {
      const card = document.createElement("div");
      card.className = "stat-task-card";
      // Thêm data-id để sau này có thể click vào task để chỉnh sửa (tuỳ chọn)
      card.setAttribute("data-id", task.id);
      card.innerHTML = `<p class="stat-task-title">${escapeHtml(task.title)}</p>`;

      // *** THÊM SỰ KIỆN CLICK ĐỂ MỞ TASKS.HTML VỚI ID TƯƠNG ỨNG ***
      card.style.cursor = "pointer";
      card.addEventListener("click", (e) => {
        e.stopPropagation();
        window.location.href = `Tasks.html?edit=${task.id}`;
      });

      // Tuỳ theo status mà đưa vào cột phù hợp
      if (task.status === "todo") {
        todoContainer.appendChild(card);
      } else if (task.status === "in-progress") {
        progressContainer.appendChild(card);
      } else if (task.status === "done") {
        completedContainer.appendChild(card);
      }
    });

    // Nếu cột nào không có task, có thể hiển thị thông báo nhẹ nhàng (tuỳ chọn)
    if (todoContainer.children.length === 0) {
      todoContainer.innerHTML =
        '<div class="stat-task-card" style="opacity:0.6;">✨ No tasks</div>';
    }
    if (progressContainer.children.length === 0) {
      progressContainer.innerHTML =
        '<div class="stat-task-card" style="opacity:0.6;">✨ No tasks</div>';
    }
    if (completedContainer.children.length === 0) {
      completedContainer.innerHTML =
        '<div class="stat-task-card" style="opacity:0.6;">✨ No tasks</div>';
    }
  }

  // Load dữ liệu từ localStorage và render thống kê
  loadTasksFromStorage();
  renderStats();
}

// ============================================================
// PHẦN 11: TRANG SETTINGS.HTML – EXPORT, IMPORT, CLEAR, NOTIFICATION, MUSIC (ĐÃ SỬA)
// ============================================================
if (window.location.pathname.includes("Settings.html")) {
  // --- QUAN TRỌNG: Load dữ liệu từ localStorage trước ---
  loadTasksFromStorage();

  // --- 1. EXPORT JSON ---
  const exportBtn = document.getElementById("exportBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const dataStr = JSON.stringify(tasks, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `todoit_backup_${new Date().toISOString().slice(0, 19)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // --- 2. IMPORT JSON ---
  const importBtn = document.getElementById("importBtn");
  if (importBtn) {
    importBtn.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const importedTasks = JSON.parse(ev.target.result);
            if (Array.isArray(importedTasks)) {
              if (
                confirm(
                  "Import sẽ thay thế toàn bộ tasks hiện tại. Bạn có chắc?",
                )
              ) {
                tasks = importedTasks.map(
                  (t) =>
                    new Task(
                      t.id,
                      t.title,
                      t.description,
                      t.priority,
                      t.dueDate,
                      t.status,
                      t.createdAt,
                    ),
                );
                saveTasksToStorage();
                alert(`Đã import ${tasks.length} tasks thành công!`);
                window.location.reload();
              }
            } else {
              alert("File không đúng định dạng (cần mảng tasks).");
            }
          } catch (err) {
            alert("Lỗi đọc file JSON: " + err.message);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    });
  }

  // --- 3. CLEAR ALL TASKS ---
  const clearAllBtn = document.getElementById("clearAllBtn");
  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", () => {
      if (confirm("⚠️ Xóa TOÀN BỘ task? Hành động không thể hoàn tác.")) {
        tasks = [];
        saveTasksToStorage();
        alert("Đã xóa tất cả tasks.");
        window.location.reload();
      }
    });
  }

  // --- 4. NOTIFICATION TOGGLE ---
  const notificationToggle = document.getElementById("notification-Toggle");
  const NOTIFICATION_KEY = "todoit_notifications";
  if (notificationToggle) {
    let notifState = localStorage.getItem(NOTIFICATION_KEY) === "true";
    function updateToggleUI() {
      if (notifState) notificationToggle.classList.add("active");
      else notificationToggle.classList.remove("active");
    }
    updateToggleUI();
    notificationToggle.addEventListener("click", () => {
      notifState = !notifState;
      localStorage.setItem(NOTIFICATION_KEY, notifState);
      updateToggleUI();
      if (notifState && Notification.permission === "default") {
        Notification.requestPermission();
      }
      console.log("Notifications:", notifState ? "ON" : "OFF");
    });
  }

  // --- 5. MUSIC SELECT (sử dụng chung playMusic toàn cục) ---
  const musicSelect = document.getElementById("bgMusicSelect");
  const playBtn = document.getElementById("playMusicBtn");
  const pauseBtn = document.getElementById("pauseMusicBtn");

  if (musicSelect) {
    // Khôi phục bài hát đã lưu (ưu tiên bài đang phát)
    let savedSong = localStorage.getItem("todoit_current_song");
    if (!savedSong || savedSong === "off") savedSong = "song1";
    musicSelect.value = savedSong === "off" ? "off" : savedSong;

    // Nút Play: phát bài được chọn
    if (playBtn) {
      playBtn.onclick = () => {
        const selected = musicSelect.value;
        if (selected !== "off") {
          playMusic(selected);
        } else {
          alert("Hãy chọn một bài hát trước khi nhấn Play.");
        }
      };
    }

    // Nút Pause: tạm dừng bài hiện tại
    if (pauseBtn) {
      pauseBtn.onclick = () => {
        if (backgroundAudio) {
          backgroundAudio.pause();
          // Lưu trạng thái là đã tạm dừng (nhưng vẫn nhớ bài hát)
          localStorage.setItem("todoit_music_playing", "false");
          isMusicPlaying = false;
        }
      };
    }

    // Khi thay đổi bài hát trong dropdown, lưu preference nhưng không tự động phát
    musicSelect.addEventListener("change", (e) => {
      const selected = e.target.value;
      localStorage.setItem("todoit_current_song", selected);
      // Nếu chọn "off" thì dừng nhạc
      if (selected === "off" && backgroundAudio) {
        backgroundAudio.pause();
        backgroundAudio = null;
        isMusicPlaying = false;
        localStorage.setItem("todoit_music_playing", "false");
      }
    });
  }

}
// ============================================================
// TODOIT! - APP.JS
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
    this.id = id;
    this.title = title;
    this.description = description || "";
    this.priority = priority || "Medium";
    this.dueDate = dueDate || null;
    this.status = status || "todo";
    this.createdAt = createdAt || new Date().toISOString();
}

// ============================================================
// PHẦN 2: KHAI BÁO BIẾN TOÀN CỤC VÀ HẰNG SỐ
// ============================================================

const STORAGE_KEY = "todoit_tasks";   // Key lưu trong localStorage
let tasks = [];                       // Mảng chứa tất cả task (trong bộ nhớ)

// Phân trang cho trang chủ
let homeCurrentPage = 1;              // Trang hiện tại (bắt đầu từ 1)
const HOME_TASKS_PER_PAGE = 10;       // Mỗi lần load thêm 10 task

// ============================================================
// PHẦN 3: HÀM ĐỌC/GHI LOCALSTORAGE
// ============================================================

/**
 * loadTasksFromStorage - Tải dữ liệu từ localStorage vào mảng tasks
 * - Nếu có dữ liệu, parse JSON và chuyển thành object Task
 * - Nếu không có hoặc lỗi, tasks = []
 */
function loadTasksFromStorage() {
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    if (storedTasks) {
        try {
            const parsedTasks = JSON.parse(storedTasks);
            if (Array.isArray(parsedTasks)) {
                tasks = parsedTasks.map(taskData => new Task(
                    taskData.id,
                    taskData.title,
                    taskData.description,
                    taskData.priority,
                    taskData.dueDate,
                    taskData.status,
                    taskData.createdAt
                ));
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
 * (Chuyển thành chuỗi JSON)
 */
function saveTasksToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ============================================================
// PHẦN 4: CÁC HÀM CRUD (THÊM, SỬA, XÓA, XÓA TẤT CẢ)
// ============================================================

/**
 * addTask - Thêm task mới vào danh sách
 * @param {string} title - Tiêu đề (bắt buộc)
 * @param {string} description - Mô tả (không bắt buộc)
 * @param {string} priority - Low/Medium/High (mặc định Medium)
 * @param {string} dueDate - Ngày hạn (có thể null)
 * @returns {Task} Task vừa tạo
 */
function addTask(title, description, priority, dueDate) {
    const newTask = new Task(
        Date.now(),               // ID = thời gian hiện tại (ms)
        title,
        description,
        priority,
        dueDate,
        "todo",                  // Mặc định trạng thái "todo"
        new Date().toISOString()
    );
    tasks.push(newTask);
    saveTasksToStorage();
    return newTask;
}

/**
 * deleteTask - Xóa task theo id
 * @param {number} id - ID của task cần xóa
 */
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasksToStorage();
}

/**
 * updateTask - Cập nhật một hoặc nhiều trường của task
 * @param {number} id - ID task cần cập nhật
 * @param {object} updatedData - Object chứa các trường cần thay đổi (vd: { title: "New title" })
 */
function updateTask(id, updatedData) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex !== -1) {
        Object.assign(tasks[taskIndex], updatedData);
        saveTasksToStorage();
    } else {
        console.warn(`Task with ID ${id} not found.`);
    }
}

/**
 * clearAllTasks (phiên bản gốc, chỉ xóa trong storage và mảng)
 * Hàm này sẽ bị GHI ĐÈ bởi phiên bản ở phần 8 (có renderTasks)
 */
function clearAllTasks() {
    if (confirm("Are you sure you want to clear all tasks? This action cannot be undone.")) {
        tasks = [];
        saveTasksToStorage();
    }
}

// ============================================================
// PHẦN 5: HÀM TIỆN ÍCH (HELPER)
// ============================================================

/**
 * escapeHtml - Bảo vệ chống XSS: chuyển & < > thành mã HTML an toàn
 * @param {string} str - Chuỗi cần xử lý
 * @returns {string} Chuỗi đã được escape
 */
function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

/**
 * handleTaskClick - Xử lý khi click vào một task ở trang chủ
 * Chuyển hướng sang Tasks.html với tham số edit=id
 * @param {Event} event - Sự kiện click
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
 * attachHomeTaskClickEvents - Gắn sự kiện click cho từng task vừa render
 * Dùng removeEventListener để tránh trùng lặp
 */
function attachHomeTaskClickEvents() {
    const taskItems = document.querySelectorAll(".home-task-item");
    taskItems.forEach(item => {
        item.removeEventListener("click", handleTaskClick);
        item.addEventListener("click", handleTaskClick);
    });
}

/**
 * renderTasks - Hiển thị danh sách task trên trang chủ (có phân kiểu Load More)
 * 1. Sắp xếp task mới nhất lên đầu
 * 2. Nếu không có task -> hiện ảnh empty, ẩn nút Load more
 * 3. Nếu có -> tính endIndex = homeCurrentPage * 10, cắt mảng
 * 4. Tạo HTML và đưa vào .todos
 * 5. Hiện/ẩn nút Load more tùy theo còn task chưa hiển thị
 * 6. Gắn sự kiện click cho từng task
 */
function renderTasks() {
    const todoContainer = document.querySelector(".todos");
    const emptyImg = document.querySelector(".empty-image");
    const loadMoreBtn = document.getElementById("loadMoreHome");

    if (!todoContainer) return; // Không phải trang chủ thì thoát

    // Sắp xếp: mới nhất trước
    const sortedTasks = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Trường hợp không có task nào
    if (sortedTasks.length === 0) {
        if (emptyImg) emptyImg.style.display = "block";
        if (loadMoreBtn) loadMoreBtn.style.display = "none";
        todoContainer.innerHTML = "";
        return;
    }

    // Có task -> ẩn ảnh empty
    if (emptyImg) emptyImg.style.display = "none";

    // Tính số lượng task cần hiển thị (cộng dồn)
    const endIndex = homeCurrentPage * HOME_TASKS_PER_PAGE;
    const tasksToShow = sortedTasks.slice(0, endIndex);

    // Tạo HTML
    const taskHTML = tasksToShow.map(task => `
        <div class="home-task-item" data-id="${task.id}">
            ${escapeHtml(task.title)}
        </div>
    `).join("");

    todoContainer.innerHTML = taskHTML;

    // Xử lý nút Load more
    if (loadMoreBtn) {
        if (sortedTasks.length > endIndex) {
            loadMoreBtn.style.display = "flex";
        } else {
            loadMoreBtn.style.display = "none";
        }
    }

    // Gắn sự kiện click cho từng task
    attachHomeTaskClickEvents();
}

// ============================================================
// PHẦN 7: CÁC HÀM XỬ LÝ SỰ KIỆN CHO TRANG CHỦ
// ============================================================

/**
 * openAddTask - Đưa con trỏ chuột vào ô nhập task (dùng cho sidebar)
 * Đồng thời cuộn màn hình đến ô đó một cách mượt mà
 */
function openAddTask() {
    const inputField = document.querySelector(".todos-input");
    if (inputField) {
        inputField.focus();
        inputField.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

/**
 * clearAllTasks (phiên bản nâng cấp) - Xóa toàn bộ task, cập nhật giao diện
 * - Hỏi xác nhận
 * - Xóa mảng tasks, lưu storage
 * - Reset phân trang về 1
 * - Render lại (sẽ hiện ảnh empty)
 */
function clearAllTasks() {
    if (confirm("⚠️ Are you sure you want to DELETE ALL TASKS? This action cannot be undone.")) {
        tasks = [];
        saveTasksToStorage();
        homeCurrentPage = 1;
        renderTasks();   // Quan trọng: cập nhật giao diện ngay
    }
}

// Biến toàn cục cho Music Mode (tạm thời chỉ bật/tắt màu nút + log)
let musicModeOn = false;

/**
 * toggleFocusMode - Bật/tắt chế độ nhạc (hiện tại chỉ demo)
 * Sau này có thể kết nối với file âm thanh thật
 */
function toggleFocusMode() {
    musicModeOn = !musicModeOn;
    const btn = document.querySelector(".sidebar-content:last-child");
    if (musicModeOn) {
        console.log("🎵 Music mode ON - (sẽ phát nhạc nền sau)");
        if (btn) btn.style.color = "#FF00FF";
    } else {
        console.log("🔇 Music mode OFF");
        if (btn) btn.style.color = "";
    }
}

/**
 * setupAddTaskButton - Gắn sự kiện cho nút Add và phím Enter
 * Khi click hoặc Enter, lấy nội dung ô input, gọi addTask(), reset trang và render
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
        addTask(title, "", "Medium", null);   // Dùng hàm CRUD
        inputField.value = "";
        homeCurrentPage = 1;                  // Về trang đầu để thấy task mới
        renderTasks();
    };

    addBtn.addEventListener("click", handleAdd);
    inputField.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleAdd();
    });
}

/**
 * setupLoadMoreButton - Gắn sự kiện cho nút "Load more tasks..."
 * Tăng số trang lên 1 và gọi renderTasks()
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
 * Nút 0: Add Task -> focus vào ô input
 * Nút 1: Clear All -> gọi clearAllTasks (phiên bản có render)
 * Nút 2: Music Mode -> toggleFocusMode
 */
function setupSidebarButtons() {
    const btns = document.querySelectorAll(".sidebar-content");
    if (btns.length >= 3) {
        btns[0].onclick = openAddTask;
        btns[1].onclick = clearAllTasks;     // Đã ghi đè bởi hàm ở phần 7
        btns[2].onclick = toggleFocusMode;
    }
}

// ============================================================
// PHẦN 8: KHỞI TẠO TRANG CHỦ (CHẠY KHI DOM SẴN SÀNG)
// ============================================================

/**
 * initHomePage - Hàm khởi tạo toàn bộ trang chủ
 * Thứ tự: đọc dữ liệu -> gắn sự kiện -> render
 */
function initHomePage() {
    loadTasksFromStorage();    // 1. Lấy tasks từ localStorage
    setupAddTaskButton();      // 2. Gắn sự kiện thêm task
    setupLoadMoreButton();     // 3. Gắn sự kiện load more
    setupSidebarButtons();     // 4. Gắn sự kiện sidebar
    renderTasks();             // 5. Hiển thị danh sách task lần đầu
}

// Lắng nghe sự kiện DOMContentLoaded (khi cấu trúc HTML đã tải xong)
document.addEventListener("DOMContentLoaded", () => {
    // Chỉ khởi tạo nếu đang ở trang index.html (có ô .todos-input)
    if (document.querySelector(".todos-input")) {
        initHomePage();
    }
});
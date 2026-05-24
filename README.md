# 🔮 Todoit! – Cyberpunk Task Manager

Todoit! là một ứng dụng quản lý công việc (ToDo list) với giao diện theo phong cách **cyberpunk / neon**, sử dụng hiệu ứng kính mờ (glassmorphism), ánh sáng neon và hoạt ảnh mượt mà. Dự án được xây dựng bằng HTML, CSS và JavaScript thuần.

## 🚀 Tính năng chính

- ✨ **Giao diện neon đặc trưng** – gradient, glow, glassmorphism
- 📋 **Quản lý task trực quan** – thêm, sửa, xóa, lọc, sắp xếp, phân trang
- 💾 **Lưu trữ cục bộ** – toàn bộ task được lưu trong `localStorage`
- 📊 **Trang thống kê** – phân loại task theo trạng thái (To Do, In Progress, Completed) và click để chỉnh sửa
- ⚙️ **Trang cài đặt** – bật/tắt thông báo, export/import JSON, xóa toàn bộ, **phát nhạc nền** (Play/Pause, chọn bài)
- 🧭 **Thanh sidebar ẩn/hiện** – thao tác nhanh (Add, Clear All, **Music Mode** – bật/tắt nhạc toàn cục)
- 📱 **Responsive cơ bản** – hiển thị tốt trên nhiều thiết bị
- 🎵 **Nhạc nền** – phát nhạc định dạng MP3, lưu trạng thái và bài hát yêu thích, điều khiển bằng nút Play/Pause trong Settings và nút Music Mode ở sidebar.

## 🧱 Công nghệ sử dụng

- HTML5
- CSS3 (Flexbox, Grid, Animation, Variables, Pseudo-elements)
- JavaScript (ES6, DOM manipulation, LocalStorage, Audio API)
- Font Awesome 6 (icon)
- **🤖 AI Assistant (ChatGPT, Deepseek)** – hỗ trợ viết code JS, debug, tối ưu code và cùng một số hiệu ứng CSS animation

## 🖥️ Cách chạy dự án

1. Clone hoặc tải toàn bộ mã nguồn về máy.
2. Mở file `index.html` bằng trình duyệt (Chrome, Edge, Firefox…).
3. Không cần cài đặt thêm bất kỳ server nào.

## 📄 Ghi chú

Dự án đã hoàn thiện toàn bộ chức năng CRUD, lưu trữ, tìm kiếm, lọc, sắp xếp, phân trang, thống kê, import/export, thông báo và phát nhạc nền.

## ⓘ Thông tin phiên bản

### 🔴 VER_1.3.0 // THE MUSIC & SIDEBAR UPDATE

_Ngày phát hành: 26/05/2026_

- 🎵 **Tích hợp nhạc nền hoàn chỉnh** – thêm dropdown chọn bài hát (Song 1–4), nút Play/Pause trong Settings. Nhạc chạy vòng lặp, lưu trạng thái và bài hát yêu thích vào localStorage.
- 🧲 **Sidebar Music Mode thực tế** – nút Music Mode ở sidebar giờ có thể bật/tắt nhạc thật (thay vì chỉ đổi màu). Đồng bộ với trạng thái nhạc toàn cục.
- 🔧 **Sửa lỗi đường dẫn file nhạc** – dùng đường dẫn tuyệt đối `/assets/music/...` hoạt động trên mọi trang.
- 🐛 **Fix lỗi giao diện Settings** – thêm class `music-select` cho dropdown, style neon đồng nhất.
- 📈 **Stats click vào task** – cho phép nhấp vào task trong thống kê để chỉnh sửa trực tiếp trong Tasks.html.
- 🧹 **Code JS tinh gọn** – tối ưu hàm `playMusic`, sử dụng chung một hệ thống âm thanh duy nhất, dễ bảo trì.

### 🔴 VER_1.2.1 // THE HOLOGRAPHIC UPDATE

_Ngày phát hành: 17/05/2026_

- 🔮 **Hoàn thiện trang About Us** – 5 trang hoàn chỉnh.
- 🔄 **Holographic Core 3D** – vòng xoay Carousel lơ lửng, tự động xoay và dừng khi hover.
- ⚡ **Cyan Glitch Title & Scanlines** – hiệu ứng nhiễu CRT.
- ✨ **Shine-Through Cards** – dải sáng gradient quét ngang.

## 👤 Tác giả

Được phát triển bởi **Lê Công Minh** – với sự hỗ trợ của AI assistant (ChatGPT) trong việc viết code, debug và tối ưu trải nghiệm người dùng.

---

⭐ Cảm ơn bạn đã xem dự án! Hãy thử todoit! và tận hưởng cảm giác làm việc trong không gian neon.

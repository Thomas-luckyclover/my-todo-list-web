# 🔮 Todoit! – Cyberpunk Task Manager

Todoit! là một ứng dụng quản lý công việc (ToDo list) với giao diện theo phong cách **cyberpunk / neon**, sử dụng hiệu ứng kính mờ (glassmorphism), ánh sáng neon và hoạt ảnh mượt mà. Dự án được xây dựng bằng HTML, CSS thuần và sẽ được tích hợp JavaScript trong tương lai để lưu trữ dữ liệu cục bộ.

## 🚀 Tính năng chính

- ✨ **Giao diện neon đặc trưng** – gradient, glow, glassmorphism
- 📋 **Quản lý task trực quan** – thêm, xem, lọc, sắp xếp (giao diện tĩnh)
- 📊 **Trang thống kê** – phân loại task theo trạng thái (To Do, In Progress, Completed)
- ⚙️ **Trang cài đặt** – tùy chỉnh thông báo, quản lý dữ liệu, âm nhạc nền
- 🧭 **Thanh sidebar ẩn/hiện** – thao tác nhanh
- 📱 **Responsive cơ bản** – hiển thị tốt trên nhiều thiết bị

## 🧱 Công nghệ sử dụng

- HTML5
- CSS3 (Flexbox, Grid, Animation, Variables, Pseudo-elements)
- Font Awesome 6 (icon)
- LocalStorage (sẽ được tích hợp sau)

## 🖥️ Cách chạy dự án

1. Clone hoặc tải toàn bộ mã nguồn về máy.
2. Mở file `index.html` bằng trình duyệt (Chrome, Edge, Firefox…).
3. Không cần cài đặt thêm bất kỳ server nào.


## 📄 Ghi chú

Hiện tại dự án mới dừng ở giao diện tĩnh, các nút bấm chưa có chức năng xử lý dữ liệu. Đây là phiên bản demo để trưng bày thiết kế và cấu trúc HTML/CSS.

## ⓘ Thông tin phiên bản

### 🔴 VER_1.1.1 // THE HOLOGRAPHIC UPDATE

*Ngày phát hành: 17/05/2026* 

- 🔮 **Hoàn thiện trang About Us:** Tích hợp thành công cấu trúc 5 trang hoàn chỉnh cho toàn bộ hệ thống (`Home`, `Tasks`, `Stats`, `Settings`, `About`).
  
- 🔄 **Holographic Core 3D:** Triển khai cấu trúc hình học không gian CSS 3D (`perspective`, `transform-style: preserve-3d`) biến các thẻ châm ngôn thành một vòng xoay Carousel lơ lửng, tự động xoay quanh trục đứng và tự động tạm dừng (`paused`) khi người dùng hover chuột để đọc thông tin.
  
- ⚡ **Cyan Glitch Title & Scanlines:** Ứng dụng kỹ thuật "băm chữ" bằng `clip-path` và nhân bản lớp `::before`/`::after` để tạo hiệu ứng chữ tiêu đề giật lag nhiễu sóng (Glitch effect). Phủ thêm lớp sọc màn hình `.scanline` tịnh tiến liên tục để tạo vibe điện ảnh CRT cũ.
  
- ✨ **Shine-Through Cards:** Nâng cấp hiệu ứng kính mờ (Glassmorphic) cho các thẻ với 3 lớp đổ bóng phát quang kép (`box-shadow`), kèm theo một dải sáng gradient quét ngang bề mặt kính (`@keyframes shine`) chạy vô tận tuần hoàn.

- DEBUG: Link CSS 

## 👤 Tác giả

Được phát triển bởi Lê Cong Minh 

---

⭐ Cảm ơn bạn đã xem dự án!
# CineMind Web — React + Docker

Frontend React/Vite khởi đầu cho Đồ án 2. Phim, bài viết và tương tác Watchlist hiện là dữ liệu demo; chưa có backend, database, xác thực thật, TMDB hoặc Gemini. Không nhập dữ liệu cá nhân vào form demo.

## Chạy local

Cần Node.js 20.19+ hoặc 22.12+ (khuyến nghị Node 24) và npm.

```bash
npm install
npm run dev
```

Mở địa chỉ Vite hiển thị, thường là `http://localhost:5173`. Build production: `npm run build`.

## Docker

```bash
docker build -t cinemind-web .
docker run --rm -p 8080:10000 cinemind-web
```

Mở `http://localhost:8080`. Nginx phục vụ React SPA tại cổng 10000, hỗ trợ React Router và health check `/healthz`.

## Render

`render.yaml` khai báo Docker Web Service ở Singapore và health check `/healthz`. `autoDeploy` tắt cho đến khi chủ dự án xác nhận branch/repository. Kết nối Git repository trong Render, chọn Blueprint từ file này, rà soát cấu hình rồi deploy. Render có thể build image trực tiếp từ Dockerfile trong repository; không bắt buộc đẩy image lên Docker Hub trước.

## Cấu trúc

- `src/App.jsx`: router và các trang giao diện khởi đầu.
- `src/data/demo.js`: nội dung demo, cần thay bằng API.
- `src/styles.css`: giao diện dark cinematic responsive.
- `Dockerfile`, `nginx.conf`: build static và phục vụ SPA.
- `render.yaml`: Blueprint cho Render.

## Việc tiếp theo

1. Chốt backend và PostgreSQL/MySQL theo `CineMind_AI_Build_Spec.md`.
2. Tạo migration và REST API; thay dữ liệu mẫu bằng API.
3. Hoàn tất auth/RBAC, Watchlist, review, blog, comments/likes.
4. Tích hợp TMDB/Gemini ở backend, thêm kiểm thử và kiểm tra deploy.
5. Xác nhận repository/branch trước khi bật auto-deploy.

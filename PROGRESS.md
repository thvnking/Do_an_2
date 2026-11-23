# Tiến độ dự án CineMind

Cập nhật lần cuối: 22/11/2026

## Mục tiêu hiện tại

Hoàn thiện và xác nhận website chạy cục bộ trước khi triển khai lên Render.

## Đã làm

- [x] Tách cấu trúc dự án thành tài liệu, frontend và backend.
- [x] Xây dựng frontend React/Vite và backend Node.js/Express.
- [x] Thiết kế cơ sở dữ liệu PostgreSQL, migration và các bảng nghiệp vụ.
- [x] Làm đăng ký, đăng nhập JWT, phân quyền và quản lý hồ sơ.
- [x] Làm danh mục/tìm kiếm phim, chi tiết phim, thể loại, danh sách xem, lịch sử và đánh giá.
- [x] Làm blog, bình luận, lượt thích và quy trình kiểm duyệt cơ bản.
- [x] Làm trang quản trị người dùng, phim và đồng bộ phim từ TMDB.
- [x] Kết nối Gemini cho chat và gợi ý phim; cấu hình API key/model đã được khai báo.
- [x] Đổi cấu hình Gemini local sang `gemini-3.6-flash` và mức suy luận `minimal` để giảm thời gian phản hồi.
- [x] Sửa lỗi backend xử lý timeout từ `DOMException`.
- [x] Xác nhận chat AI end-to-end qua website: HTTP 200, trả lời tiếng Việt.
- [x] Chat tổng quát tự tìm phim/người trong catalog và đưa kết quả vào ngữ cảnh Gemini.
- [x] Kiểm thử lại câu hỏi Christopher Nolan / The Odyssey: AI trả lời đúng phim năm 2026 và không còn gọi là phim sắp chiếu.
- [x] Cấu hình Docker Compose cho frontend, backend và PostgreSQL.
- [x] Build frontend thành công ngày 22/11/2026.
- [x] Kiểm tra các luồng API chính: đăng ký/JWT, hồ sơ, thể loại yêu thích, danh sách xem, đánh giá, lịch sử, blog, bình luận, lượt thích và đổi mật khẩu.
- [x] Xác nhận Docker Compose đang chạy; PostgreSQL khỏe và API báo `database: connected`.
- [x] Kiểm tra trang cục bộ trả HTTP 200 và frontend proxy lấy được dữ liệu phim.

## Đang làm

- [ ] Rà soát trực tiếp giao diện ở các trang chính và kích thước điện thoại.
- [ ] Kiểm tra luồng gợi ý phim cá nhân hóa AI sau khi đăng nhập.
- [ ] Hoàn tất kiểm tra sử dụng từ đầu đến cuối trên giao diện sau các chỉnh sửa cuối.

## Chưa làm

- [ ] Cấu hình cơ sở dữ liệu production trên Neon.
- [ ] Triển khai frontend/backend lên Render sau khi website được chốt cục bộ.
- [ ] Kiểm tra môi trường production sau khi triển khai.

## Chạy website cục bộ

- Website: `http://localhost:8080`
- Chat AI: `http://localhost:8080/ai`
- Chat tổng quát không cần đăng nhập; gợi ý phim cá nhân hóa cần đăng nhập và có dữ liệu phim/thể loại.

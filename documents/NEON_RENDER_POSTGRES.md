# CineMind: Neon Postgres + Render

## Lựa chọn host

Dùng Neon Postgres Free cho prototype/đồ án và giữ nguyên PostgreSQL hiện có. Tạo database ở AWS Singapore (`ap-southeast-1`) gần API Render Singapore. Gói Free hiện có 1 GB storage/project, 100 CU-hours/project/tháng và 5 GB public network transfer; compute tự scale về 0 sau 5 phút không hoạt động, vì vậy lần gọi đầu có thể chậm hơn. Đây phù hợp bản demo/đồ án, chưa phải cấu hình có cam kết uptime cao.

## Thiết lập một lần

1. Đăng ký/đăng nhập tại [Neon Console](https://console.neon.tech/), tạo project `cinemind`.
2. Chọn region Singapore nếu có trong danh sách, cloud AWS (`ap-southeast-1`); dùng database mặc định.
3. Mở **Connect**, chọn **Pooled connection**, sao chép connection string. Giữ nguyên tham số TLS trong chuỗi (thường có `sslmode=require`) và giữ kín mật khẩu.
4. Trong Render, mở service `cinemind-api` → **Environment**. Đặt `DATABASE_URL` bằng connection string Neon. Không commit chuỗi này vào Git hoặc gửi qua chat.
5. Điền các biến bí mật mà Blueprint yêu cầu: `JWT_SECRET`, `GEMINI_API_KEY`, `TMDB_READ_ACCESS_TOKEN`, `TMDB_SYNC_SECRET`; `CORS_ORIGIN` đặt bằng URL public của `cinemind-web`. `GEMINI_MODEL` để theo giá trị mặc định.
6. Deploy API. Khi API khởi động, migrations SQL tự tạo schema trên database Neon. Kiểm tra `https://<api-domain>/api/health` trả về database `connected`.
7. Database local có 20 phim, chưa tự sao chép sang Neon. Sau khi API production kết nối thành công, gọi `POST https://<api-domain>/api/tmdb/sync/popular` với JSON `{ "pages": 1 }` và header `x-sync-secret` bằng `TMDB_SYNC_SECRET` đã đặt trên Render để nhập lại catalog phim.

## Lưu ý gói Free

Neon Free tự tắt compute khi idle, không phải xóa database sau 30 ngày như Render Postgres Free. Database sẽ tự khởi động lại khi có request; lưu ý quota compute/storage/egress và xuất dữ liệu định kỳ nếu cần bảo quản lâu dài. Kiểm tra giới hạn hiện hành trong [Neon Plans](https://neon.com/docs/introduction/plans).

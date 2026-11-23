# CineMind API

## Thiết lập local

Trong `web/backend/`, sao chép `.env.example` thành `.env`, điền `JWT_SECRET`, `GEMINI_API_KEY`, `TMDB_READ_ACCESS_TOKEN` và `TMDB_SYNC_SECRET`; sau đó chạy `docker compose up --build` từ thư mục `web/`. Compose nạp khóa từ `backend/.env`. PostgreSQL được tạo và nâng cấp schema tự động khi API khởi động. Không đưa `.env` hoặc khóa API lên Git.

## API

- `POST /api/auth/register` — tạo User; mật khẩu được băm BCrypt.
- `POST /api/auth/login`, `GET /api/auth/me` — xác thực bằng Bearer JWT.
- `GET/PATCH /api/users/me`, `PATCH /api/users/me/password`, `PUT /api/users/me/favorite-genres` — hồ sơ, mật khẩu và sở thích.
- `GET /api/movies?q=&genre=&year=&sort=&page=&limit=` — tìm và phân trang danh mục phim.
- `GET /api/movies/:id` — chi tiết, thể loại, quốc gia, credit và rating cộng đồng.
- `GET /api/tmdb/search?query=` — tìm phim trên TMDB.
- `POST /api/tmdb/import/:tmdbId` — nhập/cập nhật một phim, gửi header `x-sync-secret`.
- `POST /api/tmdb/sync/popular` — nhập 1–5 trang phim phổ biến, gửi JSON `{ "pages": 1 }` và `x-sync-secret`.
- `POST /api/ai/chat` — chatbot tổng quát; thêm `movieId` trong JSON để hỏi đáp theo dữ liệu một phim.
- `POST /api/ai/recommendations` — gợi ý cá nhân hóa theo thể loại yêu thích và phim được đánh giá cao; cần Bearer JWT. Có thể gửi `{ "mood": "..." }`.
- `GET /healthz`, `GET /api/health` — kiểm tra API/database.

Sau khi đăng ký tài khoản đầu tiên, có thể cấp role Admin qua terminal tại `web/`: `docker compose exec api node src/scripts/promote-admin.js email-cua-ban`. Chỉ người đã có quyền shell máy chủ mới nên chạy lệnh này.

Migration SQL đặt ở `db/migrations/`; không xóa volume để cập nhật database. Recommendation dựa trên profile/review đăng nhập; dữ liệu AI được lưu lịch sử để truy vết.

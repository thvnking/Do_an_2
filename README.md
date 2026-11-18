# CineMind — Đồ án 2

## Thư mục

- `documents/` — báo cáo, đề cương, hình ảnh và hồ sơ yêu cầu cho AI.
- `web/frontend/` — giao diện React + Vite.
- `web/backend/` — API Node.js + Express, PostgreSQL migration.
- `web/docker-compose.yml` — chạy frontend, API và PostgreSQL cùng nhau.
- `render.yaml` — cấu hình triển khai web/API trên Render.
- `documents/NEON_RENDER_POSTGRES.md` — hướng dẫn host PostgreSQL trên Neon và kết nối Render.

## Chạy toàn bộ website local

Cài Docker Desktop, mở terminal tại thư mục `web`, sau đó chạy:

```bash
docker compose up --build
```

Giao diện: `http://localhost:8080`  
API: `http://localhost:3001/healthz`  
Trạng thái database: `http://localhost:3001/api/health`

Database local dùng thông tin phát triển trong Compose. Không dùng mật khẩu này cho môi trường thật.

## API nhanh

- `GET http://localhost:3001/api/movies?q=batman`
- `GET http://localhost:3001/api/tmdb/search?query=Interstellar`
- `POST http://localhost:3001/api/auth/register` rồi `POST /api/auth/login`
- `POST http://localhost:3001/api/ai/chat` với `{ "message": "..." }`
- `POST http://localhost:3001/api/ai/recommendations` với Bearer JWT và `{ "mood": "..." }`

Xem `web/backend/README.md` để biết đầy đủ endpoint và cách nhập catalog phim. Khóa TMDB, Gemini, JWT và sync secret cần được điền trong `web/backend/.env` sau khi sao chép từ `web/backend/.env.example`.



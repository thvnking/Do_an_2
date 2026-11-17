# CineMind — Hồ sơ nguồn để AI xây dựng website

> **Mục đích:** Tài liệu này hợp nhất yêu cầu, nghiệp vụ, dữ liệu, sơ đồ chức năng và các quyết định còn mở của Đồ án 2 CineMind. Hãy đọc tài liệu này trước khi tạo hoặc sửa mã nguồn. Đây là đặc tả dẫn đường cho AI lập trình, không phải bằng chứng website đã được triển khai.
>
> **Sinh viên:** Tăng Thiện Thanh — MSSV 235985 — Công nghệ thông tin, Trường Đại học Nam Cần Thơ.  
> **Cập nhật rà soát:** 17/11/2026.  
> **Trạng thái hồ sơ:** có tài liệu giai đoạn 1–3 và mô hình dữ liệu giai đoạn 2; đã có frontend React/Vite và backend khởi tạo Node.js/Express/PostgreSQL; các tích hợp thật cần API key được cấu hình riêng. Đã chốt: React/Vite cho frontend, Node.js + Express cho backend, PostgreSQL cho cơ sở dữ liệu; Docker để chạy/đóng gói và Render là đích triển khai dự kiến. Thông tin kết nối PostgreSQL production còn cần cấu hình khi triển khai.

---

## 1. Hướng dẫn dành cho AI lập trình

1. Trước khi viết mã, kiểm tra repository đang mở, đọc hướng dẫn dự án, kiểm tra cấu trúc và giữ lại công nghệ/cấu hình đã có. Hồ sơ này không cho phép tự thay thế một stack đã được người dùng chọn.
2. Nếu chưa có codebase, tạo website theo từng phần chạy được: khung giao diện và routing → dữ liệu phim/blog → xác thực/phân quyền → đánh giá/Watchlist/bình luận → quản trị → tích hợp TMDB/Gemini. Không tạo một bản mockup tĩnh rồi coi là hoàn thành.
3. Giữ ranh giới rõ giữa giao diện, API/controller, nghiệp vụ/service, truy cập dữ liệu/repository và entity/model. Không gọi Gemini hoặc TMDB trực tiếp từ trình duyệt bằng khóa bí mật.
4. Dùng yêu cầu đánh dấu **Đã xác nhận** làm phạm vi nền. Mục **Đề xuất** là cách triển khai hợp lý nhưng cần có thể thay đổi. Mục **Cần xác nhận** không được trình bày như quyết định đã được chủ dự án phê duyệt.
5. Giao diện hướng tới người dùng tiếng Việt; có bố cục responsive cho điện thoại và máy tính. Dark mode là định hướng trong tài liệu quy trình, không có thiết kế UI chi tiết được cung cấp. Hãy dùng giao diện điện ảnh tối giản làm mặc định đề xuất, giữ tương phản và khả năng đọc tốt.
6. Khi một tích hợp ngoài chưa có khóa hoặc cấu hình, tạo adapter/configuration và trạng thái hướng dẫn cấu hình; không nhúng thông tin giả hoặc khóa vào code. Có thể dùng dữ liệu demo được gắn nhãn rõ để phát triển giao diện.
7. Tạo migration/schema từ mô hình bên dưới, giữ khóa ngoại, unique constraint và validation tương ứng. Không đổi các quy tắc nghiệp vụ âm thầm.
8. Sau mỗi phần, nêu rõ phần đã làm, cách chạy, cấu hình còn thiếu và phần chưa triển khai. Không tuyên bố đã kiểm chứng tích hợp thật nếu chưa có credential và kiểm tra thực tế.

### Quy ước độ chắc chắn

- **Đã xác nhận:** xuất hiện rõ trong báo cáo giai đoạn 1, mô hình giai đoạn 2 hoặc Use Case giai đoạn 3.
- **Đề xuất kỹ thuật:** cần để mô tả cách thực hiện nhưng nguồn chưa khóa chi tiết đó.
- **Cần xác nhận:** tài liệu mâu thuẫn hoặc không xác định đủ để chọn một hành vi duy nhất.
- **Ngoài phạm vi nền:** ý tưởng có trong file ngữ cảnh nhưng chưa được xác nhận là chức năng bắt buộc của các giai đoạn 1–3.

---

## 2. Bản chất sản phẩm

**CineMind** là website quản lý và khám phá phim, đánh giá phim, blog điện ảnh và trợ lý AI. Mục tiêu là tập trung tra cứu phim, nội dung cộng đồng và cá nhân hóa trải nghiệm trong một hệ thống.

### Mục tiêu người dùng

- Tìm phim theo tên, thể loại, năm phát hành; xem thông tin, poster/banner, trailer và đánh giá cộng đồng.
- Đăng ký tài khoản để quản lý hồ sơ, thể loại yêu thích, Watchlist, đánh giá và nội dung cá nhân.
- Đọc, viết, sửa bài blog điện ảnh; bình luận và trả lời bình luận; thích bài viết theo yêu cầu nghiệp vụ giai đoạn 1.
- Nhận gợi ý phim và bài blog cá nhân hóa.
- Hỏi chatbot phim ảnh tổng quát hoặc đặt câu hỏi về phim đang xem.
- Cho Admin quản lý phim, đồng bộ dữ liệu TMDB, kiểm duyệt nội dung và theo dõi thống kê.

### Nhóm người dùng

| Vai trò | Trạng thái | Năng lực chính |
|---|---|---|
| Guest | Chưa đăng nhập; không cần bản ghi User | Duyệt/tìm phim, xem chi tiết, đọc blog công khai; đăng ký/đăng nhập; dùng chatbot tổng quát. Quyền AI hỏi đáp trang phim cần xác nhận. |
| User | Tài khoản đăng nhập, role `USER` | Quản lý hồ sơ/sở thích, Watchlist, đánh giá, viết/sửa blog, bình luận/trả lời, thích bài, nhận gợi ý cá nhân hóa, chat AI. |
| Admin | Tài khoản đăng nhập, role `ADMIN` | Quản lý phim và đồng bộ TMDB, duyệt/từ chối blog, quản lý người dùng, xem thống kê. Các quyền kiểm duyệt comment/review bị báo cáo chưa có use case tương ứng. |
| Gemini API | Tác nhân hệ thống ngoài | Trả về câu trả lời/gợi ý theo lời gọi từ backend. Dịch vụ có thể lỗi hoặc không khả dụng. |
| TMDB API | Hệ thống ngoài | Nguồn đồng bộ/tra cứu metadata phim theo Use Case quản trị. |

---

## 3. Phạm vi chức năng

### 3.1 Nền tảng đã xác nhận

#### Tài khoản và hồ sơ

- Đăng ký và đăng nhập.
- Đăng xuất được ghi trong Use Case UC02.
- Quản lý hồ sơ; đổi mật khẩu và cập nhật thể loại yêu thích được mô tả trong sơ đồ UC03.
- Lưu mật khẩu dưới dạng băm an toàn; tài liệu giai đoạn 1 nêu BCrypt. Không bao giờ trả password hash về client.

#### Khám phá phim và đánh giá

- Tìm kiếm/lọc phim theo tên, thể loại, năm phát hành.
- Trang chi tiết phim có metadata, trailer, đánh giá và tương tác liên quan.
- User gửi điểm 1–5 sao và nhận xét; mô hình giai đoạn 2 đặt unique `(user_id, movie_id)` nghĩa là tối đa một đánh giá cho mỗi user/phim.
- Quản lý Watchlist; UC07 có thao tác thêm và đánh dấu “đã xem/muốn xem”.
- Phim có quốc gia, thể loại, đạo diễn/diễn viên; có TMDB ID, thời lượng, poster/banner/trailer.

#### Blog và cộng đồng

- Guest/User đọc bài công khai.
- User soạn và gửi bài; quản lý bài cá nhân, sửa/xóa theo UC09–UC10.
- Bài mới dùng `PENDING`; Admin duyệt hoặc từ chối thành `PUBLISHED` hoặc `REJECTED`.
- Bình luận trên bài và trả lời bình luận khác (threaded comments).
- User thích bài viết (được nêu ở giai đoạn 1 và có bảng `BlogLike` ở giai đoạn 2; sơ đồ Use Case blog chưa thể hiện ca thích).
- Bài blog có thể liên kết với một phim; liên kết là tùy chọn.

#### AI

Ba nhóm chức năng được xác nhận trong tài liệu giai đoạn 1:

1. Gợi ý cá nhân hóa phim và bài blog từ sở thích/lịch sử tương tác.
2. Chatbot hỏi đáp phim ảnh tổng quát.
3. AI hỏi đáp chuyên sâu theo phim tại trang chi tiết phim.

Sơ đồ giai đoạn 3 đặt UC12 cho gợi ý cá nhân hóa (User), UC13 cho chatbot tổng quát (Guest và User), UC14 cho hỏi đáp phim (actor User trên ảnh). Quyền UC14 còn mâu thuẫn với diễn đạt giai đoạn 1 rằng Guest cũng có thể trải nghiệm chức năng này; xem mục 10.

#### Quản trị

- UC15 quản lý dữ liệu phim và đồng bộ TMDB.
- UC16 kiểm duyệt bài blog, chấp thuận/từ chối.
- UC17 quản lý người dùng.
- UC18 xem báo cáo và thống kê.

### 3.2 Ngoài phạm vi nền hoặc chưa được xác nhận

- Phân tích cảm xúc review, tạo chủ đề blog bằng AI và tìm kiếm ngôn ngữ tự nhiên xuất hiện trong file `cinemind_project_context.md`, nhưng không phải ba chức năng AI được chốt nhất quán trong báo cáo giai đoạn 1 và sơ đồ UC giai đoạn 3. Không triển khai như MVP nếu chưa có chấp thuận.
- Email verification, quên/đặt lại mật khẩu, đăng nhập mạng xã hội, thông báo realtime, upload video, thanh toán, theo dõi/report nội dung, phân cấp vai trò Admin/Moderator: chưa được mô tả đủ.
- Không tự mở rộng thành mạng xã hội đầy đủ hoặc microservices.

---

## 4. Luồng nghiệp vụ cốt lõi

### 4.1 Đăng ký/đăng nhập

1. Guest mở đăng ký, nhập thông tin bắt buộc.
2. Backend kiểm tra dữ liệu và tính duy nhất username/email, băm mật khẩu, tạo User với role mặc định `USER`.
3. Khi đăng nhập, backend xác thực mật khẩu, cấp session/token theo cơ chế được chọn.
4. Client điều hướng theo vai trò; backend phải xác thực quyền trên mọi route được bảo vệ.
5. Thất bại: trả lỗi phù hợp, không để lộ tài khoản nào tồn tại nếu chính sách bảo mật yêu cầu.

### 4.2 Tìm phim và trang chi tiết

1. Người dùng tìm theo từ khóa và bộ lọc.
2. Backend trả danh sách có phân trang và bộ lọc hợp lệ.
3. Chọn phim → trang chi tiết hiển thị metadata, poster/banner, trailer, thể loại, quốc gia, credit, điểm tổng hợp và review.
4. Guest chỉ xem các chức năng công khai; thao tác Watchlist/Review yêu cầu đăng nhập.
5. Khi mở phim, có thể ghi MovieViewHistory cho User đã đăng nhập. Theo schema hiện tại, lịch sử Guest không được lưu.

### 4.3 Đánh giá phim

1. User đã đăng nhập chọn điểm 1–5 và nhận xét.
2. Backend kiểm tra phim tồn tại, điểm trong miền hợp lệ và unique user–movie.
3. Vì unique cho phép một review/user/phim, lần gửi tiếp theo cần quy tắc create-or-update được xác nhận; phương án MVP đề xuất cập nhật review hiện tại.
4. Tính điểm trung bình từ Review và cập nhật giao diện. `average_rating` là thuộc tính dẫn xuất; nếu cache vật lý phải đồng bộ khi tạo/sửa/xóa review.

### 4.4 Watchlist

1. User thêm phim hoặc chuyển trạng thái giữa dự định xem/đã xem.
2. Ràng buộc unique `(user_id, movie_id)` ngăn thêm trùng.
3. User có thể xem danh sách, đổi trạng thái và xóa mục.
4. Tên chính xác các giá trị status chưa được chốt; chỉ dùng tập enum sau khi thống nhất.

### 4.5 Viết và duyệt blog

1. User đăng nhập soạn tiêu đề/nội dung, tùy chọn liên kết Movie.
2. Backend kiểm tra dữ liệu và quyền sở hữu khi sửa/xóa.
3. Lưu bài ở `PENDING`, chưa hiện trong danh sách công khai.
4. Admin xem hàng chờ, chọn chấp thuận (`PUBLISHED`) hoặc từ chối (`REJECTED`).
5. Chỉ bài `PUBLISHED` xuất hiện ở feed công khai.
6. Cách xử lý bài đã duyệt nhưng tác giả sửa lại, lý do từ chối, và bài nháp chưa gửi cần xác nhận.

### 4.6 Bình luận và lượt thích

- Comment thuộc một BlogPost; comment trả lời có `parent_comment_id` trỏ đến BlogComment cha; comment gốc có parent NULL.
- Backend phải kiểm tra parent comment thuộc cùng bài viết; ngăn tham chiếu vòng nếu hỗ trợ nhiều cấp.
- BlogLike dùng khóa ghép `(user_id, post_id)` để ngăn một User thích trùng một bài. Bỏ thích là xóa liên kết.
- Guest đọc nhưng muốn bình luận/thích thì cần đăng nhập (đề xuất quyền từ mô hình User/BlogLike).

### 4.7 Các luồng AI

- Frontend gọi backend; backend kiểm tra loại chức năng, quyền, dữ liệu đầu vào và hạn mức rồi mới gọi Gemini.
- Với `MOVIE_PAGE_QA`, backend tải thông tin phim làm ngữ cảnh. Không gửi dữ liệu riêng tư không cần thiết.
- Với gợi ý cá nhân hóa, có thể dùng FavoriteGenre, Watchlist, Review và MovieViewHistory theo quyền; thuật toán chưa được xác định. MVP có thể dùng luật/ranking minh bạch, sau đó thay bằng mô hình khác.
- Lưu hội thoại theo AIChatHistory khi có thể; `user_id` nullable để không gắn hội thoại Guest vào tài khoản. Cần quyết định retention và cách lưu nhiều lượt hội thoại.
- Xử lý timeout, quota, response lỗi/không hợp lệ; trả thông báo thân thiện và không để lộ API key/prompt bí mật.

### 4.8 Quản lý phim

- Admin có thể thêm/sửa/xóa hoặc đồng bộ phim từ TMDB theo UC15.
- Dùng `tmdb_id` unique để tránh tạo trùng; xác thực dữ liệu đồng bộ và xử lý lỗi API.
- Nguồn nào được ưu tiên khi dữ liệu TMDB khác dữ liệu Admin chỉnh tay cần được xác nhận.

---

## 5. Mô hình dữ liệu đề xuất đã rà soát

> Các bảng sau là lược đồ giai đoạn 2, chuẩn hóa mục tiêu 3NF. Kiểu SQL trong báo cáo là gợi ý tương thích SQL, chưa khóa PostgreSQL hay MySQL. Guest là actor ẩn danh, không phải bản ghi User. Không bỏ Genre, MovieGenre hoặc UserFavoriteGenre.

| Bảng | Trường chính và quy tắc |
|---|---|
| `users` | `user_id BIGINT PK`; `username VARCHAR(50) UQ NOT NULL`; `email VARCHAR(255) UQ NOT NULL`; `password_hash VARCHAR(255) NOT NULL`; `full_name VARCHAR(100)`; `avatar_url VARCHAR(500)`; `role ENUM(ADMIN, USER)`; `created_at DATETIME NOT NULL`. |
| `movies` | `movie_id BIGINT PK`; `tmdb_id INT UQ`; `title VARCHAR(255) NOT NULL`; `vietnamese_title VARCHAR(255)`; `synopsis TEXT`; `release_year SMALLINT`; `runtime_minutes SMALLINT CHECK > 0`; `poster_url`, `banner_url`, `trailer_url VARCHAR(500)`; `average_rating` dẫn xuất từ reviews, không bắt buộc lưu. |
| `genres` | `genre_id BIGINT PK`; `name VARCHAR(100) UQ NOT NULL`. |
| `movie_genres` | `movie_id FK → movies`; `genre_id FK → genres`; PK ghép `(movie_id, genre_id)`. |
| `user_favorite_genres` | `user_id FK → users`; `genre_id FK → genres`; PK ghép `(user_id, genre_id)`. |
| `countries` | `country_id BIGINT PK`; `iso_code CHAR(2) UQ`; `name VARCHAR(100) UQ NOT NULL`. |
| `movie_countries` | `movie_id FK → movies`; `country_id FK → countries`; PK ghép `(movie_id, country_id)`. |
| `persons` | `person_id BIGINT PK`; `tmdb_person_id INT UQ nullable`; `full_name VARCHAR(150) NOT NULL`; `profile_url VARCHAR(500)`. |
| `movie_credits` | `credit_id BIGINT PK`; `movie_id FK → movies`; `person_id FK → persons`; `credit_type ENUM(DIRECTOR, ACTOR)`; `character_name VARCHAR(150) nullable`; `credit_order SMALLINT nullable`; UQ `(movie_id, person_id, credit_type)`. |
| `blog_posts` | `post_id BIGINT PK`; `author_id FK → users`; `movie_id FK → movies nullable`; `title VARCHAR(255) NOT NULL`; `slug VARCHAR(255) UQ NOT NULL`; `content LONGTEXT NOT NULL`; `status ENUM(PENDING, PUBLISHED, REJECTED)`; `view_count INT DEFAULT 0`; `created_at DATETIME NOT NULL`. |
| `blog_comments` | `comment_id BIGINT PK`; `post_id FK → blog_posts`; `user_id FK → users`; `parent_comment_id FK → blog_comments nullable`; `content TEXT NOT NULL`; `created_at DATETIME NOT NULL`. |
| `blog_likes` | `user_id FK → users`; `post_id FK → blog_posts`; `created_at DATETIME NOT NULL`; PK ghép `(user_id, post_id)`. |
| `reviews` | `review_id BIGINT PK`; `user_id FK → users`; `movie_id FK → movies`; `rating TINYINT CHECK 1–5`; `comment_text TEXT`; `created_at DATETIME NOT NULL`; UQ `(user_id, movie_id)`. |
| `watchlists` | `watchlist_id BIGINT PK`; `user_id FK → users`; `movie_id FK → movies`; `status VARCHAR(20)` (tập giá trị cần xác nhận); `added_at DATETIME NOT NULL`; UQ `(user_id, movie_id)`. |
| `movie_view_history` | `history_id BIGINT PK`; `user_id FK → users`; `movie_id FK → movies`; `watched_at DATETIME NOT NULL`. Mỗi lần xem có thể là một dòng mới. |
| `ai_chat_history` | `chat_id BIGINT PK`; `user_id FK → users nullable`; `chat_type ENUM(GENERAL_SEARCH, MOVIE_PAGE_QA)`; `user_query TEXT NOT NULL`; `ai_response LONGTEXT`; `created_at DATETIME NOT NULL`. |

### Liên kết cốt lõi

- User 1–n BlogPost, BlogComment, Review, Watchlist, AIChatHistory, BlogLike, MovieViewHistory.
- Movie 1–n Review, Watchlist, MovieViewHistory; Movie n–n Genre qua MovieGenre; Movie n–n Country qua MovieCountry; Movie n–n Person qua MovieCredit.
- BlogPost 1–n BlogComment và BlogLike; BlogPost có thể gắn 0..1 Movie.
- BlogComment có thể có một parent và nhiều reply.
- User n–n Genre qua UserFavoriteGenre.

### Nguyên tắc dữ liệu

- Không lưu list thể loại/quốc gia/diễn viên dưới dạng chuỗi phân tách trong một cột.
- Các bảng nối chỉ lưu khóa ngoại và thuộc tính của mối quan hệ.
- Dùng FK/unique/check constraint để bảo vệ dữ liệu, không chỉ kiểm tra ở UI.
- `average_rating` tính từ Review; không lưu lặp ở Movie trừ khi có cache được cập nhật nhất quán.
- Cân nhắc index cho title/search fields, foreign keys, `blog_posts(status, created_at)`, `reviews(movie_id)`, history/watchlist theo user. Chỉ thêm index phục vụ truy vấn dự kiến; tránh index trùng constraint.
- Dùng migration có thể chạy lặp theo quy trình framework; seed dữ liệu demo có nhãn.

---

## 6. Sitemap và trang dự kiến

| Route đề xuất | Trang/chức năng | Truy cập |
|---|---|---|
| `/` | Trang chủ: phim nổi bật, phim/bài blog mới, gợi ý cá nhân hóa nếu User đăng nhập | Công khai; gợi ý cá nhân hóa cần User |
| `/movies` | Danh mục, tìm kiếm, lọc và phân trang phim | Guest, User |
| `/movies/:id` | Chi tiết phim, metadata, trailer, review, Watchlist, hỏi đáp phim | Guest/User; hành động cá nhân tùy quyền |
| `/blogs` | Danh sách bài `PUBLISHED` | Guest, User |
| `/blogs/:id` | Chi tiết bài, lượt xem, comment/replies, like | Đọc công khai; tương tác User |
| `/search-ai` | Chatbot/search tự nhiên nếu triển khai thành trang riêng | Guest/User; loại chức năng được kiểm soát |
| `/login`, `/register` | Đăng nhập, đăng ký | Guest |
| `/profile` | Thông tin tài khoản, sở thích, bài blog cá nhân | User |
| `/watchlist` | Phim đã lưu và trạng thái | User |
| `/blogs/create` | Soạn bài | User |
| `/admin` | Dashboard | Admin |
| `/admin/users` | Quản lý người dùng | Admin |
| `/admin/movies` | Quản lý/đồng bộ phim | Admin |
| `/admin/blogs` | Hàng chờ và kiểm duyệt blog | Admin |

Tách giao diện Admin khỏi trang công khai; bảo vệ route cả client lẫn backend. Route là đề xuất từ file ngữ cảnh; có thể điều chỉnh theo router thực tế.

---

## 7. Hợp đồng API gợi ý

> Đây là đề xuất REST để AI có thể bắt đầu thiết kế; chưa có API contract/backend code trong nguồn. Giữ nhất quán naming, pagination, error format và auth sau khi chọn framework.

| Nhóm | Endpoint gợi ý | Ghi chú quyền/nghiệp vụ |
|---|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` | Hạn chế truy cập; không trả hash; chọn cookie/session hay bearer token. |
| Hồ sơ | `GET/PATCH /api/users/me`, `PUT /api/users/me/favorite-genres`, `PATCH /api/users/me/password` | User sở hữu hồ sơ. |
| Phim | `GET /api/movies`, `GET /api/movies/:id`, `GET /api/genres` | Hỗ trợ query/filter/page/sort có allowlist. |
| Review | `GET /api/movies/:id/reviews`, `PUT /api/movies/:id/review`, `DELETE /api/movies/:id/review` | Chỉ User; unique một review/phim/user. `PUT` là đề xuất upsert. |
| Watchlist | `GET/POST /api/me/watchlist`, `PATCH/DELETE /api/me/watchlist/:movieId` | User; unique phim/user. |
| Blog | `GET /api/blogs`, `GET /api/blogs/:id`, `POST /api/blogs`, `PATCH/DELETE /api/blogs/:id` | Public chỉ thấy PUBLISHED; chủ bài hoặc Admin được sửa/xóa theo chính sách chốt. |
| Duyệt blog | `GET /api/admin/blogs?status=PENDING`, `PATCH /api/admin/blogs/:id/moderation` | Admin; hành động approve/reject, ghi audit nếu triển khai. |
| Bình luận | `GET/POST /api/blogs/:id/comments`, `PATCH/DELETE /api/comments/:id` | User tạo; kiểm tra owner/admin; parent phải cùng bài. |
| Thích bài | `PUT/DELETE /api/blogs/:id/like` | Idempotent add/remove theo khóa ghép. |
| Lịch sử xem | `POST /api/movies/:id/views`, `GET /api/me/movie-history` | Chỉ lưu khi User; không ghi mỗi refresh nếu muốn tránh spam. |
| AI | `POST /api/ai/recommendations`, `POST /api/ai/chat` | Backend gọi Gemini; chatType phân biệt tổng quát và theo phim; auth theo chính sách đã chốt. |
| Admin phim | `POST/PATCH/DELETE /api/admin/movies/:id`, `POST /api/admin/movies/sync-tmdb` | Admin; chống trùng `tmdb_id`, xử lý lỗi upstream. |
| Thống kê | `GET /api/admin/analytics/summary` | Admin; định nghĩa chỉ số trước khi triển khai. |

Đề xuất định dạng lỗi: `{ "code": "VALIDATION_ERROR", "message": "...", "details": [...] }`; không gửi stack trace, token, khóa API hoặc câu SQL ra client.

---

## 8. Yêu cầu phi chức năng và an toàn

- Responsive, keyboard accessible, form có nhãn, thông báo lỗi dễ hiểu, trạng thái loading/empty/error.
- Kiểm tra dữ liệu ở cả client và server; giới hạn kích thước bài viết, comment, query, AI prompt và upload nếu bổ sung upload.
- Hash password bằng BCrypt (yêu cầu nguồn) hoặc cơ chế tương đương mạnh nếu framework được chọn đã chuẩn hóa khác.
- RBAC phía server; tránh mass assignment; kiểm tra ownership cho sửa/xóa; chống SQL injection/XSS; sanitize nội dung rich text/Markdown trước hiển thị.
- API keys chỉ phía server/env; cấu hình secrets không được commit; rate limit login/comment/AI để tránh lạm dụng.
- TMDB/Gemini có timeout, xử lý quota và thông báo lỗi; không khiến toàn bộ trang phim lỗi nếu AI không phản hồi.
- Dữ liệu cá nhân và lịch sử AI cần chính sách retention/xóa cần xác nhận; không đưa secrets hoặc dữ liệu cá nhân vào prompt mặc định.
- Ghi log hoạt động quản trị ở mức phù hợp, không ghi password/token/prompt nhạy cảm.

---

## 9. Tiêu chí nghiệm thu MVP

1. Guest xem trang chủ, tìm/lọc danh mục phim, xem chi tiết, đọc bài đã xuất bản và dùng chatbot tổng quát theo chính sách cấu hình.
2. Guest đăng ký/đăng nhập; username/email trùng bị từ chối; password hash không lộ trong response.
3. User sửa hồ sơ/sở thích; API yêu cầu auth và user không thể sửa hồ sơ người khác.
4. User thêm phim vào Watchlist, đổi trạng thái và xóa; thêm trùng không sinh bản ghi trùng.
5. User đánh giá 1–5 sao; giá trị ngoài khoảng bị từ chối; chỉ có một Review cho cặp User/Movie; điểm trung bình khớp với tập review.
6. User gửi BlogPost, bài ở PENDING không xuất hiện công khai; Admin duyệt thì xuất hiện, từ chối thì không.
7. Chỉ owner/Admin sửa/xóa bài; comment reply gắn đúng bài và không cho guest tạo nếu chính sách đăng nhập được chốt.
8. Like không thể nhân bản cho một user/post; bỏ like xóa liên kết.
9. Movie, Genre, Country, Person và bảng nối hỗ trợ hiển thị dữ liệu chi tiết; đồng bộ TMDB không tạo trùng `tmdb_id`.
10. Chat AI gọi backend, lỗi upstream có fallback thông báo; khóa Gemini không xuất hiện ở frontend bundle/network response.
11. User không truy cập được Admin API; người không phải Admin nhận 401/403 phù hợp.
12. Có trạng thái loading, lỗi, rỗng, phân trang và thông báo thao tác ở các màn chính.
13. Cơ sở dữ liệu được tạo từ migration; các FK/unique/check chính hoạt động trên DB thật, không chỉ ở UI.

---

## 10. Các điểm cần chốt trước hoặc trong quá trình triển khai

| Ưu tiên | Điểm chưa rõ/mâu thuẫn | Tình trạng tài liệu | Cách xử lý an toàn |
|---|---|---|---|
| Cao | AI hỏi đáp trang phim cho Guest hay chỉ User? | Giai đoạn 1 cho Guest trải nghiệm; hình Use Case AI gắn UC14 với User. | Chọn Guest cũng được hỏi phim công khai hoặc yêu cầu login; cấu hình bằng policy, chưa giả định là quyết định cuối. |
| Cao | Admin có kiểm duyệt comment/review/report không? | Giai đoạn 1 nêu xử lý comment/review bị báo cáo; Use Case UC16 chỉ duyệt bài blog; không có Report entity/use case. | MVP chỉ kiểm duyệt blog theo sơ đồ; tạo backlog riêng cho report/moderation và xác nhận trước khi thêm schema/UI. |
| Cao | Blog trạng thái `DRAFT` có tồn tại không? | Schema chỉ PENDING/PUBLISHED/REJECTED; project context nhắc DRAFT. | Dùng ba trạng thái schema hiện tại; chỉ thêm draft nếu quy trình cho phép lưu nháp. |
| Cao | Sửa bài đã published thì quay lại PENDING hay vẫn published? | Chưa nêu. | Đề xuất đưa về PENDING để duyệt lại; cần chốt. |
| Cao | Lần đánh giá thứ hai xử lý ra sao? | Unique `(user_id,movie_id)` nhưng CRUD/API chưa định nghĩa. | Đề xuất cập nhật Review hiện tại, không tạo bản thứ hai. |
| Cao | Backend framework, frontend framework, DB cụ thể? | Tài liệu nêu React/Next, Spring Boot hoặc Node, PostgreSQL/MySQL; chưa chốt. | Kiểm tra codebase trước; nếu chưa có thì đưa lựa chọn ngắn gọn để chủ dự án quyết định. |
| Trung bình | `Watchlist.status` cho phép những giá trị nào? | Use Case thể hiện “đã xem/muốn xem”; schema để VARCHAR. | Đề xuất `WANT_TO_WATCH`, `WATCHED`; thêm `FAVORITE` chỉ khi cần và được duyệt. |
| Trung bình | Có lưu lượt xem Guest? | Schema MovieViewHistory yêu cầu user_id. | MVP ghi lịch sử đã đăng nhập; anonymous history không lưu hoặc phải thiết kế riêng. |
| Trung bình | Lưu hội thoại theo chat session thế nào? | AIChatHistory có từng query/response, không có conversationId. | Có thể lưu từng lượt MVP; nếu cần khôi phục nhiều phiên, bổ sung Conversation trước khi mở rộng. |
| Trung bình | Thống kê Admin cụ thể gồm gì? | Chỉ nêu truy cập, bài mới, xu hướng phim; UC18 không xác định KPI. | Xác nhận KPI, định nghĩa khoảng thời gian và nguồn đếm; tránh chế số liệu giả. |
| Trung bình | Tên người dùng có unique/case-insensitive không? | UQ username/email, không nêu chuẩn hóa chữ hoa/thường. | Chuẩn hóa email và username thống nhất trước khi lưu; xác nhận quy tắc hiển thị. |
| Thấp | Kiểu nội dung blog là Markdown hay rich text? | Nguồn nêu cả Rich Text/Markdown. | Chọn một định dạng lưu và sanitizer trước khi viết editor. |
| Thấp | Dữ liệu gợi ý cá nhân hóa và thuật toán? | Mục tiêu có, thuật toán không. | MVP dùng điểm/rule dựa genre, watchlist, review và lịch sử; hiển thị fallback khi thiếu tín hiệu. |

---

## 11. Rà soát nhất quán và phát hiện

### Những phần khớp nhau

- Tên dự án CineMind, đề tài phim + blog + AI và ba nhóm Guest/User/Admin nhất quán giữa giai đoạn 1, ảnh Use Case và báo cáo tổng hợp.
- Ba nhóm AI trọng tâm trong giai đoạn 1 tương ứng với UC12, UC13, UC14 trong giai đoạn 3.
- Trường dữ liệu phim mở rộng trong báo cáo giai đoạn 2 để hỗ trợ thời lượng, quốc gia, diễn viên/đạo diễn, media URLs và liên kết blog.
- Quan hệ n–n Genre/Country/Person được tách thành bảng nối; bình luận đa cấp dùng self-FK; BlogLike có khóa ghép; Review/Watchlist có unique theo người dùng và đối tượng.
- Báo cáo giai đoạn 3 bao gồm Use Case, Activity, Sequence và Sitemap như checklist quy trình yêu cầu.

### Khoảng trống, sai lệch cần nhớ

- Ảnh Use Case blog không có use case “thích bài”, trong khi giai đoạn 1 yêu cầu thả tim và schema giai đoạn 2 đã có BlogLike.
- Guest dùng AI hỏi đáp phim trong văn bản giai đoạn 1 nhưng actor UC14 ở ảnh là User.
- Kiểm duyệt comment/review bị báo cáo nêu ở giai đoạn 1 nhưng thiếu use case, trạng thái, bảng báo cáo vi phạm và luồng admin.
- UC18 nói thống kê nhưng không định nghĩa metric, nguồn đếm hoặc thời gian tổng hợp.
- `favoriteGenres` xuất hiện dạng chuỗi trong sơ đồ lớp ban đầu; giai đoạn 2 đã chuẩn hóa thành `UserFavoriteGenre`. Khi triển khai dùng bảng nối, không thêm chuỗi thể loại vào User.
- File ngữ cảnh dự án đề cập blog topic generator, natural-language search, sentiment summary; các ý này chưa khớp phạm vi AI chính ở báo cáo 1/ảnh UC. Xem là ngoài MVP cho tới khi được chốt.
- Mô hình AIChatHistory chỉ lưu một cặp user query/AI response; nếu chat nhiều lượt cần xác định conversation/session.

---

## 12. Stack và hạ tầng

### Đã chốt trong phiên làm việc ngày 17/11/2026

- Frontend: React.
- Container hóa bằng Docker.
- Host website trên Render.
- Bộ khung hiện dùng Vite + React, build static assets và phục vụ bằng Nginx trong container. Đây là phần khởi đầu, chưa bao gồm backend.
- Render có thể build Docker image trực tiếp từ Dockerfile trong Git repository; không nhất thiết phải đẩy image lên Docker Hub trước. Blueprint hiện tắt auto-deploy để chờ xác nhận kết nối repo/branch.

### Còn mở

- Backend: Java Spring Boot hoặc Node.js (NestJS/Express), kiến trúc Controller → Service → Repository.
- Database: PostgreSQL hoặc MySQL.
- Frontend có thể bổ sung TypeScript/Tailwind nếu chủ dự án chọn; scaffold hiện tại dùng JavaScript và CSS thuần.
- Dữ liệu phim: TMDB API.
- AI: Google Gemini API, lời gọi từ backend.
- Database hosting tham khảo: Supabase/Aiven.

AI phải giữ nguyên các lựa chọn đã chốt và ưu tiên stack đã có trong repository. Không tự quyết định backend/DB còn mở khi quyết định đó ảnh hưởng cấu trúc triển khai. Không khẳng định các nền tảng miễn phí luôn sẵn hoặc phù hợp khi chưa đánh giá điều kiện triển khai tại thời điểm thực hiện.

---

## 13. Nguồn đã rà soát

Các file dưới đây là nguồn đầu vào; chỉ những nội dung yêu cầu sản phẩm mới được hợp nhất, các câu hướng dẫn nộp bài/trình bày báo cáo không phải chức năng của website.

- `Giai_doan_1_Tăng_Thiện_Thanh_235985.docx` — bài toán, Guest/User/Admin, quy trình hằng ngày, nhóm dữ liệu và ba chức năng AI.
- `Report_DoAn2_Phase2.docx` — báo cáo tổng hợp giai đoạn 1–2; các bảng thuộc tính, lược đồ quan hệ, chuẩn hóa đến 3NF.
- `Report_DoAn2_Phase3.docx` — sơ đồ Use Case và phần thiết kế Activity/Sequence/Sitemap được tạo từ hồ sơ hiện có.
- `Quy_Trinh_Chi_Tiet_Lam_Do_An_2_CineMind.docx` — checklist bốn giai đoạn và deadline sản phẩm.
- `112_Ke Hoach_Do An 2_CNTT_Khoa 2023_HK1_2627.pdf` — kế hoạch môn học và yêu cầu báo cáo cuối kỳ.
- `cinemind_project_context.md` — ngữ cảnh công nghệ, sitemap và ý tưởng AI; có một số chức năng mở rộng chưa được xác nhận ở các báo cáo giai đoạn.
- Thư mục `Image/`: `Sơ đồ tổng quát.png`, `Phân hệ tài khoản đăng nhập.png`, `Phân hệ phim và đánh giá.png`, `Phân hệ blog.png`, `Phân hệ AI.png`, `Phân hệ admin.png`.
- `README.md` hiện chỉ có tiêu đề `# Do_an_2`; không cung cấp hướng dẫn build hoặc mã ứng dụng.

**Giới hạn rà soát:** Nội dung được đối chiếu từ các tài liệu và ảnh ở thư mục đồ án nêu trên. Thư mục này không có source frontend/backend hoặc cấu hình build để xác nhận website đã hiện thực chức năng nào. Tài liệu này mô tả hệ thống cần xây dựng, không tuyên bố tình trạng code/deployment.

### Vị trí nguồn trên máy tại thời điểm rà soát

`C:\Users\ADMIN\Documents\DO_AN_2\Do_an_2\`

---

## 14. Cách dùng hồ sơ này

Khi yêu cầu AI xây dựng website, đính kèm file này và giao một việc cụ thể, ví dụ:

> “Đọc `CineMind_AI_Build_Spec.md`, kiểm tra repository hiện tại và hiện thực giai đoạn đầu của MVP. Giữ nguyên công nghệ đã có. Nếu repository trống, đề xuất stack dựa trên các lựa chọn trong mục 12 trước khi scaffold. Báo cáo các điểm ở mục 10 cần quyết định, không tự coi chúng là yêu cầu đã chốt.”

Khi yêu cầu sửa một chức năng cụ thể, nêu mã yêu cầu/mục tương ứng, ví dụ `Review`, `UC16`, hoặc `/admin/blogs`, để AI đối chiếu luồng, quyền và dữ liệu trước khi thay đổi.




# TaskFlow - Full-Stack Todo Application

Ứng dụng quản lý công việc (Todo List) hoàn chỉnh, được xây dựng theo kiến trúc phân tầng, thông qua Prisma ORM và giao diện React tối ưu bằng TanStack Query.

---

## 🚀 Điểm Nổi Bật của Dự Án

### 1. Kiến trúc phân tầng (Layered Architecture)
Backend được tổ chức tách biệt hoàn toàn trách nhiệm theo chuẩn:
*   `Routes`: Định tuyến Endpoint.
*   `Middlewares`: Kiểm tra dữ liệu đầu vào (Validation) và Xử lý lỗi toàn cục.
*   `Controllers`: Tiếp nhận request HTTP, giải nén tham số và định dạng response.
*   `Services`: Trái tim hệ thống - nơi thực thi toàn bộ logic nghiệp vụ (Business Logic).
*   `Repositories`: Tầng tương tác trực tiếp với Database thông qua Prisma Client.

### 2. Quản lý Trạng thái Server thông minh (TanStack Query)
Giao diện React được nâng cấp toàn diện bằng `@tanstack/react-query`:
*   **Caching & Prefetching:** Tự động lưu bộ nhớ đệm giúp chuyển đổi qua lại giữa các bộ lọc (Đang làm, Đã xong...) lập tức mà không có độ trễ.
*   **Automatic Invalidation:** Tự động làm mới dữ liệu ở chế độ nền ngay khi có thao tác Thêm/Sửa/Xóa.
*   **Debounced Search:** Tích hợp bộ lọc tìm kiếm tối ưu, tự động trì hoãn 500ms trước khi gọi API để tránh quá tải server.

### 3. Kiểm thử Đơn vị Cô lập (Unit Testing)
*   Sử dụng framework hiện đại **Vitest** để viết bộ kiểm thử cho lớp nghiệp vụ `TodoService`.
*   Sử dụng kỹ thuật Mocking giả lập hoàn toàn lớp `TodoRepository`, cho phép chạy kiểm thử độc lập siêu nhanh (chỉ **7ms**) mà không cần kết nối thật đến Database.

### 4. Schema-based Validation & Logging chuyên nghiệp
*   **Joi Validation:** Kiểm soát chặt chẽ dữ liệu đầu vào tại lớp Middleware, tự động làm sạch và cắt khoảng trắng thừa trước khi lưu vào DB.
*   **Winston Logger:** Hệ thống log đa tầng (`info`, `warn`, `error`, `http`). Tự động hiển thị log màu sắc trực quan tại console và lưu vết lỗi dạng JSON vào file `logs/error.log` phục vụ giám sát online.

---

## 🛠️ Hướng Dẫn Chạy Dự Án

### 🐳 Bước 1: Khởi động Database (MySQL)
Dự án sử dụng Docker Compose để quản lý MySQL database. Mở Terminal tại thư mục gốc và chạy:
```bash
docker compose up -d db
```
*Database sẽ được khởi tạo tại cổng `3307`.*

### 🖥️ Bước 2: Cài đặt và Chạy Backend
1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Tạo file `.env` từ file `.env.example` (đảm bảo cấu hình `DATABASE_URL=mysql://root:anhvu031025@localhost:3307/todo_db`).
3. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
4. Khởi chạy server ở chế độ Development:
   ```bash
   npm run dev
   ```
   *(Hệ thống sẽ tự động đồng bộ cấu hình bảng MySQL thông qua Prisma trước khi bật server).*

### 🎨 Bước 3: Cài đặt và Chạy Frontend
1. Mở một terminal mới và di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
3. Khởi chạy giao diện React:
   ```bash
   npm run dev
   ```
4. Mở trình duyệt và truy cập: [http://localhost:5173](http://localhost:5173).

---

## 🧪 Chạy Kiểm Thử (Unit Test)
Mở Terminal tại thư mục `backend` và chạy:
```bash
npm test
```
Bộ kiểm thử sẽ quét toàn bộ file `.test.ts` và in báo cáo kết quả ra màn hình.

---

## 🛡️ Chiến Lược Xử Lý Dữ Liệu & Bảo Mật (Zero-Trust Validation)

Dự án áp dụng triệt để tư duy **"Zero-Trust Input" (Không tin tưởng dữ liệu đầu vào)** tại lớp Backend:

1. **Xử lý Title & Nội dung (XSS & Injection Protection):**
   * Sử dụng **Joi** để lọc và làm sạch dữ liệu đầu vào (`req.body`). Tiêu đề bắt buộc phải có, tự động xóa các khoảng trắng thừa ở hai đầu bằng `.trim()`, giới hạn tối đa 100 ký tự.
   * Ngăn chặn lưu trữ các đoạn mã script độc hại (XSS) bằng cách chỉ cho phép các ký tự text thông thường thông qua kiểm tra của Joi trước khi đẩy xuống tầng lưu trữ Prisma.
2. **Kiểu dữ liệu & Tính toàn vẹn (Type Integrity):**
   * Các trường trạng thái (`status`), độ ưu tiên (`priority`), danh mục (`category`) được kiểm tra nghiêm ngặt bằng `.valid(...)` trong Joi dựa trên danh sách hằng số quy định trước. Bất kỳ nỗ lực gửi sai kiểu dữ liệu (ví dụ: truyền số thay vì chuỗi, hoặc truyền giá trị lạ ngoài danh sách) đều bị chặn đứng tại Middleware.
3. **Phân biệt rõ ràng mã lỗi (404 vs 500):**
   * Hệ thống không bao giờ trả về lỗi `500 Internal Server Error` cho các lỗi do người dùng gây ra.
   * Nếu người dùng cố tình cập nhật/xóa một ID không tồn tại hoặc truyền sai định dạng ngày hạn (`dueDate`), hệ thống sẽ bắt lỗi tại lớp Service và trả về chính xác mã `404 Not Found` hoặc `400 Bad Request` thông qua lớp ngoại lệ tùy chỉnh `AppError`. Lỗi hệ thống `500` chỉ được dùng cho các sự cố hạ tầng thực sự (như mất kết nối database) và được Winston ghi lại log stack trace bí mật ở server.

---

## 💡 Quyết Định Thiết Kế & Tư Duy Dài Hạn (Design Decisions & Scalability)

### 1. Quyết định kỹ thuật (Architectural Decisions)
* **Tại sao chọn MySQL thay vì MongoDB cho dự án này?**
  Dữ liệu Todo có cấu trúc rất rõ ràng, đồng nhất và tính quan hệ cao (sau này sẽ mở rộng liên kết giữa Người dùng - Công việc, hoặc Nhãn - Công việc). MySQL mang lại tính nhất quán dữ liệu (ACID) tuyệt đối. Sự kết hợp giữa MySQL và Prisma ORM cung cấp lớp Type-safe hoàn hảo ở tầng compile-time, giúp phát hiện lỗi truy vấn ngay khi viết code thay vì đợi đến lúc chạy runtime.
* **Tại sao sử dụng mô hình Repository Pattern kết hợp Service Layer?**
  Giúp cô lập hoàn toàn logic nghiệp vụ khỏi công nghệ lưu trữ. Nếu tương lai dự án chuyển từ MySQL sang PostgreSQL hoặc MongoDB, lập trình viên chỉ cần thay đổi mã nguồn trong lớp `Repository`, toàn bộ logic ở lớp `Service` và `Controller` sẽ được bảo toàn 100%. Cách thiết kế này cũng giúp việc Mock dữ liệu khi viết Unit Test trở nên dễ dàng và nhanh chóng.

### 2. System Scalability ( khi cần mở rộng hệ thống)
Mặc dù là một ứng dụng Todo nhỏ, hệ thống đã được thiết kế để sẵn sàng nâng cấp lên quy mô lớn (hàng triệu bản ghi):
* **Phân trang quy mô lớn (Cursor-based Pagination):** 
  Nếu dữ liệu tăng lên hơn 10.000 items, cách phân trang truyền thống dùng Offset (`skip` và `take`) sẽ rất chậm vì MySQL phải quét qua tất cả các bản ghi phía trước. Hệ thống đã sẵn sàng cấu hình lại sang phân trang theo con trỏ (**Cursor-based Pagination**) của Prisma (dựa trên ID hoặc thời gian tạo) giúp tốc độ phản hồi luôn đạt mức dưới 50ms bất kể kích thước bảng dữ liệu.
* **Hỗ trợ Đa người dùng (Multi-user Ready):** 
  Bảng `Todo` trong `schema.prisma` và lớp `Repository` đã được thiết kế sẵn sàng nhận tham số lọc theo thực thể sở hữu. Khi tích hợp Authentication (JWT), ta chỉ cần thêm liên kết `userId` vào schema và truyền `userId` từ token vào tham số truy vấn của Repository mà không cần viết lại cấu trúc API.
* **Đánh chỉ mục dữ liệu (Database Indexing):** 
  Để tối ưu hóa việc tìm kiếm và lọc, các trường thường xuyên xuất hiện trong mệnh đề `WHERE` và `ORDER BY` như `status`, `dueDate`, `createdAt` và `userId` (trong tương lai) sẽ được thêm chỉ mục (`@@index`) để tăng tốc độ truy vấn lên gấp nhiều lần.
* **Bộ nhớ đệm (Caching với Redis):** 
  Các số liệu thống kê tổng quan (`stats`) của người dùng vốn tốn nhiều tài nguyên tính toán sẽ được cache lại bằng Redis với thời gian hết hạn ngắn, giúp giảm tải tối đa các truy vấn đếm (`COUNT`) lặp đi lặp lại xuống MySQL.


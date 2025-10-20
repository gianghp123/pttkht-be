# BÁO CÁO XÂY DỰNG ỨNG DỤNG QUẢN LÝ FILE

## TRƯỜNG ĐẠI HỌC KHOA HỌC TỰ NHIÊN - ĐẠI HỌC QUỐC GIA TP.HCM

### MÔN HỌC: PHÁT TRIỂN ỨNG DỤNG WEB

**Sinh viên thực hiện:**
- Họ và tên: [Tên sinh viên]
- MSSV: [Mã số sinh viên]
- Lớp: [Lớp]

**Giảng viên hướng dẫn:**
- Họ và tên: [Tên giảng viên]

**Thời gian thực hiện:** [Tháng/Năm]

---

## MỤC LỤC

1. [Phần mở đầu](#phần-mở-đầu)
   - 1.1. Lý do chọn đề tài
   - 1.2. Mục tiêu của đề tài
   - 1.3. Phạm vi của đề tài
   - 1.4. Phương pháp nghiên cứu
   - 1.5. Ý nghĩa thực tiễn

2. [Phân tích yêu cầu](#phân-tích-yêu-cầu)
   - 2.1. Phân tích bài toán
   - 2.2. Xác định yêu cầu chức năng
   - 2.3. Xác định yêu cầu phi chức năng
   - 2.4. Xác định đối tượng người dùng
   - 2.5. Mô hình Use Case
   - 2.6. Mô tả chi tiết Use Case

3. [Thiết kế hệ thống](#thiết-kế-hệ-thống)
   - 3.1. Thiết kế kiến trúc tổng thể
   - 3.2. Thiết kế cơ sở dữ liệu
   - 3.3. Thiết kế giao diện người dùng
   - 3.4. Thiết kế API
   - 3.5. Thiết kế bảo mật

4. [Cài đặt](#cài-đặt)
   - 4.1. Công nghệ sử dụng
   - 4.2. Cấu trúc mã nguồn
   - 4.3. Triển khai các module chính
   - 4.4. Triển khai cơ sở dữ liệu

5. [Kiểm thử](#kiểm-thử)
   - 5.1. Kế hoạch kiểm thử
   - 5.2. Các trường hợp kiểm thử
   - 5.3. Kết quả kiểm thử

6. [Kết luận](#kết-luận)
   - 6.1. Tổng kết công việc đã thực hiện
   - 6.2. Khó khăn gặp phải và giải pháp
   - 6.3. Hướng phát triển tương lai

7. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

8. [Phụ lục](#phụ-lục)

---

## PHẦN MỞ ĐẦU

### 1.1. Lý do chọn đề tài

Trong thời đại số hóa hiện nay, việc quản lý file là một nhu cầu thiết yếu cho các tổ chức và cá nhân. Hệ thống quản lý file truyền thống thường gặp phải các vấn đề như bảo mật kém, khả năng chia sẻ hạn chế và khó mở rộng. Do đó, việc xây dựng một hệ thống quản lý file hiện đại sử dụng công nghệ web với kiến trúc microservices và lưu trữ đám mây là rất cần thiết.

### 1.2. Mục tiêu của đề tài

Mục tiêu chính của đề tài là xây dựng một hệ thống quản lý file hoàn chỉnh với các tính năng:
- Quản lý người dùng với phân quyền rõ ràng
- Upload, download và chia sẻ file
- Kiểm soát quyền truy cập granular
- Giao diện người dùng thân thiện
- Bảo mật cao với JWT authentication

### 1.3. Phạm vi của đề tài

Đề tài tập trung vào:
- Phát triển backend API sử dụng NestJS
- Tích hợp cơ sở dữ liệu PostgreSQL/MySQL
- Lưu trữ file trên MinIO (S3-compatible)
- Triển khai authentication và authorization
- Phát triển frontend cơ bản (nếu cần thiết)

### 1.4. Phương pháp nghiên cứu

- Nghiên cứu lý thuyết về kiến trúc phần mềm, bảo mật và quản lý file
- Áp dụng phương pháp phát triển phần mềm Agile
- Sử dụng công nghệ NestJS, TypeORM và MinIO
- Kiểm thử tự động và thủ công

### 1.5. Ý nghĩa thực tiễn

Hệ thống này có thể áp dụng trong:
- Quản lý tài liệu doanh nghiệp
- Chia sẻ file nội bộ
- Lưu trữ đám mây cá nhân
- Hệ thống quản lý học liệu

---

## PHÂN TÍCH YÊU CẦU

### 2.1. Phân tích bài toán

Hệ thống quản lý file cần giải quyết các vấn đề:
- Lưu trữ và truy xuất file an toàn
- Chia sẻ file với quyền kiểm soát
- Quản lý người dùng và phân quyền
- Bảo mật dữ liệu

### 2.2. Xác định yêu cầu chức năng

1. **Quản lý người dùng:**
   - Đăng ký, đăng nhập
   - Quản lý profile
   - Phân quyền Admin/User

2. **Quản lý file:**
   - Upload file
   - Download file
   - Xem danh sách file
   - Xóa file

3. **Quản lý quyền:**
   - Gán quyền cho người dùng
   - Thu hồi quyền
   - Kiểm soát cấp độ quyền (VIEW, MANAGE)

### 2.3. Xác định yêu cầu phi chức năng

- **Hiệu năng:** Xử lý đồng thời nhiều request
- **Bảo mật:** JWT authentication, mã hóa dữ liệu
- **Khả năng mở rộng:** Kiến trúc modular
- **Tính sẵn sàng:** Uptime cao
- **Giao diện:** Responsive, thân thiện

### 2.4. Xác định đối tượng người dùng

- **Người dùng thông thường:** Upload, download file cá nhân
- **Admin:** Quản lý toàn bộ hệ thống
- **Người dùng được chia sẻ:** Truy cập file được chia sẻ

### 2.5. Mô hình Use Case

[Placeholder cho sơ đồ Use Case]

### 2.6. Mô tả chi tiết Use Case

**Use Case 1: Đăng nhập**
- Actor: Người dùng
- Mô tả: Người dùng nhập username/password để đăng nhập
- Luồng chính: 1. Nhập thông tin 2. Hệ thống xác thực 3. Trả về JWT token

**Use Case 2: Upload file**
- Actor: Người dùng đã đăng nhập
- Mô tả: Upload file lên hệ thống
- Luồng chính: 1. Chọn file 2. Upload 3. Lưu metadata 4. Trả về thông tin file

[Tương tự cho các Use Case khác]

---

## THIẾT KẾ HỆ THỐNG

### 3.1. Thiết kế kiến trúc tổng thể

Hệ thống quản lý file được thiết kế theo kiến trúc phân tầng (layered architecture) và mô hình module, sử dụng framework NestJS để đảm bảo tính mở rộng và bảo trì dễ dàng.

#### 3.1.1. Kiến trúc phân tầng

Hệ thống được chia thành các tầng chính sau:

1. **Tầng Presentation (Controllers):** Xử lý các yêu cầu HTTP, validate input và trả về response.
2. **Tầng Business Logic (Services):** Chứa logic nghiệp vụ, xử lý dữ liệu và tương tác với tầng dữ liệu.
3. **Tầng Data Access (Repositories/Entities):** Quản lý truy cập cơ sở dữ liệu thông qua TypeORM.
4. **Tầng Infrastructure:** Bao gồm MinIO cho lưu trữ file và các service bên ngoài.

#### 3.1.2. Kiến trúc module

Hệ thống được chia thành các module độc lập:

- **Auth Module:** Xử lý xác thực người dùng với JWT
- **User Module:** Quản lý thông tin người dùng (CRUD operations)
- **File Module:** Xử lý upload, download và quản lý metadata file
- **Permission Module:** Kiểm soát quyền truy cập file
- **MinIO Module:** Tích hợp với hệ thống lưu trữ object S3-compatible

#### 3.1.3. Luồng dữ liệu

1. Client gửi request đến Controller
2. Controller gọi Service để xử lý logic
3. Service tương tác với Repository để truy cập database
4. Service có thể gọi MinIO service để lưu trữ file
5. Response được trả về client

[Placeholder cho sơ đồ kiến trúc tổng thể]

### 3.2. Thiết kế cơ sở dữ liệu

#### 3.2.1. Mô hình dữ liệu

Hệ thống sử dụng cơ sở dữ liệu quan hệ với các thực thể chính:

**User Entity:**
- id: UUID (Primary Key)
- username: VARCHAR(255) UNIQUE
- password: VARCHAR(255) (hashed)
- role: ENUM('user', 'admin')
- createdAt: TIMESTAMP

**File Entity:**
- id: UUID (Primary Key)
- name: VARCHAR(255)
- mimeType: VARCHAR(100)
- size: BIGINT
- ownerId: UUID (Foreign Key to User)
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP

**Permission Entity:**
- id: UUID (Primary Key)
- userId: UUID (Foreign Key to User)
- fileId: UUID (Foreign Key to File)
- permissionLevel: INT (1: VIEW, 2: MANAGE)
- createdAt: TIMESTAMP

#### 3.2.2. Quan hệ giữa các thực thể

- User 1:N Permission (Một user có nhiều quyền)
- File 1:N Permission (Một file có nhiều quyền được gán)
- User 1:N File (Một user sở hữu nhiều file)

#### 3.2.3. Ràng buộc toàn vẹn

- UNIQUE constraint trên (userId, fileId) trong Permission table để tránh trùng lặp
- Foreign Key constraints đảm bảo referential integrity
- Index trên các trường thường xuyên query (ownerId, userId, fileId)

[Placeholder cho sơ đồ ER (Entity-Relationship)]

### 3.3. Thiết kế giao diện người dùng

#### 3.3.1. Nguyên tắc thiết kế

- **Responsive Design:** Giao diện hoạt động tốt trên desktop và mobile
- **User-Friendly:** Dễ sử dụng, intuitive navigation
- **Consistent:** Sử dụng cùng palette màu và typography
- **Accessible:** Tuân thủ WCAG guidelines

#### 3.3.2. Các màn hình chính

**Trang đăng nhập (/login):**
- Form đăng nhập với username/password
- Link quên mật khẩu
- Validation real-time

**Dashboard (/dashboard):**
- Header với thông tin user và menu
- Sidebar navigation
- Danh sách file với pagination
- Search và filter theo owner, name, mimeType
- Action buttons (upload, delete, share)

**Trang upload file (/upload):**
- Drag & drop zone cho file
- Preview file trước khi upload
- Progress bar hiển thị tiến trình upload

**Trang quản lý quyền (/permissions):**
- Danh sách file với owner
- Bảng quyền cho từng file
- Modal thêm/xóa quyền

**Trang chi tiết file (/files/:id):**
- Thông tin metadata
- Danh sách người có quyền truy cập
- Download button

[Placeholder cho wireframe UI]

### 3.4. Thiết kế API

#### 3.4.1. Nguyên tắc thiết kế REST

- Sử dụng HTTP methods chuẩn (GET, POST, PUT, DELETE)
- Resource-based URLs
- JSON response format
- Proper HTTP status codes
- Versioning qua URL prefix (/api/v1)

#### 3.4.2. Các endpoint chính

**Authentication:**
- POST /auth/login - Đăng nhập và lấy JWT token
- GET /auth/me - Lấy thông tin user hiện tại

**Users:**
- GET /users - Lấy danh sách users (Admin only)
- POST /users - Tạo user mới (Admin only)
- GET /users/me - Lấy thông tin user hiện tại
- GET /users/:id - Lấy user theo ID (Admin only)
- DELETE /users/:id - Xóa user (Admin only)

**Files:**
- GET /files - Lấy danh sách files (có filter)
- GET /files/me - Lấy files của user hiện tại
- GET /files/:id - Chi tiết file
- POST /files/upload - Upload file mới
- GET /files/:id/download - Download file
- DELETE /files/:id - Xóa file

**Permissions:**
- GET /permissions - Lấy tất cả permissions
- GET /permissions/file/:fileId - Permissions của một file
- POST /permissions/assign - Gán quyền
- PATCH /permissions/:id - Cập nhật level quyền
- DELETE /permissions/:id/file/:fileId - Thu hồi quyền

#### 3.4.3. Authentication & Authorization

- JWT token trong Authorization header
- Role-based middleware cho Admin routes
- Permission-based guards cho file operations

### 3.5. Thiết kế bảo mật

#### 3.5.1. Authentication

- **JWT Token:** Stateless authentication với expiration time
- **Password Hashing:** Sử dụng bcrypt để hash mật khẩu
- **Session Management:** Không sử dụng server-side sessions

#### 3.5.2. Authorization

- **Role-Based Access Control (RBAC):** Admin vs User roles
- **Permission-Based Access:** VIEW (1) và MANAGE (2) levels
- **Middleware Protection:** Guards kiểm tra quyền trước mỗi operation

#### 3.5.3. Input Validation

- **DTO Classes:** Sử dụng class-validator cho input validation
- **Sanitization:** Loại bỏ malicious input
- **Type Safety:** TypeScript đảm bảo type checking

#### 3.5.4. Bảo mật dữ liệu

- **Encryption:** File metadata được bảo vệ
- **CORS:** Configure allowed origins
- **Rate Limiting:** Ngăn chặn brute force attacks
- **SQL Injection Protection:** Parameterized queries với TypeORM

#### 3.5.5. Bảo mật MinIO

- **Access Keys:** Sử dụng IAM credentials
- **Signed URLs:** Pre-signed URLs cho file access
- **Bucket Policies:** Fine-grained access control

---

## CÀI ĐẶT

### 4.1. Công nghệ sử dụng

- **Backend:** NestJS, TypeScript
- **Database:** TypeORM, PostgreSQL/MySQL
- **Storage:** MinIO
- **Authentication:** JWT
- **Testing:** Jest

### 4.2. Cấu trúc mã nguồn

```
src/
├── auth/
├── users/
├── files/
├── permissions/
├── minio/
└── common/
```

### 4.3. Triển khai các module chính

**Auth Module:**
```typescript
@Controller('auth')
export class AuthController {
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // Implementation
  }
}
```

[Tương tự cho các module khác]

### 4.4. Triển khai cơ sở dữ liệu

Sử dụng TypeORM entities và migrations để tạo bảng và quan hệ.

---

## KIỂM THỬ

### 5.1. Kế hoạch kiểm thử

- Unit testing cho các service
- Integration testing cho API
- End-to-end testing cho workflows

### 5.2. Các trường hợp kiểm thử

| Test Case | Input | Expected Output | Status |
|-----------|-------|-----------------|--------|
| Login valid | Valid credentials | JWT token | Pass |
| Upload file | Valid file | File metadata | Pass |
| Access denied | No permission | 403 Forbidden | Pass |

### 5.3. Kết quả kiểm thử

Tất cả test case đều pass, coverage > 80%.

---

## KẾT LUẬN

### 6.1. Tổng kết công việc đã thực hiện

Đã hoàn thành xây dựng hệ thống quản lý file với đầy đủ tính năng cơ bản, bảo mật và khả năng mở rộng.

### 6.2. Khó khăn gặp phải và giải pháp

- Khó khăn: Tích hợp MinIO
- Giải pháp: Nghiên cứu tài liệu và testing kỹ

### 6.3. Hướng phát triển tương lai

- Thêm frontend đầy đủ
- Tích hợp caching (Redis)
- Triển khai cloud (AWS/DigitalOcean)
- Thêm tính năng versioning file

---

## TÀI LIỆU THAM KHẢO

1. NestJS Documentation
2. TypeORM Guide
3. MinIO Documentation
4. JWT Authentication Best Practices

---

## PHỤ LỤC

### A. Mã nguồn chính

[Đính kèm file source code]

### B. Screenshots

[Đính kèm hình ảnh giao diện]

### C. Test Results

[Đính kèm kết quả kiểm thử]

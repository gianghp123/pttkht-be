# THIẾT KẾ PHẦN MỀM - HỆ THỐNG QUẢN LÝ TẬP TIN

## I. GIỚI THIỆU
Hệ thống quản lý tập tin (File Management System) là một ứng dụng web cho phép người dùng lưu trữ, chia sẻ và quản lý các tập tin cá nhân. Hệ thống hỗ trợ phân quyền truy cập tập tin theo cấp độ (VIEW/MANAGE) và có cơ chế xác thực người dùng dựa trên vai trò (Role-based Access Control - RBAC).

## II. THIẾT KẾ KIẾN TRÚC PHẦN MỀM

### A. Tổng quan kiến trúc
Hệ thống được xây dựng dựa trên kiến trúc NestJS, sử dụng mô hình ba lớp:
- Lớp biên (Interface): Controller xử lý các yêu cầu HTTP
- Lớp xử lý (Process): Service xử lý logic nghiệp vụ
- Lớp thực thể (Entity): Database và MinIO lưu trữ dữ liệu

### B. Mô tả các thành phần chính

#### 1. Module Auth
- **Mục đích**: Xử lý xác thực người dùng
- **Thành phần**:
  - AuthService: xác thực người dùng và tạo token
  - AuthController: xử lý yêu cầu đăng nhập

#### 2. Module Users
- **Mục đích**: Quản lý thông tin người dùng
- **Thành phần**:
  - UsersService: quản lý người dùng (CRUD)
  - UsersController: xử lý yêu cầu quản lý người dùng

#### 3. Module Files
- **Mục đích**: Quản lý tập tin
- **Thành phần**:
  - FileService: xử lý upload, download, xóa tập tin
  - FilesController: xử lý yêu cầu liên quan đến tập tin

#### 4. Module Permission
- **Mục đích**: Quản lý quyền truy cập tập tin
- **Thành phần**:
  - PermissionsService: xác định và quản lý quyền truy cập
  - PermissionController: xử lý yêu cầu quản lý quyền

#### 5. Module MinIO
- **Mục đích**: Quản lý lưu trữ tập tin
- **Thành phần**:
  - MinioClientService: tương tác với hệ thống lưu trữ MinIO

## III. THIẾT KẾ CHO CÁC USECASE CHÍNH

### Use Case 1: Upload tập tin

#### a) (Lớp biên) Form: UploadForm
- **Ảnh**: Form upload tập tin (chọn file và submit)
- **Users**: Người dùng đã xác thực
- **Control chính của form**: Button "Upload"
- **Nhiệm vụ trong form**: Chọn và upload tập tin lên hệ thống
- **Inputs**: file (multipart form data)
- **Outputs**: Thông tin tập tin đã upload
- **Xử lý**: Gọi API `POST /files/upload`, kiểm tra quyền và lưu tập tin lên MinIO

#### b) (Lớp xử lý) API: POST /files/upload
- **Nhiệm vụ**: Upload tập tin mới vào hệ thống
- **Inputs**: file (multipart/form-data)
- **Outputs**: Thông tin tập tin đã được lưu trữ
- **Xử lý**:
  - Kiểm tra quyền xác thực người dùng
  - Lưu metadata vào bảng file
  - Gán quyền quản lý (MANAGE) cho chủ sở hữu
  - Upload vào hệ thống lưu trữ MinIO

#### c) (Lớp thực thể) Dữ liệu của đối tượng
- **Bảng liên quan**: file, permission
- **Dữ liệu cần thiết**: name, size, mime_type, owner_id, permission_level

### Use Case 2: Search/Tìm kiếm tập tin

#### a) (Lớp biên) Form: FileSearchForm
- **Ảnh**: Form tìm kiếm tập tin (các trường lọc như tên, loại, ngày tạo)
- **Users**: Người dùng đã xác thực
- **Control chính của form**: Button "Search" và các input filter
- **Nhiệm vụ trong form**: Lọc và hiển thị danh sách tập tin phù hợp
- **Inputs**: ownerId, name, mimeType, createdAt (tùy chọn)
- **Outputs**: Danh sách tập tin phù hợp với điều kiện lọc
- **Xử lý**: Gọi API `GET /files` với các tham số truy vấn, kiểm tra quyền truy cập trước khi trả về kết quả

#### b) (Lớp xử lý) API: GET /files
- **Nhiệm vụ**: Lấy danh sách tập tin với khả năng lọc
- **Inputs**: query params (ownerId, name, mimeType, createdAt), userId và role (từ token)
- **Outputs**: Danh sách tập tin phù hợp điều kiện
- **Xử lý**:
  - Nếu là admin: trả về tất cả tập tin
  - Nếu là user: chỉ trả về tập tin mà người dùng có quyền truy cập (VIEW trở lên)
  - Áp dụng các điều kiện lọc nếu có

#### c) (Lớp thực thể) Dữ liệu của đối tượng
- **Bảng liên quan**: file, permission, users
- **Dữ liệu cần thiết**: các trường trong bảng file và quyền truy cập của người dùng

### Use Case 3: Phân quyền truy cập tập tin

#### a) (Lớp biên) Form: AssignPermissionForm
- **Ảnh**: Form gán quyền (chọn người dùng, tập tin, cấp độ quyền)
- **Users**: Người dùng có quyền MANAGE trở lên
- **Control chính của form**: Button "Assign Permission"
- **Nhiệm vụ trong form**: Gán quyền truy cập cho người khác
- **Inputs**: userId, fileId, permissionLevel
- **Outputs**: Kết quả gán quyền
- **Xử lý**: Gọi API `POST /permissions/assign`, kiểm tra quyền trước khi gán

#### b) (Lớp xử lý) API: POST /permissions/assign
- **Nhiệm vụ**: Gán quyền truy cập cho một người dùng
- **Inputs**: {userId: string, fileId: string, permissionLevel: PermissionLevel}
- **Outputs**: 200 OK
- **Xử lý**:
  - Kiểm tra quyền của người yêu cầu (phải có quyền MANAGE)
  - Kiểm tra ràng buộc (không thể gán quyền cho chính mình hoặc admin)
  - Tạo quyền mới hoặc cập nhật quyền hiện có

#### c) (Lớp thực thể) Dữ liệu của đối tượng
- **Bảng liên quan**: permission
- **Dữ liệu cần thiết**: user_id, file_id, permission_level

## IV. THIẾT KẾ CƠ SỞ DỮ LIỆU

### a) ERD (Entity Relationship Diagram)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     users       │    │      file       │    │   permission    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id: UUID (PK)   │────│ id: UUID (PK)   │────│ id: UUID (PK)   │
│ username: VARCHAR│    │ name: VARCHAR   │    │ user_id: UUID   │
│ password_hash:  │    │ mime_type:      │    │ file_id: UUID   │
│   VARCHAR       │    │   VARCHAR       │    │ permission_level│
│ role: VARCHAR   │    │ size: INTEGER   │    │ : VARCHAR       │
│ created_at:     │    │ owner_id: UUID  │    │ created_at:     │
│   TIMESTAMP     │    │ created_at:     │    │   TIMESTAMP     │
└─────────────────┘    │   TIMESTAMP     │    └─────────────────┘
                       │ updated_at:     │
                       │   TIMESTAMP     │
                       └─────────────────┘
```

**Quan hệ:**
- users (1) ←→ (N) file: Một người dùng có thể sở hữu nhiều tập tin
- users (1) ←→ (N) permission: Một người dùng có thể có nhiều quyền truy cập
- file (1) ←→ (N) permission: Một tập tin có thể được chia sẻ với nhiều người dùng

### b) Mô tả bảng chi tiết

#### Bảng users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('USER', 'ADMIN')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- **Chức năng**: Lưu trữ thông tin người dùng hệ thống
- **Chỉ mục**: username (UNIQUE), role (INDEX)
- **Ràng buộc**: username phải duy nhất, role chỉ nhận giá trị 'USER' hoặc 'ADMIN'

#### Bảng file
```sql
CREATE TABLE file (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  size INTEGER,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- **Chức năng**: Lưu trữ metadata của các tập tin
- **Chỉ mục**: owner_id (INDEX), created_at (INDEX)
- **Ràng buộc**: owner_id trỏ đến bảng users, khi xóa user sẽ xóa cả file (CASCADE)

#### Bảng permission
```sql
CREATE TABLE permission (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_id UUID REFERENCES file(id) ON DELETE CASCADE,
  permission_level VARCHAR(50) NOT NULL CHECK (permission_level IN ('VIEW', 'MANAGE')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, file_id, permission_level)
);
```
- **Chức năng**: Lưu trữ quyền truy cập của người dùng với từng tập tin
- **Chỉ mục**: user_id (INDEX), file_id (INDEX), permission_level (INDEX)
- **Ràng buộc**: 
  - user_id và file_id trỏ đến bảng users và file
  - permission_level chỉ nhận giá trị 'VIEW' hoặc 'MANAGE'
  - Khoá duy nhất trên tập (user_id, file_id)

### c) Stored Procedures

#### Stored Procedure: sp_check_user_permission
```sql
-- Tên: sp_check_user_permission
-- Nhiệm vụ trong CSDL: Kiểm tra người dùng có quyền truy cập vào tập tin hay không
-- Inputs: p_user_id (UUID), p_file_id (UUID), p_required_level (VARCHAR)
-- Outputs: BOOLEAN (true nếu có quyền, false nếu không)
-- Quyền sử dụng: users, applications

CREATE OR REPLACE FUNCTION sp_check_user_permission(
    p_user_id UUID,
    p_file_id UUID,
    p_required_level VARCHAR
) RETURNS BOOLEAN AS $
DECLARE
    user_role VARCHAR(50);
    permission_level VARCHAR(50);
    has_permission BOOLEAN;
BEGIN
    -- Kiểm tra vai trò của người dùng
    SELECT role INTO user_role FROM users WHERE id = p_user_id;
    
    -- Người dùng là admin thì có quyền truy cập tất cả
    IF user_role = 'ADMIN' THEN
        RETURN TRUE;
    END IF;
    
    -- Lấy quyền truy cập của người dùng với tập tin
    SELECT permission_level INTO permission_level 
    FROM permission 
    WHERE user_id = p_user_id AND file_id = p_file_id;
    
    -- Kiểm tra quyền
    IF permission_level IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- So sánh quyền
    IF p_required_level = 'VIEW' AND permission_level IN ('VIEW', 'MANAGE') THEN
        RETURN TRUE;
    ELSIF p_required_level = 'MANAGE' AND permission_level = 'MANAGE' THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$ LANGUAGE plpgsql;
```

#### Stored Procedure: sp_create_file_with_permission
```sql
-- Tên: sp_create_file_with_permission
-- Nhiệm vụ trong CSDL: Tạo tập tin mới và gán quyền quản lý cho người tạo
-- Inputs: p_name (VARCHAR), p_mime_type (VARCHAR), p_size (INTEGER), p_owner_id (UUID)
-- Outputs: RECORD (thông tin file đã tạo)
-- Quyền sử dụng: users, applications

CREATE OR REPLACE FUNCTION sp_create_file_with_permission(
    p_name VARCHAR,
    p_mime_type VARCHAR,
    p_size INTEGER,
    p_owner_id UUID
) RETURNS RECORD AS $
DECLARE
    new_file RECORD;
    permission_result BOOLEAN;
BEGIN
    -- Tạo bản ghi file mới
    INSERT INTO file (name, mime_type, size, owner_id)
    VALUES (p_name, p_mime_type, p_size, p_owner_id)
    RETURNING * INTO new_file;
    
    -- Gán quyền quản lý cho người tạo (trừ admin)
    IF (SELECT role FROM users WHERE id = p_owner_id) != 'ADMIN' THEN
        INSERT INTO permission (user_id, file_id, permission_level)
        VALUES (p_owner_id, new_file.id, 'MANAGE');
    END IF;
    
    RETURN new_file;
END;
$ LANGUAGE plpgsql;
```

### d) Triggers

#### Trigger: trg_prevent_duplicate_permissions
```sql
-- Tên: trg_prevent_duplicate_permissions
-- Nhiệm vụ trong CSDL: Ngăn chặn việc gán quyền trùng lặp cho cùng một người dùng và tập tin
-- Event: BEFORE INSERT OR UPDATE ON permission table
-- Action: Kiểm tra và ngăn chặn nếu quyền đã tồn tại

CREATE OR REPLACE FUNCTION fn_check_duplicate_permission()
RETURNS TRIGGER AS $
DECLARE
    existing_count INTEGER;
BEGIN
    -- Kiểm tra nếu quyền đã tồn tại
    SELECT COUNT(*) INTO existing_count
    FROM permission
    WHERE user_id = NEW.user_id AND file_id = NEW.file_id;
    
    -- Nếu đã tồn tại, cập nhật thay vì tạo mới
    IF existing_count > 0 THEN
        UPDATE permission 
        SET permission_level = NEW.permission_level
        WHERE user_id = NEW.user_id AND file_id = NEW.file_id;
        RETURN NULL; -- Hủy hành động INSERT
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_duplicate_permissions
    BEFORE INSERT ON permission
    FOR EACH ROW
    EXECUTE FUNCTION fn_check_duplicate_permission();
```

#### Trigger: trg_delete_file_cleanup_permissions
```sql
-- Tên: trg_delete_file_cleanup_permissions  
-- Nhiệm vụ trong CSDL: Xóa tất cả quyền truy cập liên quan khi xóa tập tin
-- Event: AFTER DELETE ON file table
-- Action: Xóa các bản ghi trong bảng permission liên quan đến tập tin bị xóa

CREATE OR REPLACE FUNCTION fn_cleanup_permissions_on_file_delete()
RETURNS TRIGGER AS $
BEGIN
    -- Xóa tất cả quyền liên quan đến tập tin
    DELETE FROM permission WHERE file_id = OLD.id;
    RETURN OLD;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trg_delete_file_cleanup_permissions
    AFTER DELETE ON file
    FOR EACH ROW
    EXECUTE FUNCTION fn_cleanup_permissions_on_file_delete();
```

## V. CƠ CHẾ BẢO MẬT VÀ XỬ LÝ NGOẠI LỆ

### 1. Cơ chế xác thực
- Sử dụng JWT (JSON Web Token) cho xác thực người dùng
- Token có thời hạn và được kiểm tra trên mỗi yêu cầu bảo vệ

### 2. Cơ chế phân quyền
- RBAC (Role-based Access Control): USER và ADMIN
- ABAC (Attribute-based Access Control): Cấp quyền theo cấp độ (VIEW, MANAGE)

### 3. Xử lý ngoại lệ
- Tất cả các API đều có cơ chế xử lý lỗi cụ thể
- Mã lỗi HTTP phù hợp với từng loại lỗi
- Không để lộ thông tin nhạy cảm trong lỗi trả về

## VI. CƠ CHẾ LƯU TRỮ

### 1. Database
- PostgreSQL cho lưu trữ dữ liệu cấu trúc (metadata, người dùng, quyền truy cập)
- Toàn bộ thao tác với dữ liệu đều sử dụng transaction đảm bảo tính nhất quán

### 2. File storage
- MinIO (S3-compatible) cho lưu trữ tập tin
- Sử dụng presigned URL để chia sẻ tập tin an toàn
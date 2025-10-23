# 📘 Comprehensive API Documentation — File Management System

**Entities:**
- `User`: represents a registered user who can own or have access to files.
- `File`: represents an uploaded file with metadata and ownership.
- `Permission`: defines which user can access which file and at what level.

**Permission Levels:**
- `VIEW` (1): Can view file details and download.
- `MANAGE` (2): Can delete file, generate share links, and manage permissions.

**Roles:**
- `User`: Regular user.
- `Admin`: Administrator with full access.

---

## 🔐 AUTHENTICATION

### **POST /auth/login**

**Description:** Authenticate user and get JWT token  
**Public:** Yes  
**Request:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "username": "string",
    "role": "user|admin",
    "createdAt": "datetime"
  },
  "token": "jwt_token"
}
```

---

## 🧩 USERS

### **GET /users**

**Description:** Get all users  
**Auth Required:** Yes (Admin only)  
**Response:**
```json
[
  {
    "id": "uuid",
    "username": "string",
    "role": "user|admin",
    "createdAt": "datetime"
  }
]
```

---

### **POST /users**

**Description:** Create a new user  
**Auth Required:** Yes (Admin only)  
**Request:**
```json
{
  "username": "john_doe",
  "password": "string"
}
```

**Response:**
```json
{
  "id": "uuid",
  "username": "john_doe",
  "role": "user",
  "createdAt": "datetime"
}
```

---

### **GET /users/me**

**Description:** Get current user info  
**Auth Required:** Yes  
**Response:**
```json
{
  "id": "uuid",
  "username": "john_doe",
  "role": "user|admin",
  "createdAt": "datetime"
}
```

---

### **GET /users/:id**

**Description:** Get user by ID  
**Auth Required:** Yes (Admin only)  
**Response:**
```json
{
  "id": "uuid",
  "username": "john_doe",
  "role": "user|admin",
  "createdAt": "datetime"
}
```

---

### **DELETE /users/:id**

**Description:** Delete user by ID  
**Auth Required:** Yes (Admin only)  
**Response:** `204 No Content`

---

## 📁 FILES

### **GET /files**

**Description:** List all files (Admins see all, users see accessible files)  
**Auth Required:** Yes  
**Query params:**
- `ownerId` (optional): filter by owner
- `name` (optional): filter by name (partial match)
- `mimeType` (optional): filter by MIME type (partial match)
- `createdAt` (optional): filter by creation date (YYYY-MM-DD)

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "document.pdf",
    "mimeType": "application/pdf",
    "size": 123456,
    "owner": {
      "id": "uuid",
      "username": "john_doe"
    },
    "createdAt": "datetime"
  }
]
```

---

### **GET /files/me**

**Description:** List user's own files  
**Auth Required:** Yes  
**Response:** Array of file objects as above

---

### **POST /files/upload**

**Description:** Upload a new file  
**Auth Required:** Yes  
**Request (multipart/form-data):**
```
Content-Type: multipart/form-data

file: <binary file>
```

**Response:**
```json
{
  "id": "uuid",
  "name": "report.pdf",
  "mimeType": "application/pdf",
  "size": 234567,
  "owner": {
    "id": "uuid",
    "username": "john_doe"
  },
  "createdAt": "datetime"
}
```

---

### **GET /files/:fileId/download**

**Description:** Download file  
**Auth Required:** Yes (Requires READ permission or higher)  
**Response:** Binary stream with appropriate headers

---

### **DELETE /files/:fileId**

**Description:** Delete a file  
**Auth Required:** Yes (Requires WRITE permission or higher)  
**Response:** `200 OK`

---

### **GET /files/:fileId/share-link**

**Description:** Generate presigned share link  
**Auth Required:** Yes (Requires WRITE permission or higher)  
**Response:**
```json
"https://minio.example.com/bucket/file.pdf?signature=..."
```

---

## 🔐 PERMISSIONS

### **GET /permissions**

**Description:** List all permissions  
**Auth Required:** Yes  
**Response:**
```json
[
  {
    "id": "uuid",
    "user": {
      "id": "uuid",
      "username": "alice"
    },
    "file": {
      "id": "uuid",
      "name": "document.pdf",
      "mimeType": "application/pdf",
      "size": 123456,
      "owner": {
        "id": "uuid",
        "username": "john_doe"
      },
      "createdAt": "datetime"
    },
    "permissionLevel": 2,
    "createdAt": "datetime"
  }
]
```

---

### **GET /permissions/file/:fileId**

**Description:** List all users with permissions for a file  
**Auth Required:** Yes  
**Response:**
```json
[
  {
    "id": "uuid",
    "user": {
      "id": "uuid",
      "username": "alice"
    },
    "file": {
      "id": "uuid",
      "name": "document.pdf",
      "mimeType": "application/pdf",
      "size": 123456,
      "owner": {
        "id": "uuid",
        "username": "john_doe"
      },
      "createdAt": "datetime"
    },
    "permissionLevel": 2,
    "createdAt": "datetime"
  }
]
```

---

### **GET /permissions/:id**

**Description:** Get permission by ID  
**Auth Required:** Yes  
**Response:** Permission object as above

---

### **POST /permissions/assign**

**Description:** Assign permission to a user for a file  
**Auth Required:** Yes (Requires SHARE permission or higher)  
**Request:**
```json
{
  "userId": "uuid",
  "fileId": "uuid",
  "permissionLevel": 2
}
```

**Response:** `200 OK`

---

### **PATCH /permissions/:permissionId**

**Description:** Update permission level  
**Auth Required:** Yes (Requires SHARE permission or higher)  
**Request:**
```json
{
  "fileId": "uuid",
  "permissionLevel": 1
}
```

**Response:** Updated permission object
```json
{
  "id": "uuid",
  "user": {
    "id": "uuid",
    "username": "alice"
  },
  "file": {
    "id": "uuid",
    "name": "document.pdf",
    "mimeType": "application/pdf",
    "size": 123456,
    "owner": {
      "id": "uuid",
      "username": "john_doe"
    },
    "createdAt": "datetime"
  },
  "permissionLevel": 1,
  "createdAt": "datetime"
}
```

---

### **DELETE /permissions/:permissionId/file/:fileId**

**Description:** Remove permission from user for file  
**Auth Required:** Yes (Requires SHARE permission or higher)  
**Response:** `200 OK`

---

## 🏗️ REQUEST/RESPONSE DTOs

### Auth DTOs

**LoginDto**
```typescript
{
  username: string;
  password: string;
}
```

**RegisterDto**
```typescript
{
  username: string;
  password: string;
}
```

**LoginResponseDto**
```typescript
{
  user: User;
  token: string;
}
```

### User DTOs

**UserDTO** (Response)
```typescript
{
  id: string;
  username: string;
  role: 'user' | 'admin';
  createdAt: Date;
}
```

**CreateUserDTO** (Request)
```typescript
{
  username: string;
  password: string;
}
```

**UpdateUserDTO** (Request)
```typescript
{
  username?: string;
}
```

### File DTOs

**FileDTO** (Response)
```typescript
{
  id: string;
  name: string;
  mimeType: string;
  size: number;
  owner: UserDTO;
  createdAt: Date;
}
```

**FileQueryDTO** (Query Parameters)
```typescript
{
  name?: string;
  mimeType?: string;
  ownerId?: string;
  createdAt?: Date;
}
```

### Permission DTOs

**PermissionDTO** (Response)
```typescript
{
  id: string;
  file: FileDTO;
  user: UserDTO;
  permissionLevel: 1 | 2; // VIEW | MANAGE
  createdAt: Date;
}
```

**SimplePermissionDTO** (Response)
```typescript
{
  id: string;
  permissionLevel: 1 | 2; // VIEW | MANAGE
}
```

**CreatePermissionDTO** (Request)
```typescript
{
  fileId: string;
  userId: string;
  permissionLevel: 1 | 2; // VIEW | MANAGE
}
```

**UpdatePermissionDTO** (Request)
```typescript
{
  fileId: string;
  permissionLevel: 1 | 2; // VIEW | MANAGE
}
```

---

## ⚙️ 4. BUSINESS LOGIC SUMMARY

| Operation                   | Required Permission Level | Description                            |
| --------------------------- | ------------------------- | -------------------------------------- |
| Upload file                 | Authenticated user        | Creates new file with owner = uploader, uploader gets MANAGE permission |
| View file list/details      | VIEW (1) or higher        | Can see metadata (Admins see all)      |
| Download file               | VIEW (1) or higher        | Can download binary                    |
| Delete file                 | Owner or Admin            | Removes file and permissions           |
| Generate share link         | MANAGE (2) or higher      | Creates presigned URL for external sharing |
| Assign permissions          | MANAGE (2) or higher      | Can grant VIEW access to others; Owner/Admin only for MANAGE |
| Update permissions          | MANAGE (2) or higher      | Can modify to VIEW level; Owner/Admin only for MANAGE |
| Remove permissions          | MANAGE (2) or higher      | Can revoke access from others          |

**Additional Rules:**
- Admins have full access to all operations
- Users cannot assign/remove permissions to/from themselves or admins
- Files are stored in MinIO S3-compatible storage
- Permission levels are hierarchical (higher number = more permissions)
- Owner automatically gets MANAGE permission on upload
- Unique constraint prevents duplicate permissions per user-file pair

---

## 🏗️ SYSTEM ARCHITECTURE & DESIGN

### **Architecture Overview**

This is a **NestJS-based file management system** following a modular monolith architecture with the following components:

```
├── Auth Module: JWT-based authentication with role-based access
├── User Module: User management (CRUD operations)
├── File Module: File operations (upload, download, sharing)
├── Permission Module: Access control and permission management
├── MinIO Module: S3-compatible object storage integration
├── Database: TypeORM with PostgreSQL/MySQL
```

### **Core Design Principles**

1. **Modular Architecture**: Each feature is encapsulated in its own module with clear boundaries
2. **Role-Based Access Control (RBAC)**: Admin vs User roles with different permissions
3. **Granular Permissions**: File-level access control with hierarchical permission levels
4. **Separation of Concerns**: Controllers handle HTTP, Services contain business logic, Entities define data models
5. **Database Transactions**: Critical operations use transactions for data consistency
6. **External Storage**: Files stored in MinIO for scalability and reliability

### **Data Flow**

1. **Authentication**: User logs in → JWT token issued → Subsequent requests include Bearer token
2. **File Upload**:
   - Multipart form data received → File metadata extracted → Database transaction creates File entity and owner Permission → File uploaded to MinIO
3. **File Access**:
   - Request received → Permission checked via PermissionService.hasAccess() → If authorized, file served from MinIO
4. **Permission Management**:
   - User requests permission change → SHARE permission verified → Permission updated in database

### **Security Considerations**

- **JWT Authentication**: Stateless token-based auth with configurable expiration
- **Permission Checks**: Every operation validates user permissions before execution
- **Input Validation**: DTOs with class-validator ensure data integrity
- **SQL Injection Protection**: TypeORM parameterized queries
- **CORS Configuration**: Configurable frontend origin restrictions
- **Password Security**: Proper hashing (assumed bcrypt implementation)

### **Scalability Features**

- **Stateless Design**: No server-side sessions, horizontal scaling possible
- **External Storage**: MinIO handles large file storage efficiently
- **Database Indexing**: Optimized queries for file and permission lookups
- **Caching Ready**: Structure allows Redis integration for performance
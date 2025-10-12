# 📘 API Documentation — File Management System

**Entities:**

* `User`: represents a registered user who can own or have access to files.
* `File`: represents an uploaded file with metadata and ownership.
* `Permission`: defines which user can access which file and at what level.

---

## 🧩 1. USERS

### **GET /users**

**Description:** Get all users
**Response:**

```json
[
  {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "createdAt": "datetime"
  }
]
```

---

### **POST /users**

**Description:** Create a new user (no authentication yet)
**Request:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "plaintext_password"
}
```

**Response:**

```json
{
  "id": "uuid",
  "username": "john_doe",
  "email": "john@example.com",
  "createdAt": "datetime"
}
```

---

### **GET /users/:id**

**Description:** Get user by ID
**Response:**

```json
{
  "id": "uuid",
  "username": "john_doe",
  "email": "john@example.com",
  "files": [
    { "id": "uuid", "name": "report.pdf" }
  ],
  "permissions": [
    { "fileId": "uuid", "permissionType": "read" }
  ]
}
```

---

## 📁 2. FILES

### **GET /files**

**Description:** List all files
**Query params:**

* `ownerId` (optional): filter by owner

**Response:**

```json
[
  {
    "id": "uuid",
    "name": "document.pdf",
    "description": "Quarterly report",
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

### **GET /files/:id**

**Description:** Get file details by ID
**Response:**

```json
{
  "id": "uuid",
  "name": "document.pdf",
  "description": "Quarterly report",
  "storageUrl": "https://storage.example.com/uuid",
  "mimeType": "application/pdf",
  "size": 123456,
  "owner": {
    "id": "uuid",
    "username": "john_doe"
  },
  "permissions": [
    {
      "userId": "uuid",
      "permissionType": "read"
    }
  ],
  "createdAt": "datetime"
}
```

---

### **POST /files**

**Description:** Upload a new file
**Request (multipart/form-data):**

```
Content-Type: multipart/form-data

name: "report.pdf"
description: "Monthly report"
ownerId: "uuid"
file: <binary>
```

**Response:**

```json
{
  "id": "uuid",
  "name": "report.pdf",
  "mimeType": "application/pdf",
  "size": 234567,
  "ownerId": "uuid",
  "storageUrl": "https://storage.example.com/files/uuid",
  "createdAt": "datetime"
}
```

---

### **PUT /files/:id**

**Description:** Update file metadata (name, description)
**Request:**

```json
{
  "name": "renamed_report.pdf",
  "description": "Updated report"
}
```

**Response:**

```json
{
  "id": "uuid",
  "name": "renamed_report.pdf",
  "description": "Updated report",
  "updatedAt": "datetime"
}
```

---

### **DELETE /files/:id**

**Description:** Delete a file (only owner can delete)
**Response:**

```json
{ "message": "File deleted successfully" }
```

---

### **GET /files/:id/download**

**Description:** Download file (must have read permission)
**Response:** Binary stream with appropriate `Content-Type` and `Content-Disposition` headers.

---

## 🔐 3. PERMISSIONS

### **GET /permissions**

**Description:** List all permissions
**Response:**

```json
[
  {
    "id": "uuid",
    "fileId": "uuid",
    "userId": "uuid",
    "permissionType": "read",
    "createdAt": "datetime"
  }
]
```

---

### **GET /permissions/file/:fileId**

**Description:** List all users with permissions for a file
**Response:**

```json
[
  {
    "id": "uuid",
    "user": {
      "id": "uuid",
      "username": "alice"
    },
    "permissionType": "write"
  }
]
```

---

### **POST /permissions**

**Description:** Grant permission to a user for a file
**Request:**

```json
{
  "fileId": "uuid",
  "userId": "uuid",
  "permissionType": "write"
}
```

**Response:**

```json
{
  "id": "uuid",
  "fileId": "uuid",
  "userId": "uuid",
  "permissionType": "write",
  "createdAt": "datetime"
}
```

---

### **PUT /permissions/:id**

**Description:** Update a user's permission type
**Request:**

```json
{
  "permissionType": "share"
}
```

**Response:**

```json
{
  "id": "uuid",
  "fileId": "uuid",
  "userId": "uuid",
  "permissionType": "share"
}
```

---

### **DELETE /permissions/:id**

**Description:** Revoke a user's permission for a file
**Response:**

```json
{ "message": "Permission removed" }
```

---

## ⚙️ 4. BUSINESS LOGIC SUMMARY

| Operation                   | Required Permission | Description                            |
| --------------------------- | ------------------- | -------------------------------------- |
| Upload file                 | — (anyone)          | Creates new file with owner = uploader |
| View file details           | `read` or higher    | Can see metadata                       |
| Download file               | `read` or higher    | Can download binary                    |
| Update file metadata        | `write` or `owner`  | Can modify file info                   |
| Delete file                 | `owner`             | Removes file and permissions           |
| Share file (add permission) | `share` or `owner`  | Can grant access to others             |

---

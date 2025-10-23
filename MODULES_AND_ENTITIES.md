# PTTKHT Backend Documentation

## Database Schema

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role VARCHAR(50) NOT NULL
);
```

### file
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

### permission
```sql
CREATE TABLE permission (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_id UUID REFERENCES file(id) ON DELETE CASCADE,
  permission_level VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, file_id, permission_level)
);
```

## Enums

### Role
```typescript
export enum Role {
  User = 'USER',
  Admin = 'ADMIN',
}
```

### PermissionLevel
```typescript
export enum PermissionLevel {
  VIEW = 'VIEW',
  MANAGE = 'MANAGE'
}
```

## Modules

### Auth Module (`/src/modules/auth/`)
- **Controller Functions:**
  - `POST /auth/login` - Authenticates user and returns JWT token and user information
- **Service Functions:**
  - `login(loginDto: LoginDto)` - Performs user authentication, validates credentials, and generates JWT token

### Users Module (`/src/modules/users/`)
- **Controller Functions:**
  - `GET /users` - Retrieves all users (Admin only)
  - `GET /users/me` - Retrieves current user information
  - `GET /users/:id` - Retrieves a specific user by ID (Admin only)
  - `POST /users` - Creates a new user (Admin only)
  - `DELETE /users/:id` - Deletes a user by ID (Admin only)
- **Service Functions:**
  - `getAllUsers()` - Fetches all users from database
  - `getUserById(id: string)` - Retrieves user by ID
  - `createUser(userDto: CreateUserDTO)` - Creates a new user account
  - `updateUser(id: string, updateUserDto: UpdateUserDTO)` - Updates user information
  - `deleteUser(id: string)` - Removes user from database
  - `getAdmin()` - Retrieves admin user account
  - `onModuleInit()` - Initializes admin user if not exists (with default credentials)

### Files Module (`/src/modules/files/`)
- **Controller Functions:**
  - `GET /files` - Retrieves all accessible files for authenticated user
  - `GET /files/me` - Retrieves files owned by current user
  - `POST /files/upload` - Uploads a new file (multipart form data)
  - `GET /files/:fileId/download` - Downloads a file by ID
  - `DELETE /files/:fileId` - Deletes a file by ID
  - `GET /files/:fileId/share-link` - Generates a shareable link for a file
- **Service Functions:**
  - `uploadFile(file: Express.Multer.File, ownerId: string)` - Uploads file to MinIO and stores metadata
  - `downloadFile(requestUserId: string, requestUserRole: Role, fileId: string)` - Downloads file after permission check
  - `deleteFile(requestUserId: string, requestUserRole: Role, fileId: string)` - Deletes file after permission check
  - `getFileById(id: string)` - Retrieves file metadata by ID
  - `getAllFile(userId: string, userRole: Role, query: FileQueryDTO)` - Retrieves files with optional filtering
  - `getUserFile(id: string)` - Retrieves files owned by specific user
  - `createShareLink(requestUserId: string, requestUserRole: Role, fileId: string)` - Generates presigned URL for sharing
  - `createOwnerPermissionsForFile(file: Express.Multer.File, owner: User)` - Creates owner permissions when uploading

### Permission Module (`/src/modules/permission/`)
- **Controller Functions:**
  - `GET /permissions` - Retrieves all permissions
  - `GET /permissions/file/:fileId` - Retrieves all permissions for a specific file
  - `GET /permissions/:id` - Retrieves a specific permission by ID
  - `POST /permissions/assign` - Assigns permission to user for a file
  - `PATCH /permissions/:permissionId` - Updates existing permission level
  - `DELETE /permissions/:permissionId/file/:fileId` - Removes permission for user from file
- **Service Functions:**
  - `getAllPermissions()` - Fetches all permission records
  - `getAllAccessByFileId(fileId: string)` - Retrieves all permissions for a specific file
  - `getPermissionById(id: string)` - Retrieves permission by ID
  - `getPermissionWithoutRelationById(id: string)` - Retrieves permission without relations
  - `assignPermission(requestUserId: string, requestUserRole: Role, userId: string, fileId: string, permissionLevel: PermissionLevel)` - Assigns permission after validation
  - `removePermission(requestUserId: string, requestUserRole: Role, fileId: string, permissionId: string)` - Removes permission after validation
  - `updatePermission(requestUserId: string, requestUserRole: Role, fileId: string, permissionId: string, permissionLevel: PermissionLevel)` - Updates permission level after validation
  - `hasAccess(userId: string, userRole: Role, fileId: string, required: PermissionLevel)` - Checks if user has required permission level

### MinIO Module (`/src/modules/miniIO/`)
- **Service Functions:**
  - `onModuleInit()` - Creates bucket if it doesn't exist
  - `createBucketIfNotExists()` - Ensures the storage bucket exists
  - `uploadFile(file: Express.Multer.File)` - Uploads file buffer to MinIO storage
  - `downloadFile(objectName: string)` - Downloads file from MinIO as Buffer
  - `removeFile(fileName: string)` - Removes file from MinIO storage
  - `getPresignedUrl(filename: string)` - Generates temporary presigned URL for file sharing

## Services

### AuthService (`/src/modules/auth/auth.service.ts`)
- **Attributes:**
  - `userRepository: Repository<User>` - Repository for user database operations
  - `jwtService: JwtService` - Service for JWT token generation and validation
- **Methods:**
  - `login(loginDto: LoginDto)` - Performs user authentication, validates credentials, and generates JWT token

### UsersService (`/src/modules/users/users.service.ts`)
- **Attributes:**
  - `userRepository: Repository<User>` - Repository for user database operations
- **Methods:**
  - `deleteUser(id: string)` - Removes user from database
  - `getAdmin()` - Retrieves admin user account
  - `onModuleInit()` - Initializes admin user if not exists (with default credentials)
  - `getAllUsers()` - Fetches all users from database
  - `getUserById(id: string)` - Retrieves user by ID
  - `updateUser(id: string, updateUserDto: UpdateUserDTO)` - Updates user information
  - `createUser(userDto: CreateUserDTO)` - Creates a new user account

### FilesService (`/src/modules/files/files.service.ts`)
- **Attributes:**
  - `fileRepository: Repository<FileEntity>` - Repository for file database operations
  - `usersService: UsersService` - Service for user-related operations
  - `minioClientService: MinioClientService` - Service for MinIO storage operations
  - `permissionService: PermissionsService` - Service for permission management
  - `dataSource: DataSource` - Database data source for transaction operations
- **Methods:**
  - `createShareLink(requestUserId: string, requestUserRole: Role, fileId: string)` - Generates presigned URL for sharing
  - `getUserFile(id: string)` - Retrieves files owned by specific user
  - `deleteFile(requestUserId: string, requestUserRole: Role, fileId: string)` - Deletes file after permission check
  - `getFileById(id: string)` - Retrieves file metadata by ID
  - `getAllFile(userId: string, userRole: Role, query: FileQueryDTO)` - Retrieves files with optional filtering
  - `uploadFile(file: Express.Multer.File, ownerId: string)` - Uploads file to MinIO and stores metadata
  - `createOwnerPermissionsForFile(file: Express.Multer.File, owner: User)` - Creates owner permissions when uploading
  - `downloadFile(requestUserId: string, requestUserRole: Role, fileId: string)` - Downloads file after permission check

### PermissionService (`/src/modules/permission/permission.service.ts`)
- **Attributes:**
  - `permissionRepository: Repository<Permission>` - Repository for permission database operations
  - `usersService: UsersService` - Service for user-related operations
  - `filesService: FileService` - Service for file-related operations
- **Methods:**
  - `getAllAccessByFileId(fileId: string)` - Retrieves all permissions for a specific file
  - `updatePermission(requestUserId: string, requestUserRole: Role, fileId: string, permissionId: string, permissionLevel: PermissionLevel)` - Updates permission level after validation
  - `getPermissionById(id: string)` - Retrieves permission by ID
  - `getPermissionWithoutRelationById(id: string)` - Retrieves permission without relations
  - `getAllPermissions()` - Fetches all permission records
  - `removePermission(requestUserId: string, requestUserRole: Role, fileId: string, permissionId: string)` - Removes permission after validation
  - `assignPermission(requestUserId: string, requestUserRole: Role, userId: string, fileId: string, permissionLevel: PermissionLevel)` - Assigns permission after validation
  - `hasAccess(userId: string, userRole: Role, fileId: string, required: PermissionLevel)` - Checks if user has required permission level

### MinioClientService (`/src/modules/miniIO/minio.service.ts`)
- **Attributes:**
  - `bucketName: string` - Name of the MinIO bucket (default: 'pttkht')
  - `minioClient: Client` - MinIO client for storage operations
- **Methods:**
  - `onModuleInit()` - Creates bucket if it doesn't exist
  - `createBucketIfNotExists()` - Ensures the storage bucket exists
  - `getPresignedUrl(filename: string)` - Generates temporary presigned URL for file sharing
  - `uploadFile(file: Express.Multer.File)` - Uploads file buffer to MinIO storage
  - `removeFile(fileName: string)` - Removes file from MinIO storage
  - `downloadFile(objectName: string): Promise<Buffer>` - Downloads file from MinIO as Buffer

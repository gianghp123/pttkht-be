import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionType, Role } from 'src/constants/enums';
import { DataSource, Repository } from 'typeorm';
import { MinioClientService } from '../miniIO/minio.service';
import { Permission } from '../permission/entities/permission.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { FileEntity } from './entities/file.entity';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,
    private readonly usersService: UsersService,
    private readonly minioClientService: MinioClientService,
    private dataSource: DataSource,
  ) {}

  async createShareLink(
    fileId: string,
    currentUserId: string,
  ): Promise<String> {
    const file = await this.getFileById(fileId);
    if (!file) {
      throw new NotFoundException('File not found');
    }
    const user = await this.usersService.getUserById(currentUserId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== Role.Admin && file.owner.id !== user.id) {
      throw new ForbiddenException(
        'You dont have permission to create share link for this file',
      );
    }
    const presignedUrl = await this.minioClientService.getPresignedUrl(
      file.name,
    );
    return presignedUrl;
  }

  async getUserFile(id: string) {
    return await this.fileRepository.find({
      where: {
        owner: {
          id,
        },
      },
    });
  }

  async getFileAllAccess(fileId: string) {
    const file = await this.fileRepository.findOne({
      where: {
        id: fileId,
      },
      relations: {
        permissions: {
          user: true,
        },
      },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return file.permissions || [];
  }

  async deleteFile(userId: string, id: string) {
    const user = await this.usersService.getUserById(userId);
    const file = await this.getFileById(id);
    if (user.role !== Role.Admin && file.owner.id !== user.id) {
      throw new ForbiddenException(
        'You dont have permission to delete this file',
      );
    }
    if (!file) {
      throw new NotFoundException('File not found');
    }
    await this.fileRepository.remove(file);
    await this.minioClientService.removeFile(file.name);
  }

  async getFileById(id: string): Promise<FileEntity> {
    const file = await this.fileRepository.findOne({
      relations: {
        permissions: true,
        owner: true,
      },
      where: {
        id,
      },
    });
    if (!file) {
      throw new NotFoundException('File not found');
    }
    return file;
  }

  async getAllFile(currentUserId: string): Promise<FileEntity[]> {
    const files = await this.fileRepository
      .createQueryBuilder('file')
      .leftJoinAndSelect('file.owner', 'owner')
      .leftJoinAndSelect(
        'file.permissions',
        'permission',
        'permission.user_id = :userId', // condition applied *only to the join*
        { userId: currentUserId },
      )
      .getMany();
    return files;
  }

  async uploadFile(
    file: Express.Multer.File,
    ownerId: string,
  ): Promise<FileEntity> {
    const owner = await this.usersService.getUserById(ownerId);

    const existingFile = await this.fileRepository.findOneBy({
      name: file.originalname,
    });
    if (existingFile) {
      file.originalname = `${file.originalname}-${Date.now()}`;
    }
    const savedFile = await this.createAdminAndOwnerPermissionsForFile(
      file,
      owner,
    );
    await this.minioClientService.uploadFile(file);
    return savedFile;
  }

  async createAdminAndOwnerPermissionsForFile(
    file: Express.Multer.File,
    owner: User,
  ) {
    const admin = await this.usersService.getAdmin();
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const fileEntity = queryRunner.manager.create(FileEntity, {
        name: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        path: file.path,
        owner,
      });

      const savedFile = await queryRunner.manager.save(FileEntity, fileEntity);

      const permissions = [
        {
          file: savedFile,
          user: admin,
          permissionType: PermissionType.READ,
        },
        {
          file: savedFile,
          user: admin,
          permissionType: PermissionType.WRITE,
        },
        {
          file: savedFile,
          user: admin,
          permissionType: PermissionType.SHARE,
        },
      ];

      if (owner.id !== admin.id) {
        permissions.push(
          {
            file: savedFile,
            user: owner,
            permissionType: PermissionType.READ,
          },
          {
            file: savedFile,
            user: owner,
            permissionType: PermissionType.WRITE,
          },
          {
            file: savedFile,
            user: owner,
            permissionType: PermissionType.SHARE,
          },
        );
      }

      await queryRunner.manager.save(Permission, permissions);
      await queryRunner.commitTransaction();
      return savedFile;
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        err,
        'Error while creating file and permissions',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async downloadFile(fileId: string, userId: string) {
    const file = await this.fileRepository.findOne({
      relations: {
        permissions: true,
      },
      where: {
        id: fileId,
        permissions: {
          user: {
            id: userId,
          },
          permissionType: PermissionType.WRITE,
        },
      },
    });
    if (!file) {
      throw new ForbiddenException(
        'File not found or you do not have permission to download this file',
      );
    }
    return {
      fileBuffer: await this.minioClientService.downloadFile(file.name),
      fileName: file.name,
    };
  }
}

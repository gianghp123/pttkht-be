import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionLevel, Role } from 'src/core/constants/enums';
import { DataSource, Repository } from 'typeorm';
import { MinioClientService } from '../miniIO/minio.service';
import { Permission } from '../permission/entities/permission.entity';
import { PermissionsService } from '../permission/permission.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { FileQueryDTO } from './dtos/file.dto';
import { FileEntity } from './entities/file.entity';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,
    private usersService: UsersService,
    private minioClientService: MinioClientService,
    @Inject(forwardRef(() => PermissionsService))
    private permissionService: PermissionsService,
    private dataSource: DataSource,
  ) {}

  async createShareLink(
    requestUserId: string,
    requestUserRole: Role,
    fileId: string,
  ): Promise<String> {
    if (
      !(await this.permissionService.hasAccess(
        requestUserId,
        requestUserRole,
        fileId,
        PermissionLevel.MANAGE,
      ))
    ) {
      throw new ForbiddenException(
        'You dont have permission to create share link for this file',
      );
    }
    const file = await this.getFileById(fileId);
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

  async deleteFile(
    requestUserId: string,
    requestUserRole: Role,
    fileId: string,
  ) {
    const file = await this.getFileById(fileId);
    if (file.owner.id !== requestUserId && requestUserRole !== Role.Admin) {
      throw new ForbiddenException(
        'Only the file owner or admin can delete this file',
      );
    }
    try {
      await this.fileRepository.remove(file);
      await this.minioClientService.removeFile(file.name);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error while deleting file',
      );
    }
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

  async getAllFile(query: FileQueryDTO): Promise<FileEntity[]> {
    console.log(query);
    const queryBuilder = this.fileRepository
      .createQueryBuilder('file')
      .leftJoinAndSelect('file.owner', 'owner');
    if (query.ownerId) {
      queryBuilder.andWhere('file.owner.id = :ownerId', {
        ownerId: query.ownerId,
      });
    }
    if (query.name) {
      queryBuilder.andWhere('file.name LIKE :name', {
        name: `%${query.name}%`,
      });
    }
    if (query.mimeType) {
      queryBuilder.andWhere('file.mimeType LIKE :mimeType', {
        mimeType: `%${query.mimeType}%`,
      });
    }
    if (query.createdAt) {
      const date = query.createdAt;
      const nextDay = new Date(date);
      nextDay.setUTCDate(date.getUTCDate() + 1);

      queryBuilder.andWhere(
        'file.createdAt >= :start AND file.createdAt < :end',
        {
          start: date.toISOString(),
          end: nextDay.toISOString(),
        },
      );
    }
    const files = await queryBuilder.getMany();
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
    const savedFile = await this.createOwnerPermissionsForFile(file, owner);
    
    return savedFile;
  }

  async createOwnerPermissionsForFile(file: Express.Multer.File, owner: User) {
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

      if (owner.id !== admin.id) {
        const permission = queryRunner.manager.create(Permission, {
          file: savedFile,
          user: owner,
          permissionLevel: PermissionLevel.MANAGE,
        });
        await queryRunner.manager.save(Permission, permission);
      }

      await this.minioClientService.uploadFile(file);

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

  async downloadFile(
    requestUserId: string,
    requestUserRole: Role,
    fileId: string,
  ) {
    if (
      !(await this.permissionService.hasAccess(
        requestUserId,
        requestUserRole,
        fileId,
        PermissionLevel.VIEW,
      ))
    ) {
      throw new ForbiddenException(
        'You do not have permission to download this file',
      );
    }
    const file = await this.getFileById(fileId);
    return {
      fileBuffer: await this.minioClientService.downloadFile(file.name),
      fileName: file.name,
    };
  }
}

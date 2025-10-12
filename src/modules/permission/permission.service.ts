import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionType, Role } from 'src/constants/enums';
import { ensureUnique } from 'src/core/utils/check-unique.util';
import { Repository } from 'typeorm';
import { FileService } from '../files/file.service';
import { UsersService } from '../users/users.service';
import { UpdatePermissionDTO } from './dtos/permission.dto';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @Inject(forwardRef(() => FileService))
    private readonly fileService: FileService,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
  ) {}

  async updatePermission(
    id: string,
    dto: UpdatePermissionDTO,
  ): Promise<Permission> {
    const permission = await this.getPermissionById(id);
    permission.permissionType = dto.permissionType;
    const updatedPermission = await this.permissionRepository.save(permission);
    return updatedPermission;
  }

  async getPermissionById(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      relations: {
        file: {
          owner: true,
        },
        user: true,
      },
      where: {
        id,
      },
    });
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    return permission;
  }

  async createPermission(
    fileId: string,
    userId: string,
    permissionType: PermissionType,
  ): Promise<Permission> {
    const file = await this.fileService.getFileById(fileId);
    const user = await this.userService.getUserById(userId);
    ensureUnique(
      this.permissionRepository,
      { file, user, permissionType },
      'Permission',
    );
    const permission = this.permissionRepository.create({
      file,
      user,
      permissionType,
    });
    const createdPermission = await this.permissionRepository.save(permission);
    return createdPermission;
  }

  async getAllPermissions(): Promise<Permission[]> {
    return await this.permissionRepository.find({
      relations: {
        file: true,
        user: true,
      },
    });
  }

  async removePermission(ownerId: string, permissionId: string): Promise<void> {
    const owner = await this.userService.getUserById(ownerId);
    if (!owner) {
      throw new NotFoundException('Owner not found');
    }
    const permission = await this.getPermissionById(permissionId);
    if (owner.role !== Role.Admin && permission.file.owner.id !== ownerId) {
      throw new ForbiddenException(
        "You don't have permission to remove permission to this file",
      );
    }
    if (permission.user.id === ownerId || permission.user.role === Role.Admin) {
      throw new ForbiddenException(
        "You don't have permission to remove permission to this user",
      );
    }
    await this.permissionRepository.delete(permission);
  }

  async assignPermission(
    ownerId: string,
    userId: string,
    fileId: string,
    permissionType: PermissionType,
  ): Promise<void> {
    const owner = await this.userService.getUserById(ownerId);
    if (!owner) {
      throw new NotFoundException('Owner not found');
    }
    const file = await this.fileService.getFileById(fileId);
    if (owner.role !== Role.Admin && file.owner.id !== ownerId) {
      throw new ForbiddenException(
        "You don't have permission to assign permission to this file",
      );
    }
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.id === ownerId || user.role === Role.Admin) {
      throw new ForbiddenException(
        "You don't have permission to assign permission to this user",
      );
    }

    const access = await this.permissionRepository.findOne({
      where: {
        file: {
          id: fileId,
        },
        user: {
          id: userId,
        },
        permissionType,
      },
    });

    if (access) {
      throw new BadRequestException('User already has permission');
    }
    await this.createPermission(fileId, userId, permissionType);
  }
}

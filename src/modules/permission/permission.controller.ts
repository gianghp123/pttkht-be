import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  CreatePermissionDTO,
  PermissionDTO,
  UpdatePermissionDTO,
} from './dtos/permission.dto';
import { PermissionsService } from './permission.service';

@ApiBearerAuth()
@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @ApiOkResponse({ type: [PermissionDTO] })
  @Get()
  async getAllPermissions(): Promise<PermissionDTO[]> {
    return PermissionDTO.fromEntities(
      await this.permissionsService.getAllPermissions(),
    );
  }

  @ApiOkResponse({ type: PermissionDTO })
  @Get('admin/:id')
  async getPermissionById(@Param('id') id: string): Promise<PermissionDTO> {
    const permission = await this.permissionsService.getPermissionById(id);
    return PermissionDTO.fromEntity(permission);
  }

  @ApiOkResponse({ type: PermissionDTO })
  @Patch(':permissionId')
  async updatePermission(
    @Param('permissionId') permissionId: string,
    @Body() dto: UpdatePermissionDTO,
  ): Promise<PermissionDTO> {
    return PermissionDTO.fromEntity(
      await this.permissionsService.updatePermission(permissionId, dto),
    );
  }

  @Post('assign')
  async assignPermissionToFile(
    @Request() req,
    @Body() body: CreatePermissionDTO,
  ): Promise<void> {
    const ownerId = req.user.id;
    return this.permissionsService.assignPermission(
      ownerId,
      body.userId,
      body.fileId,
      body.permissionType,
    );
  }

  @Delete(':permissionId')
  async removePermissionFromFile(
    @Request() req,
    @Param('permissionId') permissionId: string,
  ): Promise<void> {
    const ownerId = req.user.id;
    return this.permissionsService.removePermission(ownerId, permissionId);
  }
}

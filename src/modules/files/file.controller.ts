import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { Role } from 'src/constants/enums';
import { Roles } from 'src/core/decorators/role.decorator';
import { PermissionDTO } from '../permission/dtos/permission.dto';
import { FileDTO, FileDTOWithPermissions } from './dtos/file.dto';
import { FileService } from './file.service';

@ApiBearerAuth()
@ApiTags('File')
@Controller('files')
export class FileController {
  constructor(private readonly filesService: FileService) {}

  @ApiOkResponse({ type: [FileDTOWithPermissions] })
  @Get()
  async getAllFile(@Request() req): Promise<FileDTOWithPermissions[]> {
    const files = await this.filesService.getAllFile(req.user.id);
    return FileDTOWithPermissions.fromEntities(files);
  }

  @ApiOkResponse({ type: FileDTO })
  @Get('me')
  async getMyFile(@Request() req): Promise<FileDTO[]> {
    const files = await this.filesService.getUserFile(req.user.id);
    return FileDTO.fromEntities(files);
  }

  @ApiOkResponse({ type: FileDTO })
  @Get(':id')
  async getFileById(@Param('id') id: string): Promise<FileDTO> {
    const file = await this.filesService.getFileById(id);
    return FileDTO.fromEntity(file);
  }

  @Roles(Role.Admin)
  @ApiOkResponse({ type: [FileDTO] })
  @Get('admin/:id/owner')
  async getUserFile(@Param('id') id: string): Promise<FileDTO[]> {
    const files = await this.filesService.getUserFile(id);
    return FileDTO.fromEntities(files);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFile(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<FileDTO> {
    const ownerId = req.user.id;
    return FileDTO.fromEntity(
      await this.filesService.uploadFile(file, ownerId),
    );
  }

  @Get(':fileId/download')
  async downloadFile(
    @Request() req,
    @Param('fileId') fileId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { fileBuffer, fileName } = await this.filesService.downloadFile(
      fileId,
      req.user.id,
    );
    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });
    return new StreamableFile(fileBuffer);
  }

  @Delete(':id')
  async deleteFile(@Request() req, @Param('id') id: string): Promise<void> {
    await this.filesService.deleteFile(req.user.id, id);
  }

  @ApiOkResponse({ type: [PermissionDTO] })
  @Get(':fileId/all-access')
  async getAllAccess(
    @Param('fileId') fileId: string,
  ): Promise<PermissionDTO[]> {
    const accessList = await this.filesService.getFileAllAccess(fileId);
    return PermissionDTO.fromEntities(accessList);
  }

  @Get(':fileId/share-link')
  async createShareLink(
    @Request() req,
    @Param('fileId') fileId: string,
  ): Promise<String> {
    const shareLink = await this.filesService.createShareLink(
      fileId,
      req.user.id,
    );
    return shareLink;
  }
}

import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
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
import { FileDTO, FileQueryDTO } from './dtos/file.dto';
import { FileService } from './file.service';

@ApiBearerAuth()
@ApiTags('File')
@Controller('files')
export class FileController {
  constructor(private readonly filesService: FileService) {}

  @ApiOkResponse({ type: [FileDTO] })
  @Get()
  async getAllFile(@Request() req, @Query() query: FileQueryDTO): Promise<FileDTO[]> {
    const files = await this.filesService.getAllFile(req.user.id, req.user.role, query);
    return FileDTO.fromEntities(files);
  }

  @ApiOkResponse({ type: FileDTO })
  @Get('me')
  async getMyFile(@Request() req): Promise<FileDTO[]> {
    const files = await this.filesService.getUserFile(req.user.id);
    return FileDTO.fromEntities(files);
  }


  @Get(':fileId/download')
  async downloadFile(
    @Request() req,
    @Param('fileId') fileId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { fileBuffer, fileName, mimeType } = await this.filesService.downloadFile(
      req.user.id,
      req.user.role,
      fileId,
    );
    res.set({
      'Content-Type': mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Access-Control-Expose-Headers': 'Content-Disposition', // <- expose it to frontend
    });
    return new StreamableFile(fileBuffer);
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

  @ApiOkResponse({ type: FileDTO })
  @Delete(':fileId')
  async deleteFile(
    @Request() req,
    @Param('fileId') fileId: string,
  ): Promise<FileDTO> {
    const file = await this.filesService.deleteFile(req.user.id, req.user.role, fileId);
    return FileDTO.fromEntity(file);
  }

  @Get(':fileId/share-link')
  async createShareLink(
    @Request() req,
    @Param('fileId') fileId: string,
  ): Promise<String> {
    const shareLink = await this.filesService.createShareLink(
      req.user.id,
      req.user.role,
      fileId,
    );
    return shareLink;
  }
}

import { Type } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { PermissionType } from 'src/constants/enums';
import { AutoExpose } from 'src/core/decorators/auto-expose.decorator';
import { BaseResponseDto } from 'src/core/dto/base.dto';
import { FileDTO } from 'src/modules/files/dtos/file.dto';
import { UserDTO } from 'src/modules/users/dtos/user.dto';

@AutoExpose()
export class PermissionDTO extends BaseResponseDto {
  id: string;
  @Type(() => FileDTO)
  file: FileDTO;
  @Type(() => UserDTO)
  user: UserDTO;
  permissionType: PermissionType;
  createdAt: Date;
}

@AutoExpose()
export class SimplePermissionDTO {
  id: string;
  permissionType: PermissionType;
}

export class CreatePermissionDTO {
  fileId: string;
  userId: string;
  @IsEnum(PermissionType, {
    message: `permission must be one of ${Object.values(PermissionType)}`,
  })
  permissionType: PermissionType;
}

export class UpdatePermissionDTO {
  @IsEnum(PermissionType, {
    message: `permission must be one of ${Object.values(PermissionType)}`,
  })
  permissionType: PermissionType;
}

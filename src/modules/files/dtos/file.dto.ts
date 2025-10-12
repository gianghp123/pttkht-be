import { Type } from 'class-transformer';
import { AutoExpose } from 'src/core/decorators/auto-expose.decorator';
import { BaseResponseDto } from 'src/core/dto/base.dto';
import { SimplePermissionDTO } from 'src/modules/permission/dtos/permission.dto';
import { UserDTO } from 'src/modules/users/dtos/user.dto';

@AutoExpose()
export class FileDTO extends BaseResponseDto {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  @Type(() => UserDTO)
  owner: UserDTO;
  createdAt: Date;
}

@AutoExpose()
export class FileDTOWithPermissions extends FileDTO {
  @Type(() => SimplePermissionDTO)
  permissions: SimplePermissionDTO[];
}

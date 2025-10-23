import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';
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
  @Type(() => SimplePermissionDTO)
  permissions: SimplePermissionDTO[];
  createdAt: Date;
}

export class FileQueryDTO {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  mimeType?: string;

  @IsString()
  @IsOptional()
  ownerId?: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  createdAt?: Date;
}

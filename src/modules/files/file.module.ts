import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinioClientModule } from '../miniIO/minio.module';
import { PermissionsModule } from '../permission/permission.module';
import { UserModule } from '../users/user.module';
import { FileEntity } from './entities/file.entity';
import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    forwardRef(() => PermissionsModule),
    forwardRef(() => UserModule),
    MinioClientModule,
  ],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}

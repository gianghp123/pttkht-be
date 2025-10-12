import { Permission } from 'src/modules/permission/entities/permission.entity';
import { User } from 'src/modules/users/entities/user.entity';
import type { Relation } from 'typeorm';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('file')
export class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  mimeType?: string;

  @Column({ type: 'int', nullable: true })
  size?: number;

  @ManyToOne(() => User, (user) => user.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: Relation<User>;

  @OneToMany(() => Permission, (perm) => perm.file, { onDelete: 'CASCADE' })
  permissions: Relation<Permission[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

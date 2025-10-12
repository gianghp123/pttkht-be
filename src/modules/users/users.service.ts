import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/constants/enums';
import { BcryptUtil } from 'src/core/utils/bcrypt.util';
import { Repository } from 'typeorm';
import { UpdateUserDTO } from './dtos/user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async deleteUser(id: string): Promise<void> {
    const user = await this.getUserById(id);
    await this.userRepository.delete(user);
  }

  async getAdmin(): Promise<User> {
    const admin = await this.userRepository.findOne({
      where: { role: Role.Admin },
    });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return admin;
  }

  async onModuleInit() {
    const admin = await this.userRepository.findOneBy({ role: Role.Admin });
    if (!admin) {
      const password = await BcryptUtil.hash('admin');
      await this.userRepository.save({
        username: 'admin',
        passwordHash: password,
        role: Role.Admin,
      });
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDTO): Promise<User> {
    const user = await this.getUserById(id);
    this.userRepository.merge(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);
    return updatedUser;
  }
}

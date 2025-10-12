import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginDto, LoginResponseDto, RegisterDto } from './dtos/auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { ensureUnique } from 'src/core/utils/check-unique.util';
import { BcryptUtil } from 'src/core/utils/bcrypt.util';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userRepository.findOneBy({ username: loginDto.username });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await BcryptUtil.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }
    const payload = { sub: user.id, username: user.username, role: user.role };
    const token = this.jwtService.sign(payload);
    return { user, token };
  }
  
  async register(registerDto: RegisterDto): Promise<User> {
    ensureUnique(this.userRepository, { username: registerDto.username }, 'User')
    const user = this.userRepository.create({
      username: registerDto.username,
      passwordHash: await BcryptUtil.hash(registerDto.password),
    });
    const savedUser = await this.userRepository.save(user);
    return savedUser;
  }
  // Add methods here
}

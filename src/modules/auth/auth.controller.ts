import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from 'src/core/decorators/public.decorator';
import { UserDTO } from '../users/dtos/user.dto';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dtos/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto): Promise<UserDTO> {
    return UserDTO.fromEntity(await this.authService.register(registerDto));
  }

  @Public()
  @Post('login')
  @ApiBody({ type: LoginDto })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<UserDTO> {
    const { user, token } = await this.authService.login(loginDto);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: new Date(253402300000000),
    });
    return UserDTO.fromEntity(user);
  }
}

import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from 'src/shared/guards/local-auth.guard';
import { RegisterUserDto } from '../../dtos/register-user.dto';
import { User } from 'src/infrastructure/database/entities/user.entity';
import { LoginUserDto } from '../../dtos/login-user.dto';
import { Public } from 'src/shared/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto): Promise<User> {
    return this.authService.register(registerUserDto);
  }

  @Public()
  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<Omit<User, 'password'>> {
    return this.authService.login(loginUserDto);
  }
}

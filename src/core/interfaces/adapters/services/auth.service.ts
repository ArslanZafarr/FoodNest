import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDto } from '../../dtos/register-user.dto';
import { LoginUserDto } from '../../dtos/login-user.dto';
import { User } from 'src/infrastructure/database/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from 'src/infrastructure/database/entities/profile.entity';
import { Role } from 'src/infrastructure/database/entities/role.entity';
import { UserRole } from 'src/infrastructure/database/entities/user-role.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<any> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: registerUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(registerUserDto.password, salt);

      const user = new User();
      user.email = registerUserDto.email;
      user.password = hashedPassword;

      const profile = new Profile();
      profile.name = registerUserDto.name;
      profile.phone = registerUserDto.phone;
      profile.address = registerUserDto.address;
      profile.user = user;

      const role = await this.roleRepository.findOne({
        where: { name: registerUserDto.role },
      });

      if (!role) {
        throw new NotFoundException(`Role '${registerUserDto.role}' not found`);
      }

      await this.userRepository.save(user);
      await this.profileRepository.save(profile);

      const userRole = new UserRole();
      userRole.user = user;
      userRole.role = role;
      userRole.user_id = user.id;
      userRole.role_id = role.id;
      await this.userRoleRepository.save(userRole);
      await this.userRepository.save(user);

      const payload = { email: user.email, role: role.name, sub: user.id };
      const token = this.jwtService.sign(payload);

      return {
        success: true,
        message: 'User registered successfully!',
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          update_at: user.update_at,
          profile: {
            id: profile.id,
            name: profile.name,
            phone: profile.phone,
            address: profile.address,
          },
          role: role.name,
        },
        token,
      };
    } catch (error) {
      return {
        success: false,
        message: 'User registration failed!',
        error: error.message,
      };
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<any> {
    try {
      const { email, password } = loginUserDto;

      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['profile', 'userRoles', 'userRoles.role'],
      });

      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const { password: _, userRoles, ...result } = user;
      const role = userRoles.length > 0 ? userRoles[0].role.name : null;
      const payload = { email: user.email, role: role, sub: user.id };
      const token = this.jwtService.sign(payload);

      return {
        success: true,
        message: 'User logged in successfully!',
        user: {
          ...result,
          profile: {
            id: user.profile.id,
            name: user.profile.name,
            phone: user.profile.phone,
            address: user.profile.address,
          },
          role,
        },
        token,
      };
    } catch (error) {
      return {
        success: false,
        message: 'User login failed!',
        error: error.message,
      };
    }
  }
}

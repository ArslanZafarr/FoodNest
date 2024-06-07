import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDto } from '../../dtos/register-user.dto'; // Assuming the DTO is named RegisterUserDto
import { LoginUserDto } from '../../dtos/login-user.dto';
import { User } from 'src/infrastructure/database/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from 'src/infrastructure/database/entities/profile.entity';
import { Role } from 'src/infrastructure/database/entities/role.entity';
import { UserRole } from 'src/infrastructure/database/entities/user-role.entity';
import { Repository } from 'typeorm';

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
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    // Check if the email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerUserDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash the password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(registerUserDto.password, salt);

    // Create a new user
    const user = new User();
    user.email = registerUserDto.email;
    user.password = hashedPassword;

    // Create a new profile
    const profile = new Profile();

    profile.name = registerUserDto.name;
    profile.phone = registerUserDto.phone;
    profile.address = registerUserDto.address;

    // Set the user for the profile
    profile.user = user;

    // Get the role based on the provided name
    const role = await this.roleRepository.findOne({
      where: { name: registerUserDto.role },
    });

    if (!role) {
      throw new NotFoundException(`Role '${registerUserDto.role}' not found`);
    }

    // Save the user, profile, and user-role relation
    await this.userRepository.save(user);

    // profile.user_id = user.id;
    await this.profileRepository.save(profile);

    // Assign the role to the user
    const userRole = new UserRole();
    userRole.user = user;
    userRole.role = role;
    userRole.user_id = user.id;
    userRole.role_id = role.id;
    await this.userRoleRepository.save(userRole);

    // Assign the profile to the user
    await this.userRepository.save(user);

    return user;
  }

  async login(loginUserDto: LoginUserDto): Promise<any> {
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

    // Assuming each user has exactly one role, get the first role's name
    const role = userRoles.length > 0 ? userRoles[0].role.name : null;

    return { ...result, role };
  }
}

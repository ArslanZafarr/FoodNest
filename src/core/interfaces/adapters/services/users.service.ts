import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from 'src/infrastructure/database/entities/profile.entity';
import { User } from 'src/infrastructure/database/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../../dtos/create-user.dto';
import { UpdateUserDto } from '../../dtos/update-user.dto';
import * as bcrypt from 'bcryptjs';

interface CreateUserResponse {
  success: boolean;
  message: string;
  user?: User;
}

interface UpdateUserResponse {
  success: boolean;
  message: string;
  user?: User;
}

interface DeleteUserResponse {
  success: boolean;
  message: string;
}

interface FindAllUsersResponse {
  success: boolean;
  message: string;
  users: User[];
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<CreateUserResponse> {
    try {
      // Check if the email already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }

      const user = new User();
      user.email = createUserDto.email;

      // Hash the password using bcryptjs
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(createUserDto.password, salt);

      // Set other user properties
      const profile = new Profile();
      profile.name = createUserDto.name;
      profile.phone = createUserDto.phone;
      profile.address = createUserDto.address;

      await this.userRepository.save(user);
      profile.user = user;
      // profile.user_id = user.id;
      await this.profileRepository.save(profile);

      // Fetch the user and profile separately
      const fetchedUser = await this.userRepository.findOne({
        where: { id: user.id },
        relations: ['profile'],
      });

      // Concatenate user and profile and return, excluding the password field
      const userWithProfile = {
        ...fetchedUser,
      };
      delete userWithProfile.password; // Exclude password field

      return {
        success: true,
        message: 'User created successfully!',
        user: userWithProfile,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error; // Re-throw known exceptions
      }
      throw new InternalServerErrorException(
        'An error occurred while creating the user',
      );
    }
  }

  async findAll(): Promise<FindAllUsersResponse> {
    const users = await this.userRepository.find({ relations: ['profile'] });
    users.forEach((user) => delete user.password); // Exclude password field
    return {
      success: true,
      message: 'Users found',
      users: users,
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    delete user.password; // Exclude password field
    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UpdateUserResponse> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email) {
      user.email = updateUserDto.email;
    }

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    if (user.profile) {
      if (updateUserDto.name) user.profile.name = updateUserDto.name;
      if (updateUserDto.phone) user.profile.phone = updateUserDto.phone;
      if (updateUserDto.address) user.profile.address = updateUserDto.address;
    }

    await this.userRepository.save(user);
    delete user.password; // Exclude password field
    return {
      success: true,
      message: 'User updated successfully',
      user,
    };
  }

  async remove(id: number): Promise<DeleteUserResponse> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.delete(id);
    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }
}

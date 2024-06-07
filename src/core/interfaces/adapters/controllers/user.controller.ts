import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services/users.service';
import { CreateUserDto } from '../../dtos/create-user.dto';
import { UpdateUserDto } from '../../dtos/update-user.dto';
import { User } from 'src/infrastructure/database/entities/user.entity';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';

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

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles('admin') // Only admin can create users
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() createUserDto: CreateUserDto): Promise<CreateUserResponse> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles('admin') // Only admin can create users
  findAll(): Promise<FindAllUsersResponse> {
    return this.userService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'customer', 'restaurant')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Put(':id')
  @Roles('admin', 'customer', 'restaurant')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UpdateUserResponse> {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @Roles('admin') // Only admin can delete users
  remove(@Param('id') id: string): Promise<DeleteUserResponse> {
    return this.userService.remove(+id);
  }
}

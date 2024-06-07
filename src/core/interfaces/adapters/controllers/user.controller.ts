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
} from '@nestjs/common';
import { UserService } from '../services/users.service';
import { CreateUserDto } from '../../dtos/create-user.dto';
import { UpdateUserDto } from '../../dtos/update-user.dto';
import { User } from 'src/infrastructure/database/entities/user.entity';

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
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() createUserDto: CreateUserDto): Promise<CreateUserResponse> {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll(): Promise<FindAllUsersResponse> {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UpdateUserResponse> {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<DeleteUserResponse> {
    return this.userService.remove(+id);
  }
}

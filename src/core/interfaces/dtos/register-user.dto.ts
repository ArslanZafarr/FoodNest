// register-user.dto.ts

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(15)
  phone?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(100)
  address?: string;

  @IsNotEmpty()
  role: string; // Assuming role is optional and passed during registration
}

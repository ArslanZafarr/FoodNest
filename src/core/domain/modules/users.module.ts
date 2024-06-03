import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from 'src/core/interfaces/adapters/services/users.service';
import { Profile } from 'src/infrastructure/database/entities/profile.entity';
import { Role } from 'src/infrastructure/database/entities/role.entity';
import { UserRole } from 'src/infrastructure/database/entities/user-role.entity';
import { User } from 'src/infrastructure/database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, UserRole, Profile])],
  controllers: [],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

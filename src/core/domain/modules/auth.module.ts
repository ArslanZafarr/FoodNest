import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/core/domain/modules/users.module';
import { AuthController } from 'src/core/interfaces/adapters/controllers/auth.controller';
import { AuthService } from 'src/core/interfaces/adapters/services/auth.service';
import { JwtStrategy } from 'src/core/interfaces/adapters/strategies/jwt.strategy';
import { LocalStrategy } from 'src/core/interfaces/adapters/strategies/local.strategy';
import { Profile } from 'src/infrastructure/database/entities/profile.entity';
import { Role } from 'src/infrastructure/database/entities/role.entity';
import { UserRole } from 'src/infrastructure/database/entities/user-role.entity';
import { User } from 'src/infrastructure/database/entities/user.entity';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User, Profile, UserRole, Role]), // Import User entity into AuthModule
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '60m' },
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}

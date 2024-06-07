import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/core/domain/modules/auth.module';
import { UserModule } from 'src/core/domain/modules/users.module';

import { typeOrmConfig } from 'src/infrastructure/config/database.config';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), AuthModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

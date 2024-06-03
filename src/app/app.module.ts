import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/core/domain/modules/users.module';
import { AuthModule } from 'src/core/interfaces/adapters/controllers/auth.module';
import { typeOrmConfig } from 'src/infrastructure/config/database.config';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), AuthModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

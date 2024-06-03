import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Role } from '../database/entities/role.entity';
import { UserRole } from '../database/entities/user-role.entity';
import { Profile } from '../database/entities/profile.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'rootAdmin1',
  database: 'food_app',
  entities: [User, Role, UserRole, Profile],
  synchronize: true,
};

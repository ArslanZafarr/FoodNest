import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as multer from 'multer';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Multer configuration
  app.use(multer().none());
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(5000);
}
bootstrap();

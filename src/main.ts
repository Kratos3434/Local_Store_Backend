import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const globalPrefix = 'dev';
  app.setGlobalPrefix(globalPrefix);

  dotenv.config();

  app.use(cookieParser());
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }));

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();

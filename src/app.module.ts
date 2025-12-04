import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { UserService } from './user/user.service';
import { PrismaService } from './prisma/prisma.service';
import { UserController } from './user/user.controller';

@Module({
  controllers: [
    AppController,
    AuthController,
    UserController,
  ],
  providers: [
    AppService,
    PrismaService,
    AuthService,
    UserService,
  ],
  exports: [PrismaService],
})
export class AppModule {}

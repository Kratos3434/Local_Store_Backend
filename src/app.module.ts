import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { UserService } from './user/user.service';
import { PrismaService } from './prisma/prisma.service';
import { UserController } from './user/user.controller';
import { SellerService } from './seller/seller.service';
import { StoreController } from './store/store.controller';
import { SellerController } from './seller/seller.controller';
import { StoreService } from './store/store.service';
import { StoreCategoryController } from './store-category/store-category.controller';
import { StoreCategoryService } from './store-category/store-category.service';

@Module({
  controllers: [
    AppController,
    AuthController,
    UserController,
    StoreController,
    SellerController,
    StoreCategoryController,
  ],
  providers: [
    AppService,
    PrismaService,
    AuthService,
    UserService,
    SellerService,
    StoreService,
    StoreCategoryService,
  ],
  exports: [PrismaService],
})
export class AppModule {}

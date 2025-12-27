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
import { ProductController } from './product/product.controller';
import { ProductService } from './product/product.service';
import { ProductCategoryController } from './product-category/product-category.controller';
import { ProductCategoryService } from './product-category/product-category.service';
import { OrderController } from './order/order.controller';
import { OrderService } from './order/order.service';

@Module({
  controllers: [
    AppController,
    AuthController,
    UserController,
    StoreController,
    SellerController,
    StoreCategoryController,
    ProductController,
    ProductCategoryController,
    OrderController,
  ],
  providers: [
    AppService,
    PrismaService,
    AuthService,
    UserService,
    SellerService,
    StoreService,
    StoreCategoryService,
    ProductService,
    ProductCategoryService,
    OrderService,
  ],
  exports: [PrismaService],
})
export class AppModule {}

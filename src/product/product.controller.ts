import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ProductService } from "./product.service";
import { AuthSellerSessionGuard } from "../auth/auth-seller-session.guard";
import { type Store, type Product, type Seller } from "../data";
import { StoreGuard } from "../store/store.guard";
import { StoreDecor } from "../store/store.decorator";
import createResponse from "../utils";
import { FileInterceptor } from "@nestjs/platform-express";
import { cloudinaryStorage } from "../config/multer-cloudinary";
import { cloudinary } from "../config/cloudinary.config";

@Controller("/product")
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Get("/list")
    @UseGuards(AuthSellerSessionGuard, StoreGuard)
    @HttpCode(HttpStatus.OK)
    async list(@StoreDecor() store: Store) {
        const data = await this.productService.list(store.id);

        return createResponse(true, HttpStatus.OK, data, "Products successfully retrieved");
    }

    @Post('/create')
    @UseGuards(AuthSellerSessionGuard, StoreGuard)
    @UseInterceptors(
        FileInterceptor('featuredPhotoURL', {
            storage: cloudinaryStorage
        }),
    )
    @HttpCode(HttpStatus.CREATED)
    async create(@UploadedFile() file: Express.Multer.File, @StoreDecor() store: Store, @Body() body: Product) {

        try {
            await this.productService.create(store.id, body, file.path);
        } catch (err) {
            await cloudinary.uploader.destroy(file.filename);
            throw new BadRequestException(err);
        }

        return createResponse(true, HttpStatus.CREATED, null, "Product successfully added");
    }
}

import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ProductService } from "./product.service";
import { AuthSellerSessionGuard } from "../auth/auth-seller-session.guard";
import { type Store, type Product, type Seller, type User } from "../data";
import { StoreGuard } from "../store/store.guard";
import { StoreDecor } from "../store/store.decorator";
import createResponse from "../utils";
import { FileInterceptor } from "@nestjs/platform-express";
import { cloudinaryStorage } from "../config/multer-cloudinary";
import { cloudinary } from "../config/cloudinary.config";
import { AuthSessionGuard } from "../auth/auth-session.guard";
import { UserDecor } from "../user/user.decorator";
import { ProductGuard } from "./product.guard";
import { ProductDecor } from "./product.decorator";

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

    @Get('/list/:productId')
    @UseGuards(AuthSellerSessionGuard, StoreGuard, ProductGuard)
    @HttpCode(HttpStatus.OK)
    async getProductByIdAndStoreId(@ProductDecor() product: Product) {

        return createResponse(true, HttpStatus.OK, product, "Product successfully retrieved");
    }

    @Get('/city/:city')
    @HttpCode(HttpStatus.OK)
    async getProductsByCity(@Param('city') city: string) {
        const data = await this.productService.getProductsByCity(city);

        return createResponse(true, HttpStatus.OK, data, `List of products in ${city}`);
    }

    @Get('/public/list')
    @HttpCode(HttpStatus.OK)
    async listAllProducts() {
        const data = await this.productService.getAllProducts();

        return createResponse(true, HttpStatus.OK, data, "List of all products");
    }

    @Get('/public/list/:productId')
    @HttpCode(HttpStatus.OK)
    async getProductById(@Param('productId') productId: number) {
        if (isNaN(+productId)) throw new BadRequestException('Product id must be a valid number');

        const data = await this.productService.getProductById(+productId);

        return createResponse(true, HttpStatus.OK, data, 'Product successfully retrieved');
    }

    @Get('/public/metadata/:productId')
    @HttpCode(HttpStatus.OK)
    async getProductMetadataById(@Param('productId') productId: number) {
        if (isNaN(+productId)) throw new BadRequestException('Product id must be a valid number');

        const data = await this.productService.getProductMetadataById(+productId);

        return createResponse(true, HttpStatus.OK, data, 'Product successfully retrieved');
    }

    @Put("/restock/:productId")
    @UseGuards(AuthSellerSessionGuard, StoreGuard, ProductGuard)
    @HttpCode(HttpStatus.OK)
    async restockProduct(@ProductDecor() product: Product, @Body() body: {additionalStock: number}) {
        const {additionalStock} = body;

        if (!additionalStock) throw new BadRequestException("Additional stock is required");
        if (isNaN(+additionalStock)) throw new BadRequestException("Additionla stock must be a valid number");

        await this.productService.restockProduct(product, +additionalStock);

        return createResponse(true, HttpStatus.OK, null, "Product successfully restocked");
    }
}

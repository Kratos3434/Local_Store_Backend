import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { ProductService } from "./product.service";
import { AuthSellerSessionGuard } from "../auth/auth-seller-session.guard";
import { type Store, type Product, type Seller } from "../data";
import { StoreGuard } from "../store/store.guard";
import { StoreDecor } from "../store/store.decorator";
import createResponse from "../utils";

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
}

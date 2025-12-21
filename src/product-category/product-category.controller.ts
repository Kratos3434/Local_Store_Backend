import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ProductCategoryService } from "./product-category.service";
import createResponse from "../utils";

@Controller('product-category')
export class ProductCategoryController {
    constructor(private readonly productCategoryService: ProductCategoryService) {}

    @Get('list')
    @HttpCode(HttpStatus.OK)
    async list() {
        const data = await this.productCategoryService.list();

        return createResponse(true, HttpStatus.OK, data, "List of product categories");
    }
}
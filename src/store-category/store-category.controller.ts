import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { StoreCategoryService } from "./store-category.service";
import createResponse from "../utils";

@Controller('/store-category')
export class StoreCategoryController {
    constructor(private readonly storeCategoryService: StoreCategoryService) {}

    @Get('/list')
    @HttpCode(HttpStatus.OK)
    async getStoreCategories() {
        const data = await this.storeCategoryService.getStoreCategories();

        return createResponse(true, HttpStatus.OK, data, "List of store categories");
    }
}
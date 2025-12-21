import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProductCategoryService {
    constructor(private prismaService: PrismaService) {}

    async list() {
        return await this.prismaService.product_Category.findMany({});
    }
}
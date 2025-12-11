import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class StoreCategoryService {
    constructor(private prismaService: PrismaService) {}

    async getStoreCategories() {
        return await this.prismaService.store_Category.findMany({});
    }
}
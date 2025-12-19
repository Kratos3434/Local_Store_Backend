import { Injectable } from "@nestjs/common";
import { Product } from "../data";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProductService {
    constructor(private prismaService: PrismaService) {}

    async create(sellerId: number, product: Product) {

    }

    async list(storeId: number) {
        return await this.prismaService.product.findMany({
            where: {
                storeId
            },
            include: {
                tags: true,
                category: true
            }
        })
    }
}
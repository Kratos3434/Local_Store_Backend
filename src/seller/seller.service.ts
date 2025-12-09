import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SellerService {
    constructor(private prismaService: PrismaService) {}

    async getSellerById(sellerId: number) {
        return await this.prismaService.seller.findUnique({
            where: {
                id: sellerId
            },
        });
    }

    async getSellerProfileBySellerId(sellerId: number) {
        return await this.prismaService.seller_Profile.findUnique({
            where: {
                sellerId
            }
        });
    }
}
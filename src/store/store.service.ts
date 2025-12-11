import { BadRequestException, Injectable } from "@nestjs/common";
import { Store } from "../data";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class StoreService {
    constructor(private prismaService: PrismaService) {}

    async getStoreBySellerId(sellerId: number) {
        return await this.prismaService.store.findUnique({
            where: {
                sellerId
            }
        });
    }

    async createStore(sellerId: number, store: Store) {
        const s = await this.prismaService.store.findUnique({
            where: {
                name: store.name
            }
        });

        if (s) throw new BadRequestException("Store name already exists");

        const category = await this.prismaService.store_Category.findUnique({
            where: {
                name: store.category
            }
        });

        if (!category) throw new BadRequestException("Category name does not exist");

        const newStore = await this.prismaService.store.create({
            data: {
                name: store.name,
                description: store.description,
                categoryId: category.id,
                sellerId
            }
        });

        await this.prismaService.store_Address.create({
            data: {
                addressLine1: store.address.addressLine1,
                addressLine2: store.address.addressLine2 ? store.address.addressLine2 : null,
                province: store.address.province,
                city: store.address.city,
                postalCode: store.address.postalCode,
                storeId: newStore.id
            }
        });

        return true;
    }
}
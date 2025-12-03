import { BadRequestException, Injectable } from "@nestjs/common";
import { Store, User } from "../data";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class StoreService {
    constructor(private prismaService: PrismaService) {}

    async createStore(user: User, store: Store) {
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

        if (!category) throw new BadRequestException("Category does not exist");

        //Create the store
        const newStore = await this.prismaService.store.create({
            data: {
                name: store.name,
                description: store.description,
                userId: user.id,
                categoryId: category.id
            }
        });

        //Create store address
        await this.prismaService.store_Address.create({
            data: {
                addressLine1: store.address.addressLine1,
                addressLine2: store.address.addressLine2 ? store.address.addressLine2 : null,
                city: store.address.city,
                province: store.address.province,
                postalCode: store.address.postalCode,
                storeId: newStore.id
            }
        });

        return true;
    }

    async getStoreByUserId(userId: number) {
        return await this.prismaService.store.findUnique({
            where: {
                userId: userId
            }
        });
    }
}
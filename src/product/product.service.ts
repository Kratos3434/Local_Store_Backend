import { BadRequestException, Injectable } from "@nestjs/common";
import { Product } from "../data";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProductService {
    constructor(private prismaService: PrismaService) { }

    async create(storeId: number, product: Product, photoUrl: string) {
        const { name, description, priceInCad, isNew, quantity, category, tags } = product;

        if (!name) throw 'Name is required';
        if (!description) throw 'Description is required';
        if (!priceInCad) throw 'Price is required';
        if (isNaN(+priceInCad)) throw 'Price must be a valid number';
        if (+priceInCad <= 0) throw 'Price must be greater than 0.00';
        if (!isNew) throw 'Please indicate if your prodict is new or used';
        if (`${isNew}` != 'true' && `${isNew}` != 'false') throw 'Field isNew must be a boolean value';
        if (!quantity) throw 'Quanity is required';
        if (isNaN(+quantity)) throw 'Quantity must be a valid number';
        if (!(+quantity % 1 === 0)) throw 'Quantity must be a whole number';
        if (+quantity <= 0) throw 'Quantity must be greater than 0';
        if (!tags) throw 'Tags is required';
        // console.log(tags)
        if (!Array.isArray(tags)) throw 'Tags must be a valid array';
        tags.pop();
        if (!category) throw 'Category is required';

        const cat = await this.prismaService.product_Category.findUnique({
            where: {
                name: product.category
            }
        });

        if (!cat) throw 'Category name does not exist';

        const newProduct = await this.prismaService.product.create({
            data: {
                name: product.name,
                description: product.description,
                priceInCad: +product.priceInCad,
                isNew: `${product.isNew}` === 'true' ? true : false,
                categoryId: cat.id,
                storeId,
                featuredPhotoURL: photoUrl,
                quantity: +product.quantity
            }
        });

        const tagOptions = product.tags.map(e => {
            return {
                name: e,
                productId: newProduct.id
            }
        });

        await this.prismaService.product_Tags.createMany({
            data: tagOptions
        });

        return true;
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

    async getProductByIdAndStoreId(productId: number, storeId: number) {
        return await this.prismaService.product.findFirst({
            where: {
                AND: [
                    { id: productId },
                    { storeId }
                ]
            }
        })
    }

    async getProductsByCity(city: string) {
        return await this.prismaService.product.findMany({
            where: {
                store: {
                    address: {
                        city: city.toUpperCase()
                    }
                }
            }
        });
    }

    async getAllProducts() {
        return await this.prismaService.product.findMany({
            include: {
                tags: true,
                category: true
            }
        });
    }

    async getProductById(productId: number) {
        return await this.prismaService.product.findUnique({
            where: {
                id: productId
            },
            include: {
                store: true
            }
        });
    }

    async getProductMetadataById(productId: number) {
        return await this.prismaService.product.findUnique({
            where: {
                id: productId
            },
            select: {
               description: true,
               name: true 
            }
        });
    }

    async restockProduct(product: Product, additionalStock: number) {
        if (additionalStock <= 0) throw new BadRequestException("The added stock cannot be less than or equal to 0");

        await this.prismaService.product.update({
            where: {
                id: product.id
            },
            data: {
                quantity: product.quantity + additionalStock,
                updatedAt: new Date()
            }
        });

        return true;
    }
}
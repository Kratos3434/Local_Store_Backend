import { BadRequestException, Injectable } from "@nestjs/common";
import { Create_Order, Order_Status, Product, User } from "../data";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class OrderService {
    constructor(private prismaService: PrismaService) {}

    async createOrder(user: User, data: Create_Order) {
        const product = await this.prismaService.product.findUnique({
            where: {
                id: data.productId
            },
            include: {
                store: {
                    include: {
                        address: true
                    }
                }
            }
        });

        if (!product) throw new BadRequestException('Product does not exist');
        if (product.store.address?.city !== user.location.city) throw new BadRequestException(`This product is not sold in ${user.location.city}`);
        if (product.quantity <= 0) throw new BadRequestException('This product is currently out of stock or is sold out');
        if (data.quantity > product.quantity) throw new BadRequestException(`The quantity exceeds the product in stock. This product has only ${product.quantity} in stock`);

        const status = await this.prismaService.order_Status.findFirst({
            where: {
                status: Order_Status.PENDING
            }
        });

        if (!status) throw new BadRequestException('Order status does not exist');

        //Reduce the products stock temporarily
        await this.prismaService.product.update({
            where: {
                id: product.id
            },
            data: {
                quantity: product.quantity - data.quantity
            }
        });
        
        const newOrder = await this.prismaService.order.create({
            data: {
                userId: user.id,
                productId: product.id,
                storeId: product.store.id,
                statusId: status.id
            }
        });

        await this.prismaService.order_Details.create({
            data: {
                notes: data.notes ? data.notes : null,
                contactNumber: data.contactNumber,
                preferredMeetingPlace: data.preferredMeetingPlace,
                preferredMeetupDate: data.preferredMeetupDate,
                orderId: newOrder.id,
                quantity: data.quantity
            }
        });

        return true;
    }
}
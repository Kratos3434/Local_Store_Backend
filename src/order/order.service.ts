import { BadRequestException, Injectable } from "@nestjs/common";
import { Create_Order, Order_Status, Product, User } from "../data";
import { PrismaService } from "../prisma/prisma.service";
import { canAcceptOrder } from "../utils";

@Injectable()
export class OrderService {
    constructor(private prismaService: PrismaService) { }

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

        const price = product.priceInCad;

        const total = price.mul(data.quantity);

        const newOrder = await this.prismaService.order.create({
            data: {
                userId: user.id,
                productId: product.id,
                storeId: product.store.id,
                statusId: status.id,
                amount: total,
                amountAfterTax: total
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

    async getSellerOrdersByStoreId(storeId: number) {
        return await this.prismaService.order.findMany({
            where: {
                storeId
            },
            include: {
                status: true,
                user: {
                    select: {
                        email: true,
                        profile: true
                    }
                },
                details: {
                    select: {
                        quantity: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
    }

    async getSellerPendingOrdersByStoreId(storeId: number) {
        return await this.prismaService.order.findMany({
            where: {
                AND: [
                    { storeId },
                    {
                        status: {
                            status: Order_Status.PENDING
                        }
                    }
                ]
            },
            include: {
                status: true,
                user: {
                    select: {
                        email: true,
                        profile: true
                    }
                },
                details: {
                    select: {
                        quantity: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
    }

    async getSellerCompletedOrders(storeId: number) {
        return await this.prismaService.order.findMany({
            where: {
                AND: [
                    { storeId },
                    {
                        status: {
                            status: Order_Status.COMPLETE
                        }
                    }
                ]
            },
            include: {
                status: true,
                user: {
                    select: {
                        email: true,
                        profile: true
                    }
                },
                details: {
                    select: {
                        quantity: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
    }

    async getOrderByStoreIdAndOrderId(storeId: number, orderId: number) {
        return await this.prismaService.order.findFirst({
            where: {
                AND: [
                    { storeId },
                    { id: orderId }
                ]
            },
            include: {
                product: true,
                details: true,
                status: true,
                user: {
                    select: {
                        email: true,
                        profile: true
                    }
                },
            }
        });
    }

    async acceptOrder(storeId: number, orderId: number) {
        const order = await this.prismaService.order.findFirst({
            where: {
                AND: [
                    { storeId },
                    { id: orderId }
                ]
            },
            include: {
                details: true,
                status: true,
                product: true
            }
        });

        if (!order) throw new BadRequestException("Order does not exist");
        if (order.status.status !== Order_Status.PENDING) throw new BadRequestException("Only pending orders can be accepted");
        if (!canAcceptOrder(new Date(order.details!.preferredMeetupDate))) {
            const cancelled = await this.prismaService.order_Status.findFirst({
                where: {
                    status: Order_Status.CANCELLED
                }
            });

            if (!cancelled) throw new BadRequestException("Cancelled status does not exist");

            await this.prismaService.order.update({
                where: {
                    id: order.id
                },
                data: {
                    statusId: cancelled.id,
                    updatedAt: new Date()
                }
            });

            await this.prismaService.product.update({
                where: {
                    id: order.product.id
                },
                data: {
                    quantity: order.product.quantity + 1
                }
            });

            throw new BadRequestException("You accepted this order on or after the meetup date. This order was automatically cancelled. Please review the other orders");
        }

        const accepted = await this.prismaService.order_Status.findFirst({
            where: {
                status: Order_Status.ACCEPTED
            }
        });

        if (!accepted) throw new BadRequestException("Accepted status does not exist");

        await this.prismaService.order.update({
            where: {
                id: order.id
            },
            data: {
                statusId: accepted.id,
                updatedAt: new Date()
            }
        });

        return true;
    }

    async declineOrder(storeId: number, orderId: number) {
        const order = await this.prismaService.order.findFirst({
            where: {
                AND: [
                    { storeId },
                    { id: orderId }
                ]
            },
            include: {
                details: true,
                status: true,
                product: true
            }
        });

        if (!order) throw new BadRequestException("Order does not exist");
        if (order.status.status !== Order_Status.PENDING) throw new BadRequestException("Only pending orders can be declined");
        if (!canAcceptOrder(new Date(order.details!.preferredMeetupDate))) {
            const cancelled = await this.prismaService.order_Status.findFirst({
                where: {
                    status: Order_Status.CANCELLED
                }
            });

            if (!cancelled) throw new BadRequestException("Cancelled status does not exist");

            await this.prismaService.order.update({
                where: {
                    id: order.id
                },
                data: {
                    statusId: cancelled.id,
                    updatedAt: new Date()
                }
            });

            await this.prismaService.product.update({
                where: {
                    id: order.product.id
                },
                data: {
                    quantity: order.product.quantity + 1
                }
            });

            throw new BadRequestException("You declined this order on or after the meetup date. This order was automatically cancelled. Please review the other orders");
        }

        const declined = await this.prismaService.order_Status.findFirst({
            where: {
                status: Order_Status.DECLINED
            }
        });

        if (!declined) throw new BadRequestException("Declined status does not exist");

        await this.prismaService.order.update({
            where: {
                id: order.id
            },
            data: {
                statusId: declined.id,
                updatedAt: new Date()
            }
        });

        await this.prismaService.product.update({
            where: {
                id: order.product.id
            },
            data: {
                quantity: order.product.quantity + 1
            }
        });

        return true;
    }

    async completeOrder(storeId: number, orderId: number) {
        const order = await this.prismaService.order.findFirst({
            where: {
                AND: [
                    { storeId },
                    { id: orderId }
                ]
            },
            include: {
                details: true,
                status: true,
            }
        });

        if (!order) throw new BadRequestException("Order does not exist");
        if (order.status.status !== Order_Status.ACCEPTED) throw new BadRequestException("Only accepted orders can be marked as complete");

        const completed = await this.prismaService.order_Status.findFirst({
            where: {
                status: Order_Status.COMPLETE
            }
        });

        if (!completed) throw new BadRequestException("Completed status does not exist");

        await this.prismaService.order.update({
            where: {
                id: order.id
            },
            data: {
                statusId: completed.id,
                updatedAt: new Date()
            }
        });

        return true;
    }

    async getUserOrdersByUserId(userId: number) {
        return await this.prismaService.order.findMany({
            where: {
                userId
            },
            include: {
                product: true,
                status: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async getUserMeetupOrdersByUserId(userId: number) {
        return await this.prismaService.order.findMany({
            where: {
                AND: [
                    { userId },
                    { type: "Meetup" }
                ]
            },
            include: {
                product: true,
                status: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async getUserShippingOrdersByUserId(userId: number) {
        return await this.prismaService.order.findMany({
            where: {
                AND: [
                    { userId },
                    { type: "Shipping" }
                ]
            },
            include: {
                product: true,
                status: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async getOrderByIdAndUserId(orderId: number, userId: number) {
        return await this.prismaService.order.findFirst({
            where: {
                AND: [
                    {id: orderId},
                    {userId}
                ]
            },
            include: {
                details: true,
                status: true,
                product: true
            }
        });
    }
}
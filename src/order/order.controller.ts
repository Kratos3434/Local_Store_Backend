import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { OrderService } from "./order.service";
import { AuthSessionGuard } from "../auth/auth-session.guard";
import { UserDecor } from "../user/user.decorator";
import { type Store, type Create_Order, type User } from "../data";
import createResponse, { isDateTodayOrPast, isTimeBetween8pmAnd7am, isValidPhoneNumber } from "../utils";
import { AuthSellerSessionGuard } from "../auth/auth-seller-session.guard";
import { StoreGuard } from "../store/store.guard";
import { StoreDecor } from "../store/store.decorator";

@Controller('/order')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Post('/create')
    @UseGuards(AuthSessionGuard)
    @HttpCode(HttpStatus.CREATED)
    async createOrder(@UserDecor() user: User, @Body() body: Create_Order) {
        if (!body.productId) throw new BadRequestException('Product id is required');
        if (isNaN(+body.productId)) throw new BadRequestException('Product id must be a valid number');
        if (!body.preferredMeetingPlace) throw new BadRequestException('Preferred meeting place is required');
        if (!body.preferredMeetupDate) throw new BadRequestException('Preferred meetup date is required');
        if (isDateTodayOrPast(new Date(body.preferredMeetupDate))) throw new BadRequestException('Preferred meetup date must be set to tomorrow or any following day');
        if (isTimeBetween8pmAnd7am(new Date(body.preferredMeetupDate))) throw new BadRequestException('Meetup time should not be between 8:00 PM - 7:00 AM due to safety concerns');
        if (!body.quantity) throw new BadRequestException('Quantity is required');
        if (isNaN(+body.quantity)) throw new BadRequestException("Quantity must be a valid number");
        if (!body.contactNumber) throw new BadRequestException('Contact number is required');
        if (!isValidPhoneNumber(body.contactNumber)) throw new BadRequestException('Contact number must be a valid phone number');

        await this.orderService.createOrder(user, body);

        return createResponse(true, HttpStatus.CREATED, null, 'Order successfully created');
    }

    @Get('/list/seller')
    @UseGuards(AuthSellerSessionGuard, StoreGuard)
    @HttpCode(HttpStatus.OK)
    async getSellerOrders(@StoreDecor() store: Store, @Query('filter') filter: string) {
        let data: any = null;

        switch (filter) {
            case "all": data = await this.orderService.getSellerOrdersByStoreId(store.id);
                break;
            case "pending": data = await this.orderService.getSellerPendingOrdersByStoreId(store.id);
                break;
            case "complete": data = await this.orderService.getSellerCompletedOrders(store.id);
                break;
            default: data = await this.orderService.getSellerOrdersByStoreId(store.id); 
        }

        return createResponse(true, HttpStatus.OK, data, "List of all orders");
    }

    @Get("/list/user")
    @UseGuards(AuthSessionGuard)
    @HttpCode(HttpStatus.OK)
    async getUserOrders(@UserDecor() user: User, @Query('filter') filter: string) {
        let data: any = null;

        switch (filter) {
            case "all": data = await this.orderService.getUserOrdersByUserId(user.id);
                break;
            case "meetup": data = await this.orderService.getUserMeetupOrdersByUserId(user.id);
                break;
            case "shipping": data = await this.orderService.getUserShippingOrdersByUserId(user.id);
                break;
            default: data = await this.orderService.getUserOrdersByUserId(user.id);
        }

        return createResponse(true, HttpStatus.OK, data, "List of all user orders");
    }

    @Get("/list/:orderId")
    @UseGuards(AuthSellerSessionGuard, StoreGuard)
    @HttpCode(HttpStatus.OK)
    async getOrderByIdAndStoreId(@StoreDecor() store: Store, @Param('orderId') orderId: number) {
        if (!orderId) throw new BadRequestException("Order id is missing");
        if (isNaN(+orderId)) throw new BadRequestException("Order id must be a valid number");

        const data = await this.orderService.getOrderByStoreIdAndOrderId(store.id, +orderId);

        return createResponse(true, HttpStatus.OK, data, "Order successfully retireved");
    }

    @Put("/accept/:orderId")
    @UseGuards(AuthSellerSessionGuard, StoreGuard)
    @HttpCode(HttpStatus.OK)
    async acceptOrder(@StoreDecor() store: Store, @Param('orderId') orderId: number) {
        if (!orderId) throw new BadRequestException("Order id is missing");
        if (isNaN(+orderId)) throw new BadRequestException("Order id must be a valid number");

        await this.orderService.acceptOrder(store.id, +orderId);

        return createResponse(true, HttpStatus.OK, null, "Order accepted successfully.");
    }

    @Put('/decline/:orderId')
    @UseGuards(AuthSellerSessionGuard, StoreGuard)
    @HttpCode(HttpStatus.OK)
    async declineOrder(@StoreDecor() store: Store, @Param('orderId') orderId: number) {
        if (!orderId) throw new BadRequestException("Order id is missing");
        if (isNaN(+orderId)) throw new BadRequestException("Order id must be a valid number");

        await this.orderService.declineOrder(store.id, +orderId);

        return createResponse(true, HttpStatus.OK, null, "Order declined successfully.")
    }

    @Put('/complete/:orderId')
    @UseGuards(AuthSellerSessionGuard, StoreGuard)
    @HttpCode(HttpStatus.OK)
    async completeOrder(@StoreDecor() store: Store, @Param('orderId') orderId: number) {
        if (!orderId) throw new BadRequestException("Order id is missing");
        if (isNaN(+orderId)) throw new BadRequestException("Order id must be a valid number");

        await this.orderService.completeOrder(store.id, +orderId);

        return createResponse(true, HttpStatus.OK, null, "Order completed successfully.")
    }

    @Get("/details/:orderId")
    @UseGuards(AuthSessionGuard)
    @HttpCode(HttpStatus.OK)
    async getOrderByIdAndUserId(@UserDecor() user: User, @Param('orderId') orderId: number) {
        if (!orderId) throw new BadRequestException("Order id is missing");
        if (isNaN(+orderId)) throw new BadRequestException("Order id must be a valid number");

        const data = await this.orderService.getOrderByIdAndUserId(+orderId, user.id);

        return createResponse(true, HttpStatus.OK, data, "Order by id and user id");
    }
}
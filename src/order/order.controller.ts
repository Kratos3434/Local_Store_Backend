import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { OrderService } from "./order.service";
import { AuthSessionGuard } from "../auth/auth-session.guard";
import { UserDecor } from "../user/user.decorator";
import { type Create_Order, type User } from "../data";
import createResponse, { isDateTodayOrPast, isTimeBetween8pmAnd7am, isValidPhoneNumber } from "../utils";

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
}
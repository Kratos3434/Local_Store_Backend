import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { OrderStatusService } from "./order-status.service";
import createResponse from "../utils";

@Controller('/order-status')
export class OrderStatusController {
    constructor(private readonly orderStatusService: OrderStatusService) {}
    
    @Get('/list')
    @HttpCode(HttpStatus.OK)
    async list() {
        const data = await this.orderStatusService.list();

        return createResponse(true, HttpStatus.OK, data, "List of order status");
    }
}
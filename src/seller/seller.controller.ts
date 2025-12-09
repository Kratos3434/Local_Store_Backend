import { Controller, Get, HttpCode, HttpStatus, UseGuards } from "@nestjs/common";
import { SellerService } from "./seller.service";
import { AuthSellerSessionGuard } from "../auth/auth-seller-session.guard";
import { SellerDecor } from "./seller.decorator";
import { type Seller } from "../data";
import createResponse from "../utils";

@Controller('/seller')
export class SellerController {
    constructor(private readonly sellerService: SellerService) {}

    @Get('/profile')
    @UseGuards(AuthSellerSessionGuard)
    @HttpCode(HttpStatus.OK)
    async getSellerProfile(@SellerDecor() seller: Seller) {
        const data = await this.sellerService.getSellerProfileBySellerId(seller.id);

        return createResponse(true, HttpStatus.OK, data, "Seller profile successfully retrieved");
    }
}
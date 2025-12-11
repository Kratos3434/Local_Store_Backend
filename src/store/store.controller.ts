import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { StoreService } from "./store.service";
import type { Seller, Store } from "../data";
import createResponse, { isValidCanadianPostalCode } from "../utils";
import { AuthSellerSessionGuard } from "../auth/auth-seller-session.guard";
import { SellerDecor } from "../seller/seller.decorator";
import { isValidProvince } from "../data/provinces";
import { isValidCity } from "../data/cities";

@Controller("/store")
export class StoreController {
    constructor(private readonly storeService: StoreService) {}

    @Post('/create')
    @UseGuards(AuthSellerSessionGuard)
    @HttpCode(HttpStatus.CREATED)
    async createStore(@SellerDecor() seller: Seller, @Body() body: Store) {
        const {
            name,
            description,
            address,
            category
        } = body;
        
        if (!name) throw new BadRequestException("Name is required");
        if (!description) throw new BadRequestException("Description is required");
        if (!address) throw new BadRequestException("Address is required");
        if (!address.addressLine1) throw new BadRequestException("Address Line 1 is required");
        if (!address.province) throw new BadRequestException("Province is required");
        if (!isValidProvince(address.province)) throw new BadRequestException("Province is not valid");
        if (!address.city) throw new BadRequestException("City is required");
        if (!isValidCity(address.province, address.city)) throw new BadRequestException("City is invalid");
        if (!address.postalCode) throw new BadRequestException("Postal code is required");
        if (!isValidCanadianPostalCode(address.postalCode)) throw new BadRequestException("Invalid postal code");
        if (!category) throw new BadRequestException("Category is required");

        await this.storeService.createStore(seller.id, body);

        return createResponse(true, HttpStatus.CREATED, null, "Store successfully created");
    }

    @Get('/')
    @UseGuards(AuthSellerSessionGuard)
    @HttpCode(HttpStatus.OK)
    async getStoreBySellerId(@SellerDecor() seller: Seller) {
        const data = await this.storeService.getStoreBySellerId(seller.id);

        return createResponse(true, HttpStatus.OK, data, "Store successfully retrieved");
    }

}
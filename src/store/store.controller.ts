import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { StoreService } from "./store.service";
import { AuthSessionGuard } from "../auth/auth-session.guard";
import { UserDecor } from "../user/user.decorator";
import type { Store, User } from "../data";
import { provincesMap } from "../data/provinces-map";
import createResponse, { isValidCanadianPostalCode } from "../utils";

@Controller("/store")
export class StoreController {
    constructor(private readonly storeService: StoreService) {}

    @Post('/create')
    @UseGuards(AuthSessionGuard)
    @HttpCode(HttpStatus.CREATED)
    async createStore(@UserDecor() user: User, @Body() body: Store) {
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
        if (!address.city) throw new BadRequestException("City is required");
        if (!address.province) throw new BadRequestException("Province is required");
        if (!provincesMap.has(address.province)) throw new BadRequestException("Province is not a valid Canadian province");
        if (!address.postalCode) throw new BadRequestException("Postal code is required");
        if (!isValidCanadianPostalCode(address.postalCode)) throw new BadRequestException("Invalid postal code");
        if (!category) throw new BadRequestException("Category is required");

        await this.storeService.createStore(user, body);

        return createResponse(true, HttpStatus.CREATED, null, "Store successfully created");
    }

    @Get('/')
    @UseGuards(AuthSessionGuard)
    @HttpCode(HttpStatus.OK)
    async getStore(@UserDecor() user: User) {
        const store = await this.storeService.getStoreByUserId(user.id);
        return createResponse(true, HttpStatus.OK, store, "Store successfully retrieved");
    }
}
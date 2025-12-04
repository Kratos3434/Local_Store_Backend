import { Controller, Get, HttpCode, HttpStatus, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { AuthSessionGuard } from "../auth/auth-session.guard";
import { UserDecor } from "./user.decorator";
import type { User } from "../data";
import createResponse from "../utils";

@Controller('/user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('/profile')
    @UseGuards(AuthSessionGuard)
    @HttpCode(HttpStatus.OK)
    async getProfile(@UserDecor() user: User) {
        const data = await this.userService.getProfileByUserId(user.id);

        return createResponse(true, HttpStatus.OK, data, "Profile successfully retrieved");
    }
}
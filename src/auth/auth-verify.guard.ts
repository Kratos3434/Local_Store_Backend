import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import { UserService } from "../user/user.service";
import jwt from 'jsonwebtoken';
import { JWTPayload, privateKey, USER_VERIFY_TOKEN } from "../data";

@Injectable()
export class AuthVerifyGuard implements CanActivate {
    constructor(private readonly userService: UserService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const token = request.cookies?.USER_VERIFY_TOKEN;

        if (!token) {
            throw new UnauthorizedException('Token is missing');
        }

        try {
            const decoded = jwt.verify(token, privateKey!) as JWTPayload;

            if (decoded.type !== USER_VERIFY_TOKEN) {
                throw new UnauthorizedException('Unauthorized: Type mismatch');
            }

            const user = await this.userService.getUserById(decoded.userId);

            if (!user) throw new UnauthorizedException('Unauthorized: User does not exist');

            request.user = user;

            return true;
        } catch (err) {
            throw new UnauthorizedException("Unauthorized");
        }
    }
}
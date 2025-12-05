import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import jwt from 'jsonwebtoken';
import { JWTPayload, privateKey, SELLER_VERIFY_TOKEN } from "../data";
import { SellerService } from "../seller/seller.service";

@Injectable()
export class AuthSellerVerifyGuard implements CanActivate {
    constructor(private readonly sellerService: SellerService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const token = request.cookies?.SELLER_VERIFY_TOKEN;

        if (!token) {
            throw new UnauthorizedException('Token is missing');
        }

        try {
            const decoded = jwt.verify(token, privateKey!) as JWTPayload;

            if (decoded.type !== SELLER_VERIFY_TOKEN) {
                throw new UnauthorizedException('Unauthorized: Type mismatch');
            }

            const seller = await this.sellerService.getSellerById(decoded.sellerId);

            if (!seller) throw new UnauthorizedException('Unauthorized: Seller does not exist');

            request.seller = seller;

            return true;
        } catch (err) {
            throw new UnauthorizedException("Unauthorized");
        }
    }
}
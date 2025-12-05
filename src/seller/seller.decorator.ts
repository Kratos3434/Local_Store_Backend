import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Seller, User } from "../data";

export const SellerDecor = createParamDecorator(
    (data: keyof Seller, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        const seller = req.seller as Seller;
        return data ? seller?.[data] : seller;
    }
)
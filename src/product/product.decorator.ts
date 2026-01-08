import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Product } from "../data";

export const ProductDecor = createParamDecorator(
    (data: keyof Product, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        const product = req.product as Product
        return data ? product?.[data] : product;
    }
);
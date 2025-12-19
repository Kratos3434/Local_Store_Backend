import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Store } from "../data";

export const StoreDecor = createParamDecorator(
    (data: keyof Store, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        const store = req.store as Store;
        return data ? store?.[data] : store;
    }
);
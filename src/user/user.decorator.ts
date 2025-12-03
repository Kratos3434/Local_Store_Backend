import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "../data";

export const UserDecor = createParamDecorator(
    (data: keyof User, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        const user = req.user as User;
        return data ? user?.[data] : user;
    }
)
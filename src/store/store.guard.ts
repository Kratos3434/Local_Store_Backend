import { BadRequestException, CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class StoreGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const store = request.store;

        if (!store) throw new BadRequestException("User does not have a store yet. Please create a Store");

        return true;
    }
}
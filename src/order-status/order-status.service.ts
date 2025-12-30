import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class OrderStatusService {
    constructor(private prismaService: PrismaService) {}

    async list() {
        return await this.prismaService.order_Status.findMany({});
    }
}
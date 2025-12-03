import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class UserService {
    constructor(private prismaService: PrismaService) {}

    async getUserById(userId: number) {
        return await this.prismaService.user.findUnique({
            where: {
                id: userId
            }
        });
    }
}
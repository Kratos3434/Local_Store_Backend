import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

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

    async getProfileByUserId(userId: number) {
        const res =  await this.prismaService.profile.findUnique({
            where: {
                userId,
            },
            include: {
                user: {
                    select: {
                        email: true
                    }
                }
            }
        });

        if (!res) return null;

        return {
            firstName: res.firstName,
            lastName: res.lastName,
            userId: res.userId,
            email: res.user.email,
            createdAt: res.createdAt,
            updatedAt: res.updatedAt
        };
    }
}
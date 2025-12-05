import { BadRequestException, Injectable } from "@nestjs/common";
import { Store, User } from "../data";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class StoreService {
    constructor(private prismaService: PrismaService) {}

}
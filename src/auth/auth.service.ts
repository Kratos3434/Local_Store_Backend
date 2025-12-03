import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import bcrypt from "bcryptjs";
import randomstring from 'randomstring';
import { Signup, User } from "src/data";
import { isMoreThanOneDayOld, isMoreThanOneMinuteOld } from "src/utils";

@Injectable()
export class AuthService {
    constructor(private prismaService: PrismaService) {}

    async signin(email: string, password: string) {
        const user = await this.prismaService.user.findUnique({
            where: {
                email
            }
        });

        if (!user) throw new BadRequestException("Incorrect email or password");

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) throw new BadRequestException("Incorrect email or password");

        return user;
    }

    async signup(data: Signup) {
        const user = await this.prismaService.user.findUnique({
            where: {
                email: data.email
            }
        });

        if (user) throw new BadRequestException("Email already exists");

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const newUser = await this.prismaService.user.create({
            data: {
                email: data.email,
                password: hashedPassword
            }
        });

        await this.prismaService.profile.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                userId: newUser.id
            }
        });

        const otp = randomstring.generate({
            charset: 'numeric',
            length: 6
        });

        const hashedOtp = await bcrypt.hash(otp, 10);

        await this.prismaService.otp.create({
            data: {
                code: hashedOtp,
                userId: newUser.id
            }
        });

        return newUser;
    }

    async verifyUser(user: User, code: string) {
        if (user.isVerified) throw new BadRequestException('User is already verified');

        const otp = await this.prismaService.otp.findUnique({
            where: {
                userId: user.id
            }
        });

        if (!otp) throw new BadRequestException('User does not have an otp yet');
        
        const isOtpCorrect = await bcrypt.compare(code, otp.code);

        if (!isOtpCorrect) throw new BadRequestException('Incorrect otp');

        if (isMoreThanOneDayOld(otp.createdAt)) throw new BadRequestException('Otp is expired');

        await this.prismaService.user.update({
            where: {
                id: user.id
            },
            data: {
                isVerified: true, 
                updatedAt: new Date()
            }
        });

        return true;
    }

    async sendOtp(user: User) {
        if (user.isVerified) throw new BadRequestException('User is already verified');

        const otp = await this.prismaService.otp.findUnique({
            where: {
                userId: user.id
            }
        });

        if (!otp) throw new BadRequestException('User does not have an otp yet');

        if (!isMoreThanOneMinuteOld(otp.createdAt)) throw new BadRequestException('Please wait 1 minute before sending new otp');

        const code = randomstring.generate({
            charset: 'numeric',
            length: 6
        });

        const hashedOtp = await bcrypt.hash('123456', 10);

        await this.prismaService.otp.update({
            where: {
                id: otp.id
            },
            data: {
                code: hashedOtp,
                createdAt: new Date()
            }
        });

        //!todo: Send otp code to the user's email

        /************************ */

        return true;
    }
}
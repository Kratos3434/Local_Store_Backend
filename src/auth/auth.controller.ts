import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import type { Response } from "express";
import jwt from 'jsonwebtoken';
import { privateKey, type Signup, thirtyDaysInMs, type User, USER_SESSION_TOKEN, USER_VERIFY_TOKEN } from "src/data";
import createResponse, { isValidEmail } from "../utils";
import { AuthVerifyGuard } from "./auth-verify.guard";
import { UserDecor } from "src/user/user.decorator";
import { AuthSessionGuard } from "./auth-session.guard";

@Controller("/auth")
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post("/signin")
    @HttpCode(HttpStatus.OK)
    async signin(@Body() body: { email: string, password: string }, @Res({ passthrough: true }) res: Response) {
        const { email, password } = body;

        if (!email) throw new BadRequestException("Email is required");
        if (!password) throw new BadRequestException("Password is required");

        const user = await this.authService.signin(email, password);

        if (!user.isVerified) {
            const token = jwt.sign({
                userId: user.id,
                type: USER_VERIFY_TOKEN
            }, privateKey!, {
                expiresIn: '30d',
                algorithm: 'RS256'
            });

            res.cookie(USER_VERIFY_TOKEN, token, {
                httpOnly: true,
                secure: true,
                maxAge: thirtyDaysInMs
            });

            throw new UnauthorizedException('User not verified');
        }

        const token = jwt.sign({
            userId: user.id,
            type: USER_SESSION_TOKEN
        }, privateKey!, {
            expiresIn: '30d',
            algorithm: 'RS256'
        });

        res.cookie(USER_SESSION_TOKEN, token, {
            httpOnly: true,
            secure: true,
            maxAge: thirtyDaysInMs
        });

        return createResponse(true, HttpStatus.OK, null, 'Signin successful');
    }

    @Post("/signup")
    @HttpCode(HttpStatus.CREATED)
    async signup(@Body() body: Signup, @Res({passthrough: true}) res: Response) {
        const { email, firstName, lastName, password, password2 } = body;

        if (!email) throw new BadRequestException('Email is required');
        if (!isValidEmail(email)) throw new BadRequestException('Email is invalid');
        if (!firstName) throw new BadRequestException('First name is required');
        if (!lastName) throw new BadRequestException('Last name is required');
        if (!password) throw new BadRequestException('Password is required');
        if (!password2) throw new BadRequestException('Please confirm your password');
        if (password != password2) throw new BadRequestException('Passwords do not match');

        const user = await this.authService.signup(body);

        const token = jwt.sign({ userId: user.id, type: USER_VERIFY_TOKEN }, privateKey!, {
            expiresIn: '30d',
            algorithm: 'RS256'
        });

        res.cookie(USER_VERIFY_TOKEN, token, {
            httpOnly: true,
            secure: true,
            maxAge: thirtyDaysInMs
        });

        return createResponse(true, HttpStatus.CREATED, null, 'Signup successful');
    }

    @Put('/verify/:otp')
    @UseGuards(AuthVerifyGuard)
    @HttpCode(HttpStatus.OK)
    async verifyUser(@UserDecor() user: User, @Param('otp') otp: string) {
        await this.authService.verifyUser(user, otp);

        return createResponse(true, HttpStatus.OK, null, 'User verified successfully');
    }

    @Put('/send-otp')
    @UseGuards(AuthVerifyGuard)
    @HttpCode(HttpStatus.OK)
    async sendOtp(@UserDecor() user: User) {
        await this.authService.sendOtp(user);

        return createResponse(true, HttpStatus.OK, null, 'Otp sent successfully');
    }

    @Get('/authenticate/verify-token')
    @UseGuards(AuthVerifyGuard)
    @HttpCode(HttpStatus.OK)
    async authenticateVerifyToken(@UserDecor() user: User) {
        return createResponse(true, HttpStatus.OK, {email: user.email}, 'Verify token authenticated successfully');
    }

    @Get('/authenticate/session-token')
    @UseGuards(AuthSessionGuard)
    @HttpCode(HttpStatus.OK)
    async authenticateSessionToken(@UserDecor() user: User) {
        return createResponse(true, HttpStatus.OK, {email: user.email}, 'Session token authenticated successfully');
    }
}
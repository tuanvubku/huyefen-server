import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { IUser } from 'src/user/interface/user.interface';
import { UserService } from 'src/user/user.service';
import { ResponseSuccess } from 'src/utils/dto/response.dto';
import { IResponse } from 'src/utils/interface/response.interface';
import { AuthService } from './auth.service';
import { CreateLoginDto } from './dto/create-login.dto';
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly userService: UserService) { }

    @Post('register')
    async createUser(@Body() createUserDto: CreateUserDto): Promise<IResponse<IUser>> {
        await this.userService.createUser(createUserDto);
        return new ResponseSuccess("REGISTRATION.USER_REGISTERED_SUCCESSFULLY");
    }

    @Post('login')
    async login(@Body() createLoginDto: CreateLoginDto): Promise<IResponse<IUser>> {
        var response = await this.authService.validateLogin(createLoginDto.phone, createLoginDto.password);
        return new ResponseSuccess("LOGIN.USER_LOGIN_SUCCESSFULLY", response);
    }


}

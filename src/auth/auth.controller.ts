import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { IUser } from 'src/user/interface/user.interface';
import { UserService } from 'src/user/user.service';
import { ResponseSuccess } from 'src/utils/dto/response.dto';
import { IResponse } from 'src/utils/interface/response.interface';
import { AuthService } from './auth.service';
import { CreateLoginDto } from './dto/create-login.dto';
import { Roles } from 'src/utils/decorator/roles.decorator';
import { RolesGuard } from 'src/utils/guard/roles.guard';
import { Role } from 'src/utils/constant';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/utils/decorator/user.decorator';

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

    @Post('change-password')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User, Role.Teacher)
    async changePassWord(@Body('currentPassword') currentPassword: string,
        @Body('newPassword') newPassword: string, @User() user): Promise<IResponse<any>> {
        const isValidPass = await this.authService.checkCurrentPassword(currentPassword, user.phone);
        let statusCode  =  -1;
        let msg = ""
        if(isValidPass) {
           let isPasswordChange = await this.authService.setPassword(user.phone, newPassword);
            if(isPasswordChange){
                statusCode = 0;
                msg = "USER.CHANGE_PASSWORD_SUCCESS";
            }
            else {
                statusCode = 2
                msg = "USER.NEW_PASSWORD_NOT_VALID";
            }
        } else {
            statusCode = 1
            msg = "USER.PASSWORD_NOT_VALID;"
        }
        return  new ResponseSuccess("LOGIN.", statusCode);
    }


}

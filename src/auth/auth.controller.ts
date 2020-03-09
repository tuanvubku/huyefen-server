import { Controller, Post, Body } from '@nestjs/common';
import { IResponse } from 'src/utils/response.interface';
import { success } from 'src/utils/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { IUser } from 'src/user/interface/user.interface';
import { CreateLoginDto } from './dto/create-login.dto';
import { AuthService } from './auth.service';
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly userService: UserService) { }

    @Post('register')
    async createUser(@Body() createUserDto: CreateUserDto): Promise<IResponse<IUser>> {
        
        await this.userService.createUser(createUserDto);
        return success({
            message: "REGISTRATION.USER_REGISTERED_SUCCESSFULLY"
        })
    }

    @Post('login')
    async login(@Body() createLoginDto: CreateLoginDto): Promise<IResponse<IUser>> {

        var response = await this.authService.validateLogin(createLoginDto.phone, createLoginDto.password);
        return success(response);

    }


}

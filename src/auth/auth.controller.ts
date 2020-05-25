import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateTeacherDto } from '@/teacher/dto/create-teacher.dto';
import { ITeacher } from '@/teacher/interface/teacher.interface';
import { TeacherService } from '@/teacher/teacher.service';
import { RegisterDto } from './dto/register.dto';
import { IUser } from '@/user/interface/user.interface';
import { UserService } from '@/user/user.service';
import { Role } from '@/utils/constant';
import { Roles } from '@/utils/decorator/roles.decorator';
import { User } from '@/utils/decorator/user.decorator';
import { ResponseSuccess } from '@/utils/utils';
import { RolesGuard } from '@/utils/guard/roles.guard';
import { IResponse } from '@/utils/interface/response.interface';
import { AuthService } from './auth.service';
import { CreateLoginDto } from './dto/create-login.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly teacherService: TeacherService
    ) {}

    @Post('register/user')
    async registerUser(@Body() registerDto: RegisterDto): Promise<IResponse<string>> {
        await this.userService.createUser(registerDto);
        return new ResponseSuccess<string>("REGISTRATION.USER_REGISTERED_SUCCESSFULLY", '');
    }

    @Post('register/teacher')
    async createTeacher(@Body() createTeacherDto: CreateTeacherDto): Promise<IResponse<any>> {
        await this.teacherService.createTeacher(createTeacherDto);
        return new ResponseSuccess("REGISTRATION.USER_REGISTERED_SUCCESSFULLY");
    }


    @Post('login/user')
    async loginUser(@Body() createLoginDto: CreateLoginDto): Promise<IResponse<IUser>> {
        var user = await this.authService.validateLoginUser(createLoginDto.phone, createLoginDto.password);
        return new ResponseSuccess("LOGIN.USER_LOGIN_SUCCESSFULLY", user);
    }

    @Post('login/teacher')
    async login(@Body() createLoginDto: CreateLoginDto): Promise<IResponse<ITeacher>> {
        var teacher = await this.authService.validateLoginTeacher(createLoginDto.phone, createLoginDto.password);
        return new ResponseSuccess("LOGIN.TEACHER_LOGIN_SUCCESSFULLY", teacher);
    }

    @Put('change-password')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User, Role.Teacher)
    async changePassWord(@Body('currentPassword') currentPassword: string,
        @Body('newPassword') newPassword: string, @User() user): Promise<IResponse<any>> {
        const isValidPass = await this.authService.checkCurrentPassword(currentPassword, user.phone);
        let statusCode = -1;
        let msg = ""
        if (isValidPass) {
            let isPasswordChange = await this.authService.setPassword(user.phone, newPassword);
            if (isPasswordChange) {
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
        return new ResponseSuccess(msg, statusCode);
    }

    @Put('image-url')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User, Role.Teacher)
    async saveURL(@Body('base64') base64: string, @User() user): Promise<IResponse<any>> {
        const res = await this.authService.saveURL(base64, user);
        return new ResponseSuccess("SUCCESS", res);
    }

    
    
}

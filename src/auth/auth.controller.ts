import { Body, Controller, Post, UseGuards, Put } from '@nestjs/common';
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
import { TeacherService } from 'src/teacher/teacher.service';
import { CreateTeacherDto } from 'src/teacher/dto/create-teacher.dto';
import { async } from 'rxjs/internal/scheduler/async';
import { ITeacher } from 'src/teacher/interface/teacher.interface';
import { response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly teacherService: TeacherService) { }

    @Post('register/user')
    async createUser(@Body() createUserDto: CreateUserDto): Promise<IResponse<IUser>> {
        await this.userService.createUser(createUserDto);
        return new ResponseSuccess("REGISTRATION.USER_REGISTERED_SUCCESSFULLY");
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

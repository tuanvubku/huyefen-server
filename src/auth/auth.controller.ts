import { Body, Controller, Post, Put, UseGuards, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateTeacherDto } from '@/teacher/dto/create-teacher.dto';
import { ITeacher } from '@/teacher/interface/teacher.interface';
import { TeacherService } from '@/teacher/teacher.service';
import { UserService } from '@/user/user.service';
import { Roles } from '@/utils/decorator/roles.decorator';
import { User } from '@/utils/decorator/user.decorator';
import { RolesGuard } from '@/utils/guard/roles.guard';
import { IResponse } from '@/utils/interfaces/response.interface';
import { AuthService } from './auth.service';
import { JobService } from '@/job/job.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly teacherService: TeacherService,
        private readonly jobService: JobService
    ) {}

    @Post('register/user')
    async registerUser(@Body() registerDto: RegisterDto): Promise<IResponse<null>> {
        const { phone, email } = registerDto;
        const countExisted: number = await this.userService.countUserByPhoneEmail({ phone, email });
        if (countExisted > 0)
            throw new ConflictException('REGISTRATION.USER_ALREADY_REGISTERED');
        const { job: jobId } = registerDto;
        const job = await this.jobService.findJobById(jobId);
        if (!job)
            throw new NotFoundException('REGISTRATION.NOT_FOUND_JOB');
        await this.userService.createUser(registerDto);
        return new ResponseSuccess<null>('REGISTRATION.USER_REGISTERED_SUCCESSFULLY');
    }

    @Post('register/teacher')
    async createTeacher(@Body() createTeacherDto: CreateTeacherDto): Promise<IResponse<any>> {
        await this.teacherService.createTeacher(createTeacherDto);
        return new ResponseSuccess("REGISTRATION.USER_REGISTERED_SUCCESSFULLY");
    }


    // @Post('login/user')
    // async loginUser(@Body() loginDto: LoginDto): Promise<IResponse<any>> {
    //     const { phone, password } = loginDto;
    //     const user = await this.authService.validateLoginUser(phone, password);
    //     if (user)
    //         return new ResponseSuccess<any>("LOGIN.USER_LOGIN_SUCCESSFULLY", user);
    //     throw new UnauthorizedException('LOGIN.USER_LOGIN_ERROR');
    // }

    // @Post('login/teacher')
    // async login(@Body() createLoginDto: LoginDto): Promise<IResponse<ITeacher>> {
    //     var teacher = await this.authService.validateLoginTeacher(createLoginDto.phone, createLoginDto.password);
    //     return new ResponseSuccess("LOGIN.TEACHER_LOGIN_SUCCESSFULLY", teacher);
    // }

    // @Put('change-password')
    // @UseGuards(AuthGuard('jwt'), RolesGuard)
    // @Roles(Role.User, Role.Teacher)
    // async changePassWord(@Body('currentPassword') currentPassword: string,
    //     @Body('newPassword') newPassword: string, @User() user): Promise<IResponse<any>> {
    //     const isValidPass = await this.authService.checkCurrentPassword(currentPassword, user.phone);
    //     let statusCode = -1;
    //     let msg = ""
    //     if (isValidPass) {
    //         let isPasswordChange = await this.authService.setPassword(user.phone, newPassword);
    //         if (isPasswordChange) {
    //             statusCode = 0;
    //             msg = "USER.CHANGE_PASSWORD_SUCCESS";
    //         }
    //         else {
    //             statusCode = 2
    //             msg = "USER.NEW_PASSWORD_NOT_VALID";
    //         }
    //     } else {
    //         statusCode = 1
    //         msg = "USER.PASSWORD_NOT_VALID;"
    //     }
    //     return new ResponseSuccess(msg, statusCode);
    // }

    // @Put('image-url')
    // @UseGuards(AuthGuard('jwt'), RolesGuard)
    // @Roles(Role.User, Role.Teacher)
    // async saveURL(@Body('base64') base64: string, @User() user): Promise<IResponse<any>> {
    //     const res = await this.authService.saveURL(base64, user);
    //     return new ResponseSuccess("SUCCESS", res);
    // }

    
    
}

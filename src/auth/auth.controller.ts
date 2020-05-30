import { Body, Controller, Post, Put, UseGuards, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateTeacherDto } from '@/teacher/dto/create-teacher.dto';
import { ITeacher } from '@/teacher/interface/teacher.interface';
import { TeacherService } from '@/teacher/teacher.service';
import { UserService } from '@/user/user.service';
import { Role } from '@/config/constants';
import { Roles } from '@/utils/decorators/roles.decorator';
import { User } from '@/utils/decorators/user.decorator';
import { ResponseSuccess } from '@/utils/utils';
import { RolesGuard } from '@/utils/guards/roles.guard';
import { IResponse } from '@/utils/interfaces/response.interface';
import { AuthService } from './auth.service';
import { JobService } from '@/job/job.service';
import { IJob } from '@/job/interfaces/job.interface';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { LoginTeacherDto } from './dtos/loginTeacher.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly teacherService: TeacherService,
        private readonly jobService: JobService
    ) {}

    @Post('register/user')
    async registerUser(@Body() body: RegisterDto): Promise<IResponse<null>> {
        const { phone, email } = body;
        const countExisted: number = await this.userService.countUserByPhoneEmail({ phone, email });
        if (countExisted > 0)
            throw new ConflictException('REGISTRATION.USER_ALREADY_REGISTERED');
        const { job: jobId } = body;
        const job: IJob = await this.jobService.findJobById(jobId);
        if (!job)
            throw new NotFoundException('REGISTRATION.NOT_FOUND_JOB');
        await this.userService.createUser(body);
        return new ResponseSuccess<null>('REGISTRATION.USER_REGISTERED_SUCCESSFULLY');
    }

    @Post('login/user')
    async loginUser(@Body() body: LoginDto): Promise<IResponse<any>> {
        const { phone, password } = body;
        const user: any = await this.authService.validateLoginUser(phone, password);
        if (!user)
            throw new UnauthorizedException('LOGIN.USER_LOGIN_ERROR');
        return new ResponseSuccess<any>("LOGIN.USER_LOGIN_SUCCESSFULLY", user);
    }

    @Post('login/teacher')
    async loginTeacher(@Body() body: LoginTeacherDto): Promise<IResponse<any>> {
        const { phone, password } = body;
        const teacher: any = await this.authService.validateLoginTeacher(phone, password);
        if (!teacher)
            throw new UnauthorizedException('LOGIN.TEACHER_LOGIN_ERR');
        return new ResponseSuccess<any>('LOGIN.TEACHER_LOGIN_OK', teacher);
    }

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

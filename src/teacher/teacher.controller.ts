import { Controller, Put, UseGuards, Body, Post, Get, Req, NotFoundException, ConflictException, Param, Query, ParseIntPipe, ForbiddenException, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/utils/guards/roles.guard';
import { Roles } from '@/utils/decorators/roles.decorator';
import { Role } from '@/config/constants';
import { UpdateFCMDto } from './dtos/fcm.dto';
import { UpdateDto } from './dtos/update.dto';
import { UpdateSocialsDto } from './dtos/socials.dto';
import { UpdateAvatarDto } from './dtos/avatar.dto';
import { ChangePasswordDto } from './dtos/password.dto';
import { FetchTeacherParamDto } from './dtos/fetch.dto';
import { IResponse } from '@/utils/interfaces/response.interface';
import { ITeacher } from './interfaces/teacher.interface';
import { INotification } from './interfaces/notification.interface';
import { TeacherService } from './teacher.service';
import { ResponseSuccess } from '@/utils/utils';
import { RelaxGuard } from '@/utils/guards/relaxAuth.guard';
import { User } from '@/utils/decorators/user.decorator';
import { AuthorService } from '@/author/author.service';
import { StudentService } from '@/student/student.service';


@Controller('api/teachers')
export class TeacherController {
    constructor(
        private readonly teacherService: TeacherService,
        private readonly authorService: AuthorService,
        private readonly studentService: StudentService
    ) { }

    @Post('/test/create')
    async create(@Body() body): Promise<IResponse<ITeacher>> {
        const teacher: ITeacher = await this.teacherService.create(body);
        return new ResponseSuccess<ITeacher>('TEST_OK', teacher);
    }

    @Get('/me')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async fetch(@Req() req): Promise<IResponse<any>> {
        const teacher = await this.teacherService.findTeacherById(req.user._id);
        if (!teacher)
            throw new NotFoundException('Teacher doesn\'t existed!');
        return new ResponseSuccess('TEACHER.FETCH_SUCCESSFULLY', teacher);
    }

    @Put('update')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async update(@Req() req, @Body() body: UpdateDto): Promise<IResponse<any>> {
        const teacherId = req.user._id;
        const teacher: any = await this.teacherService.update(teacherId, body);
        if (!teacher)
            throw new NotFoundException('Teacher doesn\'t existed!');
        return new ResponseSuccess('TEACHER.UPDATE_OK', teacher);
    }

    @Put('update/socials')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async updateSocials(@Req() req, @Body() body: UpdateSocialsDto): Promise<IResponse<any>> {
        const teacherId = req.user._id;
        const teacher: any = await this.teacherService.updateSocials(teacherId, body);
        if (!teacher)
            throw new NotFoundException('Teacher doesn\'t existed!');
        return new ResponseSuccess('TEACHER.UPDATE_SOCIALS_OK', teacher);
    }

    @Put('update/avatar')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async updateAvatar(@Req() req, @Body() body: UpdateAvatarDto): Promise<IResponse<any>> {
        const teacherId: string = req.user._id;
        const { avatar } = body;
        const teacher: any = await this.teacherService.updateAvatar(teacherId, avatar);
        if (!teacher)
            throw new NotFoundException('Teacher doesn\'t existed!');
        return new ResponseSuccess('TEACHER.UPDATE_AVATAR_OK', teacher);
    }

    @Put('/update/password')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async changePassword(@Req() req, @Body() body: ChangePasswordDto): Promise<IResponse<boolean>> {
        const teacherId: string = req.user._id;
        const { oldPassword, newPassword } = body;
        const status = await this.teacherService.updatePassword(teacherId, oldPassword, newPassword);
        if (status === 0)
            throw new NotFoundException('Teacher doesn\'t existed!');
        const message: string = status === -1 ? 'Password doesn\'t match' : 'Change password ok';
        const errorCode: 0 | 1 = status === -1 ? 1 : 0;
        return new ResponseSuccess(message, true, errorCode);
    }

    @Put('/update/token')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async updateFCMToken(@Req() req, @Body() body: UpdateFCMDto): Promise<IResponse<any>> {
        const teacherId: string = req.user._id;
        const token = body.token;
        const teacher: any = await this.teacherService.updateFCMToken(teacherId, token);
        if (!teacher)
            throw new NotFoundException('User doesn\'t existed!');
        return new ResponseSuccess('USER_UPDATE_FCM_OK', teacher);
    }

    @Get('/notifications')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async fetchNotification(
        @Req() req,
        @Query('skip', ParseIntPipe) skip: number,
        @Query('limit', ParseIntPipe) limit: number
    ): Promise<IResponse<{ hasMore: boolean, list: INotification[] }>> {
        const userId: string = req.user._id;
        const notifications: { hasMore: boolean, list: INotification[] } = await this.teacherService.fetchNotifications(userId, skip, limit);
        return new ResponseSuccess<{ hasMore: boolean, list: INotification[] }>('FETCH_NOTIFS_OK', notifications);
    }

    @Put('/notifications/:id/seen')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async seenNotification(
        @Req() req,
        @Param('id') notificationId: string
    ): Promise<IResponse<boolean>> {
        const userId: string = req.user._id;
        const status: boolean = await this.teacherService.seen(userId, notificationId);
        return new ResponseSuccess<boolean>('SEEN_OK', status);
    }

    @Put('/notifications/all-seen')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async seenAllNotification(
        @Req() req
    ): Promise<IResponse<null>> {
        const userId: string = req.user._id;
        await this.teacherService.allSeen(userId);
        return new ResponseSuccess('SEEN_ALL_OK');
    }

    @Get('/invitation/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async fetchInvitation(
        @Req() req,
        @Param('id') notificationId: string
    ): Promise<IResponse<any>> {
        const teacherId: string = req.user._id;
        const { status, invitation } = await this.teacherService.fetchInvitation(teacherId, notificationId);
        if (status === -1) {         //Notification doesn't belong to teacher
            throw new ForbiddenException('You don\'t have permission');
        }
        else if (status === 0) {            //Notification is not invitation type
            throw new NotFoundException('The invitation is invalid!');
        }
        return new ResponseSuccess('FETCH_OK', invitation);
    }

    @Put('/invitation/:id/accept')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async acceptInvitation(
        @Req() req,
        @Param('id') notificationId: string
    ): Promise<IResponse<null>> {
        const teacherId: string = req.user._id;
        const status = await this.teacherService.acceptInvitation(teacherId, notificationId);
        if (status === -1) {         //Notification doesn't belong to teacher
            throw new ForbiddenException('You don\'t have permission');
        }
        else if (status === 0) {            //Notification is not invitation type
            throw new NotFoundException('The invitation is invalid!');
        }
        return new ResponseSuccess<null>('FETCH_OK', null);
    }
    @Get('/search')
    async searchTeacher(@Query() query): Promise<IResponse<any>> {
        let res = null
        await this.teacherService.searchTeacher(query.keyword, parseInt(query.page), parseInt(query.pageSize))
            .then(data => {
                res = data
            }).catch(err => {
                //console.log(err)
            })
        return new ResponseSuccess("SUCCESS", res);
    }

    @Get('/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async fetchTeacher(
        @Req() req,
        @Param() params: FetchTeacherParamDto
    ): Promise<IResponse<any>> {
        const userId: string = req.user._id;
        const teacherId: string = params.id;
        const teacher = await this.teacherService.fetchTeacher(userId, teacherId);
        if (!teacher) throw new NotFoundException('Invalid teacher');
        return new ResponseSuccess('FETCH_TEACHER_OK', teacher);
    }

    @Put('/:id/follow')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async follow(
        @Req() req,
        @Param() params: FetchTeacherParamDto
    ): Promise<IResponse<null>> {
        const userId: string = req.user._id;
        const teacherId: string = params.id;
        const status = await this.teacherService.follow(userId, teacherId);
        if (status === 0) throw new NotFoundException('Invalid teacher!');
        return new ResponseSuccess('FOLLOW_OK', null, status === 1 ? 0 : 1);
    }

    @Put('/:id/unfollow')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async unfollow(
        @Req() req,
        @Param() params: FetchTeacherParamDto
    ): Promise<IResponse<null>> {
        const userId: string = req.user._id;
        const teacherId: string = params.id;
        const status = await this.teacherService.unfollow(userId, teacherId);
        if (status === 0) throw new NotFoundException('Invalid teacher!');
        return new ResponseSuccess('FOLLOW_OK', null, status === 1 ? 0 : 1);
    }

    @Get('/:id/courses')
    @UseGuards(RelaxGuard)
    async fetchTeacherCourses(
      @User() user,
      @Query('skip', ParseIntPipe) skip: number,
      @Query('limit', ParseIntPipe) limit: number,
      @Param('id') teacherId: string
    ): Promise<IResponse<any>> {
        let hashMap = {};
        if (user && user.role === Role.User) {
            hashMap = await this.studentService.getMyCoursesHashMap(user._id);
        }
        const result = await this.authorService.fetchCoursesDataOfTeacher(teacherId, skip, limit, hashMap);
        return new ResponseSuccess('FETCH_OK', result);
    }

    
}

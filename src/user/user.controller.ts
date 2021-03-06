import { Body, Controller, Get, Param, Query, Put, UseGuards, HttpException, HttpStatus, Req, NotFoundException, ConflictException, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '@/utils/decorators/roles.decorator';
import { User } from '@/utils/decorators/user.decorator';
import { UpdateDto } from './dtos/update.dto';
import { UpdateCatesDto } from './dtos/catesOfConcern.dto';
import { ChangePasswordDto } from './dtos/password.dto';
import { UpdateAvatarDto } from './dtos/avatar.dto';
import { UpdateFCMDto } from './dtos/fcm.dto';
import { FetchNotificationsDto } from './dtos/notification.dto';
import { ResponseSuccess } from '@/utils/utils';
import { RolesGuard } from '@/utils/guards/roles.guard';
import { IResponse } from '@/utils/interfaces/response.interface';
import { Role } from '@/config/constants';
import { IUser } from './interfaces/user.interface';
import { UserService } from './user.service';
import { JobService } from '@/job/job.service';
import { IJob } from '@/job/interfaces/job.interface';
import { INotification } from './interfaces/notification.interface';

@Controller('api/users')
@Roles(Role.User)
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly jobService: JobService
    ) {}

    @Get('/me')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async fetch(@Req() req): Promise<IResponse<any>> {
        const user = await this.userService.findUserById(req.user._id);
        if (!user)
            throw new NotFoundException('User doesn\'t existed!');
        return new ResponseSuccess('USER.FETCH_SUCCESSFULLY', user);

    }

    @Put('/update/info')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async update(@Req() req, @Body() body: UpdateDto): Promise<IResponse<any>> {
        const userId = req.user._id;
        const { job: jobId } = body;
        const job: IJob = await this.jobService.findJobById(jobId);
        if (!job)
            throw new NotFoundException('Not found job!'); 
        const user = await this.userService.update(userId, body);
        if (!user)
            throw new NotFoundException('User doesn\'t existed!');
        return new ResponseSuccess('USER.UPDATE_SUCCESSFULLY', user);
    }

    @Put('/update/cates')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async updateCatesOfConcern(@Req() req, @Body() body: UpdateCatesDto): Promise<IResponse<any>> {
        const { targetKeys } = body;
        const userId: string = req.user._id;
        const user = await this.userService.updateCatesOfConcern(userId, targetKeys);
        if (!user)
            throw new NotFoundException('User doesn\'t existed!');
        return new ResponseSuccess('USER.UPDATE_CATES_SUCCESS', user);
    }

    @Put('/update/password')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async changePassword(@Req() req, @Body() body: ChangePasswordDto): Promise<IResponse<boolean>> {
        const userId: string = req.user._id;
        const { oldPassword, newPassword } = body;
        const status = await this.userService.updatePassword(userId, oldPassword, newPassword);
        if (status === 0)
            throw new NotFoundException('User doesn\'t existed!');
        const message: string = status === -1 ? 'Password doesn\'t match' : 'Change password ok';
        const errorCode: 0 | 1 = status === -1 ? 1 : 0;
        return new ResponseSuccess(message, true, errorCode);
    }

    @Put('/update/avatar')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async updateAvatar(@Req() req, @Body() body: UpdateAvatarDto): Promise<IResponse<any>> {
        const userId: string = req.user._id;
        const { avatar } = body;
        const user: any = await this.userService.updateAvatar(userId, avatar);
        if (!user)
            throw new NotFoundException('User doesn\'t existed!');
        return new ResponseSuccess('USER.UPDATE_AVATAR_OK', user);
    }

    @Put('/update/token')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async updateFCMToken(@Req() req, @Body() body: UpdateFCMDto): Promise<IResponse<any>> {
        const userId: string = req.user._id;
        const token = body.token;
        const user: any = await this.userService.updateFCMToken(userId, token);
        if (!user)
            throw new NotFoundException('User doesn\'t existed!');
        return new ResponseSuccess('USER_UPDATE_FCM_OK', user);
    }

    @Get('/notifications')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async fetchNotification(
        @Req() req,
        @Query('skip', ParseIntPipe) skip: number,
        @Query('limit', ParseIntPipe) limit: number
    ): Promise<IResponse<{ hasMore: boolean, list: INotification[] }>> {
        const userId: string = req.user._id;
        const notifications: { hasMore: boolean, list: INotification[] } = await this.userService.fetchNotifications(userId, skip, limit);
        return new ResponseSuccess<{ hasMore: boolean, list: INotification[] }>('FETCH_NOTIFS_OK', notifications);
    }

    @Put('/notifications/:id/seen')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async seenNotification(
        @Req() req,
        @Param('id') notificationId: string
    ): Promise<IResponse<boolean>> {
        const userId: string = req.user._id;
        const status: boolean = await this.userService.seen(userId, notificationId);
        return new ResponseSuccess<boolean>('SEEN_OK', status);
    }

    @Put('/notifications/all-seen')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async seenAllNotification(
        @Req() req
    ): Promise<IResponse<null>> {
        const userId: string = req.user._id;
        await this.userService.allSeen(userId);
        return new ResponseSuccess('SEEN_ALL_OK');
    }
}

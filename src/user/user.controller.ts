import { Body, Controller, Get, Param, Query, Put, UseGuards, HttpException, HttpStatus, Req, NotFoundException, ConflictException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '@/utils/decorators/roles.decorator';
import { User } from '@/utils/decorators/user.decorator';
import { UpdateDto } from './dtos/update.dto';
import { UpdateCatesDto } from './dtos/updateCates.dto';
import { ChangePasswordDto } from './dtos/changePassword.dto';
import { ResponseSuccess } from '@/utils/utils';
import { RolesGuard } from '@/utils/guards/roles.guard';
import { IResponse } from '@/utils/interfaces/response.interface';
import { Role } from '@/config/constants';
import { IUser } from './interface/user.interface';
import { UserService } from './user.service';
import { JobService } from '@/job/job.service';
import { IJob } from '@/job/interfaces/job.interface';

@Controller('users')
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
        const userId = req.user._id;
        const { oldPassword, newPassword } = body;
        const status = await this.userService.updatePassword(userId, oldPassword, newPassword);
        if (status === 0)
            throw new NotFoundException('User doesn\'t existed!');
        else if (status === -1)
            throw new ConflictException('Password doesn\'t matched!');
        return new ResponseSuccess('USER.CHANGE_PASSWORD_SUCCESS', true);
    }
    // @Get()
    // @UseGuards(AuthGuard('jwt'), RolesGuard)
    // @Roles(Role.User)
    // async findUser(@User() userFromDB: IUser): Promise<IResponse<IUser>> {
    //     const user = await this.userService.getUser(userFromDB.phone);
    //     return new ResponseSuccess("USER.GET_SUCCESS", user as IUser);          ///wtf?????
    // }

    // @Get(':phone')
    // @UseGuards(AuthGuard('jwt'), RolesGuard)
    // @Roles(Role.User)
    // async findUserByPhone(@Param('phone') phone: string): Promise<IResponse<IUser>> {
    //     const user = await this.userService.getUser(phone);
    //     return new ResponseSuccess("USER.GET_BY_ID_SUCCESS", user as IUser);    //wtf ???
    // }

    // @Put('concern')
    // @UseGuards(AuthGuard('jwt'), RolesGuard)
    // @Roles(Role.User)
    // async updateConcern(@Body('catesOfConcern') catesOfConcern_: string[], @User() user): Promise<IResponse<any>> {
    //     const userFromDB = await this.userService.findUserByPhone(user.phone);
    //     const isValidObjecID = checkValidObjecID(catesOfConcern_);
    //     if(!isValidObjecID)
    //         throw new HttpException("USER.CONCERN_FAILD", HttpStatus.BAD_REQUEST);
    //     const updateUser = await this.userService.updateUserById(user.id, userFromDB);
    //     const {catesOfConcern} = updateUser;
    //     return new ResponseSuccess("USER.UPDATE_CONCERN_SUCCESS", catesOfConcern);
    // }
    
    // @Put('info')
    // @UseGuards(AuthGuard('jwt'), RolesGuard)
    // @Roles(Role.User)
    // async updateInfo(@Body() updateUserDto: UpdateUserDto, @User() user): Promise<IResponse<IUser>> {
    //     const updateUser = await this.userService.updateUserInfo(user.phone, updateUserDto);
    //     return new ResponseSuccess("USER.UPDATE_INFO_SUCCESS", updateUser);
    // }

    // @Get('notifications')
    // @UseGuards(AuthGuard('jwt'), RolesGuard)
    // @Roles(Role.User)
    // async findNotifications(@User() user, @Query() query ){
    //     const notifications = await this.userService.findNotifications(user.phone,query.page, query.limit);
    //     return new ResponseSuccess("USER.UPDATE_INFO_SUCCESS", notifications);
    // }



    // @Get('profile/:userId')
    // @UseGuards(AuthGuard('jwt'), RolesGuard)
    // @Roles(Role.User)
    // async findProfile(@User() myUser, @Param('userId') userId: string ) {
    //     const profile = await this.userService.findProfile(myUser, userId);
    //     return new ResponseSuccess("USER.VIEW_PROFILE", profile);
    // }

    // @Get('friendOfFriends/:friendId')
    // @UseGuards(AuthGuard('jwt'), RolesGuard)
    // @Roles(Role.User)
    // async findFriendsOfFriend(@User() myUser, @Param('friendId') friendId: string ) {
    //     const friendOfFriends = await this.userService.findFriendsOfFriend(myUser, friendId);
    //     return new ResponseSuccess("USER.FIREND_OF_FRIENDS", friendOfFriends);
    // }

    // @Get('profile/teacher/:teacherId')
    // @UseGuards(AuthGuard('jwt'), RolesGuard)
    // @Roles(Role.User)
    // async findTeacher(@User() myUser, @Param('teacherId') teacherId: string ) {
    //     const profile = await this.userService.findTeacher(myUser, teacherId);
    //     return new ResponseSuccess("USER.VIEW_PROFILE_TEACHER", profile);
    // }

    // @Put('teacher/follow')
    // @UseGuards(AuthGuard('jwt'), RolesGuard)
    // @Roles(Role.User)
    // async setFollowTeacher(@User() user, @Body('teacherId') teacherId: string, @Body('status') status: boolean) {
    //     const respond = await this.userService.setFollowTeacher(user, teacherId, status);
    //     return new ResponseSuccess("USER.VIEW_PROFILE_TEACHER", respond);
    // }

    // @Put('friend/status')
    // @UseGuards(AuthGuard('jwt'), RolesGuard)
    // @Roles(Role.User)
    // async setFriendStatus(@User() user, @Body('friendId') friendId: string, @Body('status') status: number) {
    //     const respond = await this.userService.setFriendStatus(user, friendId, status);
    //     return new ResponseSuccess("USER.VIEW_PROFILE_TEACHER", respond);
    // }

}

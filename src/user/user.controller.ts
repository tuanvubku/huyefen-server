import { Body, Controller, Get, Param, Query, Put, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '@/utils/decorator/roles.decorator';
import { User } from '@/utils/decorator/user.decorator';
import { ResponseSuccess } from '@/utils/utils';
import { RolesGuard } from '@/utils/guard/roles.guard';
import { IResponse } from '@/utils/interfaces/response.interface';
import { Role } from '@/config/constants';
import { IUser } from './interface/user.interface';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/create-user.dto';
import { checkValidObjecID } from '@/utils/validate/validate';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

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

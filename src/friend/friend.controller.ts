import { Controller, Get, Put, UseGuards, Req, Query, ParseIntPipe, Param, NotFoundException } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/utils/guards/roles.guard';
import { Roles } from '@/utils/decorators/roles.decorator';
import { Role } from '@/config/constants';
import { IResponse } from '@/utils/interfaces/response.interface';
import { IFriend } from './interfaces/friend.interface';
import { ResponseSuccess } from '@/utils/utils';
import { FetchFriendParamDto } from './dtos/fetch.dto';

@Controller('api/friends')
export class FriendController {
    constructor (
        private readonly userService: UserService
    ) {}

    @Get('/me')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async fetchFriends(
        @Req() req,
        @Query('page', ParseIntPipe) page: number,
        @Query('limit', ParseIntPipe) limit: number
    ): Promise<IResponse<{ hasMore: boolean, list: IFriend[] }>> {
        const userId: string = req.user._id;
        const friendsData = await this.userService.fetchFriends(userId, page, limit);
        return new ResponseSuccess<{ hasMore: boolean, list: IFriend[] }>('FETCH_FRIENDS_OK', friendsData);
    }

    @Get('/me/all')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async fetchAllFriends(
        @Req() req,
        @Query('existed', ParseIntPipe) existed: number
    ): Promise<IResponse<{ hasMore: boolean, list: IFriend[] }>> {
        const userId: string = req.user._id;
        const friendsData = await this.userService.allFriends(userId, existed);
        return new ResponseSuccess('ALL_FRIENDS_OK', friendsData);
    }

    @Get('/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async fetchFriend(
        @Req() req,
        @Param() params: FetchFriendParamDto
    ): Promise<IResponse<IFriend>> {
        const userId: string = req.user._id;
        const friendId: string = params.id;
        const friend: IFriend = await this.userService.fetchFriend(userId, friendId);
        if (!friend) throw new NotFoundException('Invalid friend');
        return new ResponseSuccess<IFriend>('FETCH_FRIEND_OK', friend);
    }

    @Get('/:id/friends')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async fetchFriendOfFriends(
        @Req() req,
        @Param() params: FetchFriendParamDto,
        @Query('page', ParseIntPipe) page: number,
        @Query('limit', ParseIntPipe) limit: number
    ): Promise<IResponse<{ hasMore: boolean, list: IFriend[] }>> {
        const userId: string = req.user._id;
        const friendId: string = params.id;
        const { status, data } = await this.userService.fetchFriendsOfFriend(userId, friendId, page, limit);
        if (!status) throw new NotFoundException('Invalid friend');
        return new ResponseSuccess('FETCH_OK', data);
    }

    @Get('/:id/friends/all')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async allFriendsOfFriend(
        @Req() req,
        @Param() params: FetchFriendParamDto,
        @Query('existed', ParseIntPipe) existed: number
    ): Promise<IResponse<{ hasMore: boolean, list: IFriend[] }>> {
        const userId: string = req.user._id;
        const friendId: string = params.id;
        const { status, data } = await this.userService.allFriendsOfFriend(userId, friendId, existed);
        if (!status) throw new NotFoundException('Invalid friend');
        return new ResponseSuccess('ALL_FRIENDS_OK', data);
    }

    @Put('/:id/add')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async addFriend(
        @Req() req,
        @Param() params: FetchFriendParamDto
    ): Promise<IResponse<null>> {
        const userId: string = req.user._id;
        const friendId: string = params.id;
        const status: 0 | 1 | -1 = await this.userService.addFriend(userId, friendId);
        if (status === 0) throw new NotFoundException('Invalid friend');
        return new ResponseSuccess<null>('ADD_FRIEND', null, 1 ? 0 : 1);
    }
}

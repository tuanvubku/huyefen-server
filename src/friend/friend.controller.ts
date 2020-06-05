import { Controller, Get, UseGuards, Req, Query, ParseIntPipe } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/utils/guards/roles.guard';
import { Roles } from '@/utils/decorators/roles.decorator';
import { Role } from '@/config/constants';
import { IResponse } from '@/utils/interfaces/response.interface';
import { IFriend } from './interfaces/friend.interface';
import { ResponseSuccess } from '@/utils/utils';

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
}

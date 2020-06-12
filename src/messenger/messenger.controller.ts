import { Controller, Get, UseGuards, Req, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/utils/guards/roles.guard';
import { Roles } from '@/utils/decorators/roles.decorator';
import { Role } from '@/config/constants';
import { IResponse } from '@/utils/interfaces/response.interface';
import { MessengerService } from './messenger.service';
import { ResponseSuccess } from '@/utils/utils';

@Controller('api/messenger')
@Roles(Role.User)
export class MessengerController {
    constructor (
        private readonly messengerService: MessengerService
    ) {}

    @Get('/check/:friendId')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async check(
        @Req() req,
        @Param('friendId') friendId: string
    ): Promise<IResponse<boolean>> {
        const userId: string = req.user._id;
        const checkStatus: boolean = await this.messengerService.check(userId, friendId);
        return new ResponseSuccess<boolean>('CHECK_STATUS_OK', checkStatus);
    }

}

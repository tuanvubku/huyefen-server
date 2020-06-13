import { Controller, Get, Post, UseGuards, Req, Param, Body, ForbiddenException, ConflictException, NotFoundException, ParseIntPipe, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/utils/guards/roles.guard';
import { Roles } from '@/utils/decorators/roles.decorator';
import { Role } from '@/config/constants';
import { IResponse } from '@/utils/interfaces/response.interface';
import { MessengerService } from './messenger.service';
import { ResponseSuccess } from '@/utils/utils';
import { SendDto } from './dtos/send.dto';
import { IMessage } from './interfaces/message.interface';

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
    ): Promise<IResponse<string>> {
        const userId: string = req.user._id;
        const converId: string = await this.messengerService.check(userId, friendId);
        return new ResponseSuccess<string>('CHECK_STATUS_OK', converId);
    }

    @Post('/send')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async send(
        @Req() req,
        @Body() body: SendDto
    ): Promise<IResponse<any>> {
        const userId: string = req.user._id;
        const sendRet: any = await this.messengerService.send(userId, body);
        if (sendRet === -1)
            throw new ForbiddenException('You don\'t have permission in this conversation!');
        else if (sendRet === -2)
            throw new ConflictException('The conversation has been created!');
        return new ResponseSuccess('SEND_OK', sendRet);
    }

    @Get('/conversations')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async fetch(
        @Req() req,
        @Query('skip', ParseIntPipe) skip: number,
        @Query('limit', ParseIntPipe) limit: number
    ): Promise<IResponse<{ hasMore: boolean, list: object }>> {
        const userId: string = req.user._id;
        const result: { hasMore: boolean, list: object } = await this.messengerService.fetch(userId, skip, limit);
        return new ResponseSuccess('FETCH_CONVERS_OK', result);
    }

    @Get('/conversations/:id/partner')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async fetchPartner(
        @Req() req,
        @Param('id') conversationId: string
    ): Promise<IResponse<any>> {
        const userId: string = req.user._id;
        const partner = await this.messengerService.fetchPartner(userId, conversationId);
        if (!partner)
            throw new ForbiddenException('You don\'t have permission to access this conversation!');
        return new ResponseSuccess('FETCH_PARTNER_OK', partner);
    }

    @Get('/conversations/:id/messages')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async fetchMessages(
        @Req() req,
        @Param('id') conversationId: string,
        @Query('skip', ParseIntPipe) skip: number,
        @Query('limit', ParseIntPipe) limit: number
    ): Promise<IResponse<{ hasMore: boolean, list: IMessage[] }>> {
        const userId: string = req.user._id;
        const result: { hasMore: boolean, list: IMessage[] } = await this.messengerService.fetchMessages(userId, conversationId, skip, limit);
        if (!result)
            throw new ForbiddenException('You don\'t have permission to access this conversation!');
        return new ResponseSuccess('FETCH_MESSAGES_OK', result);
    }

    @Get('/unread')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async fetchUnread(
        @Req() req
    ): Promise<IResponse<number>> {
        const userId: string = req.user._id;
        const unread: number = await this.messengerService.countUsMessage(userId);
        return new ResponseSuccess<number>('FETCH_OK', unread);
    }
}

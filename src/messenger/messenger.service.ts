import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IConversation } from './interfaces/conversation.interface';
import { IMessage } from './interfaces/message.interface';

@Injectable()
export class MessengerService {
    constructor (
        @InjectModel('Conversation') private readonly conversationModel: Model<IConversation>,
        @InjectModel('Message') private readonly messageModel: Model<IMessage>
    ) {}

    async check(userId: string, friendId: string): Promise<boolean> {
        const conversation: IConversation = await this.conversationModel
            .findOne({
                members: [userId, friendId]
            });
        return !!conversation;
    }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IConversation } from './interfaces/conversation.interface';
import { IMessage } from './interfaces/message.interface';
import { SendDto } from './dtos/send.dto';
import { MessagingService } from '@/firebase/messaging.service';
import { UserService } from '@/user/user.service';
import { IUser } from '@/user/interfaces/user.interface';
import { Push } from '@/config/constants';
import * as _ from 'lodash';
import { pick } from 'lodash';

@Injectable()
export class MessengerService {
    constructor (
        @InjectModel('Conversation') private readonly conversationModel: Model<IConversation>,
        @InjectModel('Message') private readonly messageModel: Model<IMessage>,
        private readonly messagingService: MessagingService,
        private readonly userService: UserService
    ) {}

    async check(userId: string, friendId: string): Promise<string> {
        const conversation: IConversation = await this.conversationModel
            .findOne({
                members: [userId, friendId]
            });
        return (conversation && conversation._id) || null;
    }

    async send(userId: string, params: SendDto): Promise<any> {
        const {
            converId,
            userId: targetId,
            content,
            createdAt
        } = params;
        let lastMessage: string;
        if (content.video)
            lastMessage = 'Đã tải lên một video';
        else if (content.image)
            lastMessage = 'Đã tải lên một hình ảnh';
        else
            lastMessage = content.text;
        let conversation: IConversation;
        if (converId) {
            conversation = await this.conversationModel
                .findOne({
                    _id: converId,
                    members: userId
                });
            if (!conversation) return -1;
            conversation.lastMessage = lastMessage;
            conversation.lastUpdated = createdAt;
        }
        else {
            const existedConversation = await this.conversationModel
                .findOne({
                    members: { $all: [targetId, userId] }
                });
            if (existedConversation) return -2;
            conversation = new this.conversationModel({
                members: [userId, targetId],
                lastMessage,
                lastUpdated: createdAt
            });
        }
        await conversation.save();
        //check target status
        const message: IMessage = new this.messageModel({
            sender: userId,
            conver: conversation._id,
            createdAt,
            seenAt: null,
            content
        });
        await message.save();
        const friend: IUser = await this.userService.findById(targetId);
        const user: IUser = await this.userService.findById(userId);
        //view user is on in socket?
        //if yes --> send to socket.
        //if no --> firebase
        if (friend.fcmToken) {
            this.messagingService.send(friend.fcmToken, {
                notification: {
                    title: 'Tin nhắn mới',
                    body: `${user.name} đã gửi cho bạn một tin nhắn`
                },
                data: {
                    converId: conversation._id.toString(),
                    createdAt: message.createdAt.toString(),
                    ...(message.content.text ? { text: message.content.text } : {}),
                    ...(message.content.image ? { image: message.content.image }: {}),
                    ...(message.content.video ? { video: message.content.video } : {}),
                    pushType: Push.Messenger,
                    userId,
                    userName: user.name,
                    userAvatar: user.avatar
                }
            });
        }
        return {
            conversation: {
                ..._.pick(conversation, ['_id', 'lastUpdated', 'lastMessage']),
                name: friend.name,
                avatar: friend.avatar
            },
            message: {
                ..._.pick(message, ['_id', 'content', 'createdAt', 'seenAt', 'receivedAt']),
                userId,
                userName: user.name,
                avatar: user.avatar
            }
        };
    }

    async fetch(userId: string, skip: number, limit: number): Promise<{ hasMore: boolean, list: object }> {
        const conversations = await this.conversationModel
            .find({ members: userId })
            .populate('members', 'name avatar')
            .sort('-lastUpdated');
        const hasMore: boolean = skip + limit < _.size(conversations);
        const arrList = _.map(
            _.slice(conversations, skip, skip + limit),
            conversation => {
                const friend: any = _.find(conversation.members, member => (member as any)._id.toString() !== userId);
                const name: string = friend.name;
                const avatar: string = friend.avatar;
                return {
                    ..._.pick(conversation, ['_id', 'lastMessage', 'lastUpdated']),
                    name,
                    avatar
                };
            }
        )
        return {
            hasMore,
            list: _.keyBy(arrList, '_id')
        };
    }

    async fetchPartner(userId: string, converId: string): Promise<any> {
        const conversation: IConversation = await this.conversationModel
            .findOne({ _id: converId, members: userId })
            .populate('members', 'avatar name')
            .select('members');
        if (conversation) {
            const partner = _.find(conversation.members, member => (member as any)._id.toString() !== userId);
            return partner;
        }
        return null;
    }

    async fetchMessages(userId: string, converId: string, skip: number, limit: number): Promise<{ hasMore: boolean, list: IMessage[] }> {
        const checkCount: number = await this.conversationModel
            .findOne({
                _id: converId,
                members: userId
            })
            .count();
        if (checkCount < 1) return null;
        const numOfMessage: number = await this.messageModel.find({ conver: converId }).count();
        const hasMore: boolean = skip + limit < numOfMessage;
        const messagesList: IMessage[] = await this.messageModel
            .find({ conver: converId })
            .populate('sender', 'name avatar')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);
        const unseenMessageIds = _.map(
            _.filter(
                messagesList,
                message => (message.sender as any)._id.toString() !== userId && !message.seenAt
            ),
            '_id'
        );
        const seenAt = new Date().toISOString();
        if (!_.isEmpty(unseenMessageIds)) {
            //check socket --> if ok -> emit to socket unseenMessageIds array with seenAt value
            await this.messageModel
                .updateMany({
                    _id: {
                        $in: unseenMessageIds
                    }
                }, {
                    $set: {
                        seenAt
                    }
                });
        }
        const messages = _.map(
            messagesList,
            message => {
                const sender = message.sender as any;
                const userName: string = sender.name;
                const avatar: string = sender.avatar;
                const userId: string = sender._id.toString();
                let seenAtValue = message.seenAt;
                if (_.indexOf(unseenMessageIds, message._id) > -1)
                    seenAtValue = seenAt;
                return {
                    ..._.pick(message, ['_id', 'content', 'createdAt', 'receivedAt']),
                    userName,
                    avatar,
                    userId,
                    conversationId: converId,
                    seenAt: seenAtValue
                };
            }
        );
        _.reverse(messages);
        return {
            hasMore,
            list: messages
        };
    }
}

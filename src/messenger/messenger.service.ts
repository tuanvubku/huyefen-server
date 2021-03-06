import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IConversation } from './interfaces/conversation.interface';
import { IMessage } from './interfaces/message.interface';
import { SendDto } from './dtos/send.dto';
import { MessagingService } from '@/firebase/messaging.service';
import { UserService } from '@/user/user.service';
import { IUser } from '@/user/interfaces/user.interface';
import { Push, Role } from '@/config/constants';
import { Types } from 'mongoose';
import * as _ from 'lodash';
import { MessengerGateway } from './messenger.gateway';

@Injectable()
export class MessengerService {
    constructor (
        @InjectModel('Conversation') private readonly conversationModel: Model<IConversation>,
        @InjectModel('Message') private readonly messageModel: Model<IMessage>,
        private readonly messagingService: MessagingService,
        @Inject(forwardRef(() => UserService)) private readonly userService: UserService,
        private readonly messengerGateway: MessengerGateway
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
        const checkOnline = this.messengerGateway.checkUserInConversation(targetId, conversation._id.toString());
        const message: IMessage = new this.messageModel({
            sender: userId,
            conver: conversation._id,
            createdAt,
            content,
            ...(!checkOnline ? { seenAt: null } : {})
        });
        await message.save();
        let unseensPair: any = await this.countUnseensPair(conversation._id);
        unseensPair = _.keyBy(unseensPair, '_id');
        const friend: IUser = await this.userService.findById(targetId);
        const user: IUser = await this.userService.findById(userId);
        const result = {
            conversation: {
                ..._.pick(conversation, ['_id', 'lastUpdated', 'lastMessage']),
                unseen: unseensPair[targetId] && unseensPair[targetId].value || 0,
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
        if (checkOnline) {
            this.messengerGateway.sendMessage(
                targetId,
                result
            );
        }
        else {
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
                        unseen: (unseensPair[userId] && unseensPair[userId].value.toString()) || 0,
                        pushType: Push.Messenger,
                        ownerType: Role.User,
                        ownerId: userId,
                        ownerName: user.name,
                        ownerAvatar: user.avatar
                    }
                });
            }
        }
        return result;
    }

    async fetch(userId: string, skip: number, limit: number): Promise<{ hasMore: boolean, list: object }> {
        const conversations = await this.conversationModel
            .find({ members: userId })
            .populate('members', 'name avatar')
            .sort('-lastUpdated');
        const hasMore: boolean = skip + limit < _.size(conversations);
        const mainList =  _.slice(conversations, skip, skip + limit);
        const converIds = _.map(mainList, '_id');
        let unreadArr: any = [];
        if (!_.isEmpty(converIds)) {
            unreadArr = await this.countUnread(userId, converIds);
            unreadArr = _.keyBy(unreadArr, '_id');
        }
        const arrList = _.map(
            mainList,
            conversation => {
                const friend: any = _.find(conversation.members, member => (member as any)._id.toString() !== userId);
                const name: string = friend.name;
                const avatar: string = friend.avatar;
                const converId: string = conversation._id.toString();
                return {
                    ..._.pick(conversation, ['_id', 'lastMessage', 'lastUpdated']),
                    unseen: unreadArr[converId] && unreadArr[converId].value || 0,
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

    async fetchMessages(userId: string, converId: string, skip: number, limit: number): Promise<{ seenCount: number, hasMore: boolean, list: IMessage[] }> {
        const converItem: IConversation = await this.conversationModel
            .findOne({
                _id: converId,
                members: userId
            });
        if (!converItem) return null;
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
            const friendId: string = (_.find(converItem.members, id => id.toString() !== userId)).toString();
            const checkOnline: boolean = this.messengerGateway.checkUserInConversation(friendId, converId);
            if (checkOnline) {
                this.messengerGateway.emitSeen(friendId, {
                    value: seenAt,
                    messageIds: unseenMessageIds
                });
            }
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
            seenCount: _.size(unseenMessageIds),
            hasMore,
            list: messages
        };
    }

    async countUsMessage(userId: string): Promise<number> {
        const conversations: IConversation[] = await this.conversationModel
            .find({ members: userId });
        const conversationIds = _.map(conversations, '_id');
        const usConversations = await this.messageModel.aggregate([
            {
                //filter
                $match: {
                    conver: {
                        $in: conversationIds,
                    },
                    sender: {
                        $ne: Types.ObjectId(userId)
                    },
                    seenAt: null
                }
            },
            {
                $group: {
                    _id: '$conver'
                }
            }
        ]);
        return _.size(usConversations);
    }

    async countUnread(userId: string, converIds: string[]): Promise<any[]> {
        return await this.messageModel.aggregate([
            {
                $match: {
                    conver: {
                        $in: converIds
                    },
                    sender: {
                        $ne: Types.ObjectId(userId)
                    },
                    seenAt: null
                }
            },
            {
                $group: {
                    _id: '$conver',
                    value: { $sum: 1 }
                }
            }
        ]);
    }

    async countUnseensPair(converId: string): Promise<any> {
        return await this.messageModel.aggregate([
            {
                $match: {
                    conver: converId,
                    seenAt: null
                }
            },
            {
                $group: {
                    _id: '$sender',
                    value: { $sum: 1 }
                }
            }
        ]);
    }
}

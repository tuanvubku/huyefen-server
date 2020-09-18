import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICourseMessenger } from '@/course-messenger/interface/course-messenger.interface';
import * as _ from 'lodash';
import { IMessage } from '@/messenger/interfaces/message.interface';
import { IUser } from '@/user/interfaces/user.interface';
import { UserService } from '@/user/user.service';
import { CourseMessengerGateway } from '@/course-messenger/course-messenger.gateway';
import { StudentService } from '@/student/student.service';

@Injectable()
export class CourseMessengerService {
    constructor(
        @InjectModel('CourseMessenger') private readonly courseMessengerModel: Model<ICourseMessenger>,
        private readonly userService: UserService,
        private readonly studentService: StudentService,
        private readonly courseMessengerGateway: CourseMessengerGateway
    ) {}

    async getMessagesOfCourse(courseId: string, skip: number, limit: number): Promise<any> {
        const numOfMessage: number = await this.courseMessengerModel.find({ course: courseId }).count();
        const hasMore: boolean = skip + limit < numOfMessage;
        const messagesList = await this.courseMessengerModel
            .find({ course: courseId })
            .populate('sender', 'name avatar')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);
        const messages = _.map(
            messagesList,
            message => {
                const sender = message.sender as any;
                const userName: string = sender.name;
                const avatar: string = sender.avatar;
                const userId: string = sender._id.toString();
                return {
                    ..._.pick(message, ['_id', 'content', 'createdAt']),
                    content: {
                        text: message.content
                    },
                    userName,
                    avatar,
                    userId,
                    courseId
                };
            }
        );
        _.reverse(messages);
        return {
            hasMore,
            list: messages
        }
    }

    async sendTextMessage(userId: string, courseId: string, content: string): Promise<any> {
        const newMessage = new this.courseMessengerModel({
            course: courseId,
            content,
            sender: userId
        });
        await newMessage.save();
        const user: IUser = await this.userService.findById(userId);
        const lastMessage = {
            ..._.pick(newMessage, ['_id', 'content', 'createdAt']),
            content: {
                text: content
            },
            userId,
            userName: user.name,
            avatar: user.avatar
        }
        this.courseMessengerGateway.sendMessage(courseId, userId, lastMessage);
        return lastMessage;
    }

    async getMembersOfCourse(courseId: string, skip: number, limit: number): Promise<any> {
        const { list, hasMore } = await this.studentService.getMembers(courseId, skip, limit);
        const onlineStatus = this.courseMessengerGateway.getOnlineStatus(courseId);
        console.log(onlineStatus);
        return {
            list: list.map(item => ({
                ...item,
                isOnline: !!onlineStatus[item.user._id.toString()]
            })),
            hasMore,
        };
    }
}

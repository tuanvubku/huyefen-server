import { HttpException, HttpStatus, Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import * as _ from 'lodash';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from '@/auth/dtos/register.dto';
import { TeacherService } from '@/teacher/teacher.service';
import { UpdateDto } from './dtos/update.dto';
import { IUser } from './interfaces/user.interface';
import { IFriend } from '@/friend/interfaces/friend.interface';
import { FriendStatuses } from '@/config/constants';

@Injectable()
export class UserService {

    constructor(
        @InjectModel('User') private readonly userModel: Model<IUser>,
        private readonly configService: ConfigService,
        //private readonly teacherService: TeacherService
    ) { }

    async countUserByPhoneEmail(user: { phone: string, email: string }): Promise<number> {
        const { phone, email } = user;
        const count = await this.userModel
            .find()
            .or([{ phone }, { email }])
            .count();
        return count;
    }

    async createUser(user: RegisterDto): Promise<void> {
        const saltRounds: number = parseInt(this.configService.get<string>('SALT_ROUNDS'));
        const hashedPassword: string = await bcrypt.hash(user.password, saltRounds);
        const newUser = new this.userModel({
            ...user,
            password: hashedPassword
        });
        await newUser.save();
    }

    async findUserByPhone(phone: string): Promise<any> {
        const user: any = await this.userModel
            .findOne({ phone })
            .select({
                conversations: 0,
                relationships: 0,
                followedTeachers: 0
            })
            .lean()
            .exec();
        if (!user) return null;
        const noOfUsNotification: number = _.size(_.filter(user.notifications, notification => !notification.seen));
        const noOfUsMessage: number = 9;         //temporary;
        return {
            ..._.omit(user, ['notifications']),
            noOfUsNotification,
            noOfUsMessage
        };
    }

    async findUserById(userId: string): Promise<any> {
        const user: any = await this.userModel
            .findById(userId)
            .select({
                conversations: 0,
                relationships: 0,
                followedTeachers: 0,
                password: 0
            })
            .lean()
            .exec();
        if (!user) return null;
        const noOfUsNotification: number = _.size(_.filter(user.notifications, notification => !notification.seen));
        const noOfUsMessage: number = 9;         //temporary;
        return {
            ..._.omit(user, ['notifications']),
            noOfUsMessage,
            noOfUsNotification
        };
    }

    async update(userId: string, params: UpdateDto): Promise<any> {
        try {
            const user = await this.userModel
                .findByIdAndUpdate(userId, {
                    ...params
                }, {
                    new: true,
                    runValidators: true
                })
                .select('-conversations -notifications -password -followedTeachers -relationships -catesOfConcern -email');
            return user;
        }
        catch (e) {
            if (e.name === 'MongoError' && e.codeName === 'DuplicateKey')
                throw new ConflictException(e.errmsg);
            else if (e.name === 'ValidationError')
                throw new BadRequestException(e.message);
            throw e;
        }
    }

    async updateCatesOfConcern(userId: string, targetKeys: string[]): Promise<any> {
        try {
            const user = await this.userModel
                .findByIdAndUpdate(userId, {
                    catesOfConcern: targetKeys
                }, {
                    new: true,
                    runValidators: true
                })
                .select('catesOfConcern');
            return user;
        }
        catch (e) {
            if (e.name === 'CastError')
                throw new BadRequestException(e.message);
            throw e;
        }
    }

    async updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<0 | -1 | 1> {
        const user = await this.userModel.findById(userId);
        if (user) {
            const check: boolean = await bcrypt.compare(oldPassword, user.password);
            if (!check) return -1;
            const saltRounds: number = parseInt(this.configService.get<string>('SALT_ROUNDS'));
            const hashedPassword: string = await bcrypt.hash(newPassword, saltRounds);
            user.password = hashedPassword;
            await user.save();
            return 1;
        }
        return 0;
    }

    async updateAvatar(userId: string, avatar: string): Promise<any> {
        return await this.userModel
            .findByIdAndUpdate(userId, {
                avatar
            }, {
                new: true
            })
            .select('avatar');
    }

    async fetchFriends(userId: string, page: number, limit: number): Promise<{ hasMore: boolean, list: IFriend[] }> {
        const user = await this.userModel
            .findById(userId)
            .populate('relationships.friend', 'name avatar relationships')
            .select('relationships')
            .lean()
            .exec();
        const allFriends = _.filter(
            user.relationships,
            ['status', FriendStatuses.Friend]
        );
        const hasMore: boolean = page * limit < allFriends.length;
        const friends: IFriend[] = _.map(
            _.slice(allFriends, (page - 1) * limit, page * limit),
            relationship => {
                const friend = relationship.friend as any;
                const numOfFriends: number = _.size(_.filter(friend.relationships, ['status', FriendStatuses.Friend]));
                return {
                    ..._.omit(friend, ['relationships']),
                    numOfFriends
                } as IFriend;
            }
        );
        return {
            hasMore,
            list: friends
        };
    }

    async allFriends(userId: string, existed: number): Promise<{ hasMore: boolean, list: IFriend[] }> {
        const user = await this.userModel
            .findById(userId)
            .populate('relationships.friend', 'name avatar relationships')
            .select('relationships')
            .lean()
            .exec();
        const allFriends = _.filter(
            user.relationships,
            ['status', FriendStatuses.Friend]
        );
        const remainCount: number = allFriends.length - existed;
        let friends: IFriend[] = [];
        if (remainCount > 0) {
            friends = _.map(
                _.slice(allFriends, existed),
                relationship => {
                    const friend = relationship.friend as any;
                    const numOfFriends: number = _.size(_.filter(friend.relationships, ['status', FriendStatuses.Friend]));
                    return {
                        ..._.omit(friend, ['relationships']),
                        numOfFriends
                    } as IFriend;
                }
            );
        }
        return {
            hasMore: false,
            list: friends
        };
    }

    async fetchFriend(userId: string, friendId: string): Promise<IFriend> {
        const friend = await this.userModel
            .findById(friendId)
            .select('name avatar relationships')
            .lean()
            .exec();

        if (friend) {
            let status: FriendStatuses = FriendStatuses.NoFriend;
            const userRel = _.find(friend.relationships, rel => rel.friend.toString() === userId);
            if (userRel) {
                const _status: FriendStatuses = userRel.status;
                if (_status === FriendStatuses.Friend) status = FriendStatuses.Friend;
                else if (_status === FriendStatuses.SentInvitation) status = FriendStatuses.ReceivedInvitation;
                else status = FriendStatuses.SentInvitation;
            }
            return {
                ..._.omit(friend, ['relationships']),
                status
            };
        }
        return null;
    }

    async fetchFriendsOfFriend(userId: string, friendId: string, page: number, limit: number): Promise<{ status: boolean, data: { hasMore: boolean, list: IFriend[] } }> {
        const friend = await this.userModel
            .findById(friendId)
            .populate('relationships.friend', 'avatar name relationships')
            .select('relationships')
            .lean()
            .exec();
        if (!friend) return { status: false, data: null };
        const allFriends = _.filter(
            friend.relationships,
            ['status', FriendStatuses.Friend]
        );
        const hasMore: boolean = page * limit < _.size(allFriends);
        const friends: IFriend[] = _.map(
            _.slice(allFriends, (page - 1) * limit, page * limit),
            relationship => {
                const friend = relationship.friend as any;
                const numOfFriends: number = _.size(_.filter(friend.relationships, ['status', 4]));
                const yourRel = _.find(friend.relationships, rel => rel.friend._id === userId);
                let status: FriendStatuses = FriendStatuses.NoFriend;
                if (yourRel) {
                    if (yourRel.status === FriendStatuses.Friend) status = FriendStatuses.Friend;
                    else if (yourRel.status === FriendStatuses.SentInvitation) status = FriendStatuses.ReceivedInvitation;
                    else status = FriendStatuses.SentInvitation;
                }
                return {
                    ..._.omit(friend, ['relationships']),
                    numOfFriends,
                    status
                } as IFriend;
            }
        );
        return {
            status: true,
            data: {
                hasMore,
                list: friends
            }
        }
    }

    async allFriendsOfFriend(userId: string, friendId: string, existed: number): Promise<{ status: boolean, data: { hasMore: boolean, list: IFriend[] } }> {
        const friend = await this.userModel
            .findById(friendId)
            .populate('relationships.friend', 'avatar name relationships')
            .select('relationships')
            .lean()
            .exec();
        if (!friend) return { status: false, data: null };
        const allFriends = _.filter(
            friend.relationships,
            ['status', FriendStatuses.Friend]
        );
        const hasMore: boolean = existed < _.size(allFriends);
        const friends: IFriend[] = _.map(
            _.slice(allFriends, existed),
            relationship => {
                const friend = relationship.friend as any;
                const numOfFriends: number = _.size(_.filter(friend.relationships, ['status', 4]));
                const yourRel = _.find(friend.relationships, rel => rel.friend._id === userId);
                let status: FriendStatuses = FriendStatuses.NoFriend;
                if (yourRel) {
                    if (yourRel.status === FriendStatuses.Friend) status = FriendStatuses.Friend;
                    else if (yourRel.status === FriendStatuses.SentInvitation) status = FriendStatuses.ReceivedInvitation;
                    else status = FriendStatuses.SentInvitation;
                }
                return {
                    ..._.omit(friend, ['relationships']),
                    numOfFriends,
                    status
                } as IFriend;
            }
        );
        return {
            status: true,
            data: {
                hasMore,
                list: friends
            }
        };
    }

    async fetchIdAvatarNameById(userId: string): Promise<IUser> {
        const user: any = await this.userModel
            .findById(userId)
            .select({
                _id: 1,
                avatar: 1,
                name: 1
            })
            .lean()
            .exec();
        if (!user)
            return null;
        return user;
    }

    async addFriend(userId: string, friendId: string): Promise<0 | 1 | -1> {
        try {
            const friend = await this.userModel
                .findByIdAndUpdate(friendId, {
                    $push: {
                        relationships: {
                            friend: userId,
                            status: FriendStatuses.ReceivedInvitation
                        }
                    }
                }, {
                    runValidators: true
                });
            if (!friend) return 0;
            await this.userModel.updateOne({
                _id: userId
            }, {
                $push: {
                    relationships: {
                        friend: friendId,
                        status: FriendStatuses.SentInvitation
                    }
                }
            });
            //firebase notification.
            return 1;
        }
        catch (e) {
            return -1;
        }
    }

    async cancelInvitation(userId: string, friendId: string): Promise<0 | 1 | -1> {
        try {
            const friend = await this.userModel
                .findByIdAndUpdate(friendId, {
                    $pull: {
                        relationships: {
                            friend: userId
                        }
                    }
                }, {
                    runValidators: true
                });
            if (!friend) return 0;
            await this.userModel.updateOne({
                _id: userId
            }, {
                $pull: {
                    relationships: {
                        friend: friendId
                    }
                }
            });
            return 1;
        }
        catch (e) {
            return -1;
        }
    }

    async acceptInvitation(userId: string, friendId: string): Promise<0 | 1 | -1> {
        try {
            const friend = await this.userModel
                .findByIdAndUpdate(friendId, {
                    $set: {
                        'relationships.$[element].status': FriendStatuses.Friend
                    }
                }, {
                    runValidators: true,
                    arrayFilters: [{
                        'element.friend': userId
                    }]
                });
            if (!friend) return 0;
            await this.userModel
                .updateOne({ _id: userId }, {
                    $set: {
                        'relationships.$[element].status': FriendStatuses.Friend
                    }
                }, {
                    runValidators: true,
                    arrayFilters: [{
                        'element.friend': friendId
                    }]
                });
            return 1;
        }
        catch (e) {
            return -1;
        }
    }

    async rejectInvitation(userId: string, friendId: string): Promise<0 | 1 | -1> {
        try {
            const friend = await this.userModel
                .findByIdAndUpdate(friendId, {
                    $pull: {
                        relationships: {
                            friend: userId
                        }
                    }
                });
            if (!friend) return 0;
            await this.userModel.updateOne({ _id: userId }, {
                $pull: {
                    relationships: {
                        friend: friendId
                    }
                }
            });
            return 1;
        }
        catch (e) {
            return -1;
        }
    }

    async unfriend(userId: string, friendId: string): Promise<0 | 1 | -1> {
        try {
            const friend = await this.userModel
                .findByIdAndUpdate(friendId, {
                    $pull: {
                        relationships: {
                            friend: userId
                        }
                    }
                });
            if (!friend) return 0;
            await this.userModel.updateOne({ _id: userId }, {
                $pull: {
                    relationships: {
                        friend: friendId
                    }
                }
            });
            return 1;
        }
        catch (e) {
            return -1;
        }
    }

    async followTeacher(userId: string, teacherId: string): Promise<1 | -1> {
        try {
            await this.userModel
                .updateOne({ _id: userId }, {
                    $push: {
                        followedTeachers: teacherId
                    }
                });
            return 1;
        }
        catch (e) {
            return -1;
        }
    }

    async unfollowTeacher(userId: string, teacherId: string): Promise<1 | -1> {
        try {
            await this.userModel
                .updateOne({ _id: userId }, {
                    $pull: {
                        followedTeachers: teacherId
                    }
                });
            return 1;
        }
        catch (e) {
            return -1;
        }
    }
}
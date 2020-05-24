import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { TeacherService } from '@/teacher/teacher.service';
import { Role, SALT } from '../utils/constant';
import { UpdateUserDto, CreateUserDto } from './dto/create-user.dto';
import { IUser } from './interface/user.interface';
@Injectable()
export class UserService {

    constructor(@InjectModel('User') private readonly userModel: Model<IUser>, private readonly teacherService: TeacherService) { }

    async createUser(userDto: CreateUserDto): Promise<IUser> {
        const user = {...userDto};
        const phoneRegistered = await this.userModel.findOne({ phone: user.phone });
        const emailRegistered = await this.userModel.findOne({ email: user.email });
        if (!phoneRegistered && !emailRegistered) {
            user.password = await bcrypt.hash(user.password, SALT);
            user.roles = [Role.User]
            const newUser = new this.userModel(user);
            return await newUser.save()
        } else {
            throw new HttpException('REGISTRATION.USER_ALREADY_REGISTERED', HttpStatus.FORBIDDEN);
        }

    }

    async findUserByPhone(phone: string) {
        return await this.userModel.findOne({ phone }).lean().exec();
    }

    async findUserById(id: string): Promise<IUser> {
        const user = await this.userModel.findById(id).exec();
        return user;
    }

    async getUser(phone: string) {
        const user = await this.findUserByPhone(phone);
        user.password = undefined;
        return user;
    }

    async updateUserById(id: string, user: UpdateUserDto): Promise<IUser> {
        const userFromDB = await this.userModel.findByIdAndUpdate(id, user, { new: true });
        if (!userFromDB)
            throw new HttpException("USER.NOT_FOUND", HttpStatus.NOT_FOUND);
        return userFromDB;
    }

    async updateUserByPhone(phone: string, user: UpdateUserDto): Promise<IUser> {
        const userFromDB = await this.userModel.findOneAndUpdate({ phone }, user, { new: true });
        if (!userFromDB)
            throw new HttpException("USER.NOT_FOUND", HttpStatus.NOT_FOUND);
        return userFromDB;
    }

    async updateUserInfo(phone: string, updateUser: UpdateUserDto): Promise<IUser> {
        const userFromDB = await this.userModel.findOneAndUpdate({ phone }, updateUser, { new: true });
        if (!userFromDB)
            throw new HttpException("USER.NOT_FOUND", HttpStatus.NOT_FOUND);
        return userFromDB;
    }

    async findNotifications(phone: string, page: number, limit: number) {
        const user = await this.findUserByPhone(phone);
        let hasMore = true;
        const notiList = user.notifications;
        const notiRespond = []
        const lowerBound = page * limit;
        const upperBound = lowerBound + limit;
        const notiLength = notiList.length;
        if (lowerBound < 0 || lowerBound > length)
            throw new HttpException("NOTIFICATION.NOT_VALID", HttpStatus.BAD_REQUEST)
        else if (upperBound > notiLength)
            hasMore = false;
        for (let i = lowerBound; i < upperBound; i++) {
            notiRespond.push(notiList[i]);
        }

        const respond = {
            data: notiRespond,
            hasMore: hasMore
        }
        return respond;
    }

    async setNotification(phone: string, notificationId: string) {
        const user = await this.findUserByPhone(phone);
        const notiList = user.notifications;
        const lengthOfNoti = notiList.length;
        for (let i = 0; i < lengthOfNoti; i++) {
            if (notiList[i].id == notificationId) {
                notiList[i].seen = true;
                user.notifications = notiList;
                user.noOfUsNotification--;
                const newUser = new this.userModel(user);
                newUser.save();
                return "SUCCESS";
            }
        }
        throw new HttpException("NOTI.NOT_FOUND", HttpStatus.BAD_REQUEST);

    }

    async setAllNotification(phone: string) {
        const user = await this.findUserByPhone(phone);
        user.noOfUsNotification = 0;
        const notiList = user.notifications;
        notiList.forEach((noti, index) => notiList[index].seen = true);
        const newUser = new  this.userModel(user);
        newUser.save();
        return "SUCCESS";
    }


    async findProfile(myUser: IUser, userId: string) {
        const userFromDB = await this.findUserById(userId);
        let status;
        if (!myUser)
            status = null;
        else if (!myUser.friendIds)
            status = 0
        else if (myUser.friendIds.indexOf(userId) !== -1)
            status = 3;
        else if (myUser.friendRequestIds.indexOf(userId) !== -1)
            status = 2;
        else status = 1;

        const respond = {
            id: userId,
            avatar: userFromDB.avatar,
            name: userFromDB.userName,
            status: status
        }
        return respond;
    }

    async findFriendsOfFriend(myUser: IUser, userId: string) {
        const userFromDB = await this.findUserById(userId);
        let friendIds = userFromDB.friendIds;
        if (friendIds.indexOf(myUser['_id'].toString()) == -1) {
            throw new HttpException("USER.NOT_IS_FRIEND", HttpStatus.BAD_REQUEST)
        }
        const friendsOfFriend = await this.userModel.find({ '_id': { '$in': friendIds, '$ne': myUser['_id'] }, 'friendIds': [userId] }).select('id avatar userName friendIds').lean().exec();
        return friendsOfFriend;
    }

    async findTeacher(user: IUser, teacherId: string) {
        const teacher = await this.teacherService.findProfileTeacher(teacherId);
        const isFollow = user.followIds.indexOf(teacherId) == -1 ? false : true;
        const respond = {
            ...teacher, isFollow
        }
        return respond;
    }

    async setFriendStatus(user: IUser, friendId: string, status: number) {
        const friendFromDB = await this.findUserById(friendId);
        const friendIdsOfFriend = friendFromDB.friendIds;
        const friendRequestIdsOfFriend = friendFromDB.friendRequestIds;
        const friendIdsOfUser = user.friendIds;
        const userIndex = friendIdsOfFriend.indexOf(user['_id'].toString());
        const friendIndex = friendIdsOfUser.indexOf(friendId);
        const errCode = 0;
        switch (status) {
            case 0:
                {
                    if (userIndex > -1)
                        friendIdsOfFriend.splice(userIndex, 1);
                    if (friendIndex > -1)
                        friendIdsOfUser.splice(friendIndex, 1);
                    break;
                }
            case 1:
                {
                    friendRequestIdsOfFriend.push(user['_id'].toString());
                    break;
                }
            case 3:
                {
                    const userIndexOfFriendRequest = friendRequestIdsOfFriend.indexOf(user['_id'].toString());
                    if (userIndexOfFriendRequest > -1)
                        friendRequestIdsOfFriend.splice(userIndexOfFriendRequest, 1);
                    friendIdsOfFriend.push(user['_id'].toString());
                    friendIdsOfUser.push(friendId);
                    break;
                }
        }
        this.updateUserById(user['_id'], user);
        this.updateUserById(friendId, friendFromDB); 
        return "SUCCESS";
    }

    async setFollowTeacher(user: IUser, teacherId: string, status: boolean) {
        if(status == true) {
            user.followIds.push(teacherId);
        }
        else {
            const index = user.followIds.indexOf(teacherId);
            if(index > -1)
                user.followIds.splice(index,1)
        }      
        this.updateUserById(user['_id'], user)
        return "SUCCESS";
    }
}
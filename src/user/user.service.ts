import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { Role, SALT } from '../utils/constant';
import { UpdateUserDto } from './dto/create-user.dto';
import { IUser } from './interface/user.interface';
import * as mongoose from 'mongoose';
import { TeacherService } from 'src/teacher/teacher.service';

@Injectable()
export class UserService {

    constructor(@InjectModel('User') private readonly userModel: Model<IUser>,private readonly teacherService: TeacherService) { }

    async createUser(user: IUser): Promise<IUser> {
        const phoneRegistered = await this.userModel.findOne({ phone: user.phone });
        const emailRegistered = await this.userModel.findOne({ email: user.email });

        if (!phoneRegistered && !emailRegistered) {
            user.password = await bcrypt.hash(user.password, SALT);
            user.roles = [Role.User]
            const newUser = this.userModel(user);
            return await newUser.save()
        } else {
            throw new HttpException('REGISTRATION.USER_ALREADY_REGISTERED', HttpStatus.FORBIDDEN);
        }

    }

    async findUserByPhone(phone: string): Promise<IUser> {
        return await this.userModel.findOne({ phone }).lean().exec();
    }

    async findUserById(id: string): Promise<IUser> {
        const user = await this.userModel.findById(id).lean().exec();
        return user;
    }

    async getUser(phone: string): Promise<IUser> {
        const user = await this.findUserByPhone(phone);
        user.password = undefined;
        return user;
    }

    async updateUserById(id: string, user: IUser): Promise<IUser> {
        const userFromDB = await this.userModel.findByIdAndUpdate(id, user, { new: true });
        if (!userFromDB)
            throw new HttpException("USER.NOT_FOUND", HttpStatus.NOT_FOUND);
        return userFromDB;
    }

    async updateUserByPhone(phone: string, user: IUser): Promise<IUser> {
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
                const newUser = this.userModel(user);
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
        const newUser = this.userModel(user);
        newUser.save();
        return "SUCCESS";
    }


    async findProfile(myUser: IUser, userId: string) {
        const userFromDB = await this.findUserById(userId);
        let status ;
        if(!myUser) 
            status = null;
        else if(!myUser.friendIds)
            status = 0
        else if(myUser.friendIds.indexOf(userId) !== -1)
            status = 3;
        else if(myUser.friendRequestIds.indexOf(userId) !== -1)
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

    async findFriendsOfFriend(myUser: IUser, userId: string ) {
        const userFromDB = await this.findUserById(userId);
        let friendIds = userFromDB.friendIds;
        console.log(typeof(friendIds[0]))
        console.log(myUser.id)
        console.log(friendIds.indexOf(myUser['_id']))
        if(friendIds.indexOf(myUser['_id']) == -1) {
            throw new HttpException("USER.NOT_IS_FRIEND", HttpStatus.BAD_REQUEST)
        }
        const friendsOfFriend = await this.userModel.find({'_id':{'$in': friendIds}, 'friendIds': mongoose.Types.ObjectId(userId)}).select('id avatar userName friendIds').lean().exec();
        return friendsOfFriend;
    }

    async findTeacher(user: IUser, teacherId: string) {
        const teacher = await this.teacherService.findProfileTeacher(teacherId);
        const isFollow = user.followIds.indexOf(teacherId) == -1 ? false : true;
        const respond = {
            name:  teacher.name,
            phone: teacher.phone,
            isFollow: isFollow,
        }
        return respond;
    }
}
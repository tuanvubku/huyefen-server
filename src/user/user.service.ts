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

@Injectable()
export class UserService {

    constructor(
        @InjectModel('User') private readonly userModel: Model<IUser>,
        private readonly configService: ConfigService,
        private readonly teacherService: TeacherService
    ) {}

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
        const user: any =  await this.userModel
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
            const user =  await this.userModel
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
}
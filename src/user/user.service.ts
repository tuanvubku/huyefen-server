import { Model } from 'mongoose';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { IUser } from './interface/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Role, SALT } from '../utils/constant';

@Injectable()
export class UserService {

    constructor(@InjectModel('User') private readonly userModel: Model<IUser>) { }

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


    async findUserFromDB(phone: string): Promise<IUser> {
        return await this.userModel.findOne({phone});
    }

    async getUser(phone: string): Promise<IUser> {
        const user = await this.findUserFromDB(phone);
        user.password = undefined;
        return user;
    }
}
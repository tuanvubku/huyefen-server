import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { Role, SALT } from '../utils/constant';
import { UpdateUserDto } from './dto/create-user.dto';
import { IUser } from './interface/user.interface';

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

    async findUserByPhone(phone: string): Promise<IUser> {
        return await this.userModel.findOne({ phone }).lean().exec();
    }

    async findUserById(id: string): Promise<IUser> {
        const user =  await this.userModel.findById(id).lean().exec();
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


}
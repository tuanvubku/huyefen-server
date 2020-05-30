import { Injectable, Inject, HttpStatus, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as _ from 'lodash';
import * as bcrypt from 'bcryptjs';
import { UpdateDto } from './dtos/update.dto'
import { ITeacher } from './interfaces/teacher.interface';
import { Role } from '@/config/constants';
import { UpdateSocialsDto } from './dtos/socials.dto';

@Injectable()
export class TeacherService {
    constructor (
        @InjectModel('Teacher') private readonly teacherModel: Model<ITeacher>,
        private readonly configService: ConfigService
    ) {}

    async create(body): Promise<ITeacher> {
        const saltRounds = parseInt(this.configService.get<string>('SALT_ROUNDS'));
        body.password = await bcrypt.hash(body.password, saltRounds);
        const teacher: ITeacher = new this.teacherModel({
            ...body
        });
        return await teacher.save();
    }

    async findTeacherByPhone(phone: string): Promise<any> {
        const teacher: any =  await this.teacherModel
                .findOne({ phone })
                .select({
                    followingStudents: 0
                })
                .lean()
                .exec();
        if (!teacher) return null;
        const noOfUsNotification: number = _.size(_.filter(teacher.notifications, notification => !notification.seen));
        return {
            ..._.omit(teacher, ['notifications']),
            noOfUsNotification
        };
    }

    async findTeacherById(teacherId: string): Promise<any> {
        const teacher: any = await this.teacherModel
                .findById(teacherId)
                .select({
                    followingStudents: 0,
                    password: 0
                })
                .lean()
                .exec();
        if (!teacher) return null;
        const noOfUsNotification: number = _.size(_.filter(teacher.notifications, notification => !notification.seen));
        return {
            ..._.omit(teacher, ['notifications']),
            noOfUsNotification
        };
    }

    async update(teacherId: string, params: UpdateDto): Promise<any> {
        try {
            const teacher = await this.teacherModel
                    .findByIdAndUpdate(teacherId, {
                        ...params
                    }, {
                        new: true,
                        runValidators: true
                    })
                    .select('phone name email biography headline');
            return teacher;
        }
        catch (e) {
            if (e.name === 'MongoError' && e.codeName === 'DuplicateKey')
                throw new ConflictException(e.errmsg);
            else if (e.name === 'ValidationError')
                throw new BadRequestException(e.message);
            throw e; 
        }
    }

    async updateSocials(teacherId: string, params: UpdateSocialsDto): Promise<any> {
        return await this.teacherModel
            .findByIdAndUpdate(teacherId, {
                ...params
            }, {
                new: true,
                runValidators: true
            })
            .select('twitter facebook youtube instagram');
    }

    async updateAvatar(teacherId: string, avatar: string): Promise<any> {
        return await this.teacherModel
                .findByIdAndUpdate(teacherId, {
                    avatar
                }, {
                    new: true
                })
                .select('avatar');
    }

    async updatePassword(teacherId: string, oldPassword: string, newPassword: string): Promise<0 | -1 | 1> {
        const teacher = await this.teacherModel.findById(teacherId);
        if (teacher) {
            const check: boolean = await bcrypt.compare(oldPassword, teacher.password);
            if (!check) return -1;
            const saltRounds: number = parseInt(this.configService.get<string>('SALT_ROUNDS'));
            const hashedPassword: string = await bcrypt.hash(newPassword, saltRounds);
            teacher.password = hashedPassword;
            await teacher.save();
            return 1;
        }
        return 0;
    }
}

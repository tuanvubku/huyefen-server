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
import { AuthorService } from '@/author/author.service';
import { UserService } from '@/user/user.service';

@Injectable()
export class TeacherService {
    constructor(
        @InjectModel('Teacher') private readonly teacherModel: Model<ITeacher>,
        private readonly authorService: AuthorService,
        private readonly userService: UserService,
        private readonly configService: ConfigService
    ) { }

    async create(body): Promise<ITeacher> {
        const saltRounds = parseInt(this.configService.get<string>('SALT_ROUNDS'));
        body.password = await bcrypt.hash(body.password, saltRounds);
        const teacher: ITeacher = new this.teacherModel({
            ...body
        });
        return await teacher.save();
    }

    async findTeacherByPhone(phone: string): Promise<any> {
        const teacher: any = await this.teacherModel
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

    async findTeacherByEmail(email: string): Promise<ITeacher> {
        const teacher = await this.teacherModel
            .findOne({ email })
        if (!teacher)
            return null;
        return teacher;
    }
    async fetchIdAvatarNameById(teacherId: string): Promise<ITeacher> {
        const teacher: any = await this.teacherModel
            .findById(teacherId)
            .select({
                _id: 1,
                avatar: 1,
                name: 1
            })
            .lean()
            .exec();
        if (!teacher)
            return null;
        return teacher;
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

    async fetchTeacher(userId: string, teacherId: string): Promise<any> {
        const teacher = await this.teacherModel
            .findById(teacherId, {
                followingStudents: {
                    $elemMatch: userId
                }
            })
            .select('name avatar biography twitter facebook youtube instagram followingStudents')
            .lean()
            .exec();
        if (teacher) {
            const isFollowed: boolean = !_.isEmpty(teacher.followingStudents);
            //count numOfStudents, numOfCourses, numOfReviews.
            const teacherCourses: string[] = await this.authorService.fetchCoursesOfTeacher(teacherId);
            const numOfCourses: number = _.size(teacherCourses);
            //use teacherCourses to find numOfStudents.
            return {
                ..._.omit(teacher, ['followingStudents']),
                isFollowed,
                numOfStudents: 21400,
                numOfCourses,
                numOfReviews: 12099
            };
        }
        return null;
    }

    async follow(userId: string, teacherId: string): Promise<0 | 1 | -1> {
        try {
            const teacher: ITeacher = await this.teacherModel
                .findByIdAndUpdate(teacherId, {
                    $push: {
                        followingStudents: userId
                    }
                }, {
                    runValidators: true
                });
            if (!teacher) return 0;
            const status: 1 | -1 = await this.userService.followTeacher(userId, teacherId);
            if (status === 1) {

            }
            //firebase;
            return status;
        }
        catch (e) {
            return -1;
        }
    }

    async unfollow(userId: string, teacherId: string): Promise<0 | 1 | -1> {
        try {
            const teacher: ITeacher = await this.teacherModel
                .findByIdAndUpdate(teacherId, {
                    $pull: {
                        followingStudents: userId
                    }
                });
            if (!teacher) return 0;
            return await this.userService.unfollowTeacher(userId, teacherId);
        }
        catch (e) {
            return -1;
        }
    }

    async updateNotification(teacherId: string, notification: any): Promise<{ status: Boolean }> {
        const teacher: ITeacher = await this.teacherModel
            .findByIdAndUpdate(teacherId, {
                $push: {
                    notifications: notification
                }
            })
        if (!teacher)
            return { status: false };
        return { status: true };
    }
}

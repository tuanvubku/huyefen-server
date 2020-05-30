import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import * as _ from 'lodash';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { ITeacher } from './interface/teacher.interface';
import { Role } from '@/config/constants';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { ConfigService } from '@nestjs/config';

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
    // async createTeacher(teacherDto: CreateTeacherDto): Promise<ITeacher> {
    //     const teacher = { ...teacherDto };
    //     const teacherFromDB = await this.teacherModel.findOne({ phone: teacher.phone });
    //     if (!teacherFromDB) {
    //         teacher.password = await bcrypt.hash(teacher.password, 10);
    //         teacher.roles = [Role.Teacher];
    //         const newTeacher = new this.teacherModel(teacher);
    //         return await newTeacher.save()
    //     } else {
    //         throw new HttpException('REGISTRATION.TEACHER_ALREADY_REGISTERED', HttpStatus.FORBIDDEN);
    //     }
    // }

    // async findTeacherByPhone(phone: string): Promise<ITeacher> {
    //     return await this.teacherModel.findOne({ phone }).lean();
    // }

    // async findTeacherById(id: string): Promise<ITeacher> {
    //     return await this.teacherModel.findById(id).lean();
    // }

    // async updateTeacher(phone: string, updateTacher: UpdateTeacherDto): Promise<ITeacher> {
    //     const teacherFromDB = await this.teacherModel.findOneAndUpdate({ phone }, updateTacher, { new: true });
    //     if (!teacherFromDB)
    //         throw new HttpException("TEACHER.NOT_FOUND", HttpStatus.NOT_FOUND);
    //     return teacherFromDB;
    // }

    // async findProfileTeacher(teacherId: string): Promise<any> {
    //     const teacherFromDB = await this.teacherModel.findById(teacherId).select('_id name avatar numOfCourses numOfStudents numOfReviews biography twitter facebook youtube instagram').lean().exec();
    //     return teacherFromDB;
    // }
}

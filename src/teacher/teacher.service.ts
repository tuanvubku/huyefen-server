import { Injectable, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { ITeacher } from './interface/teacher.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { SALT, Role } from 'src/utils/constant';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeacherService {
    constructor(@InjectModel('Teacher') private readonly teacherModel: Model<ITeacher> ) {}
    
    async createTeacher(teacher: ITeacher): Promise<ITeacher> {
        const teacherFromDB = await this.teacherModel.findOne({phone: teacher.phone});
        if(!teacherFromDB) {
            teacher.password = await bcrypt.hash(teacher.password, SALT);
            teacher.roles = [Role.Teacher];
            const newTeacher = this.teacherModel(teacher);
            return await newTeacher.save()
        } else {
            throw new HttpException('REGISTRATION.TEACHER_ALREADY_REGISTERED', HttpStatus.FORBIDDEN);
        }
    }

    async findTeacherByPhone(phone: string): Promise<ITeacher> {
        return await this.teacherModel.findOne({phone}).lean().exec();
    }

    async findTeacherById(id: string): Promise<ITeacher> {
        return await this.teacherModel.findById(id).lean().exec();
    }

    async updateTeacher(phone: string,updateTacher: UpdateTeacherDto): Promise<ITeacher> {
        const teacherFromDB = await this.teacherModel.findOneAndUpdate({phone}, updateTacher, {new: true});
        if (!teacherFromDB)
            throw new HttpException("TEACHER.NOT_FOUND", HttpStatus.NOT_FOUND);
        return teacherFromDB;
    }

    async findProfileTeacher(teacherId: string): Promise<ITeacher> {
        const teacherFromDB = await this.teacherModel.findById(teacherId).select('name phone').lean().exec();
        return teacherFromDB;
    }
}

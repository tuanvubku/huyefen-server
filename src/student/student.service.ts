import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IStudent } from './interfaces/student.interface';

@Injectable()
export class StudentService {
    constructor (
        @InjectModel('Student') private readonly studentModel: Model<IStudent>
    ) {}

    async createTest(userId: string, courseId: string): Promise<IStudent> {
        const student: IStudent = new this.studentModel({
            course: courseId,
            user: userId
        });
        return await student.save();
    }

    async validateUserCourse(userId: string, courseId: string): Promise<boolean> {
        const student: IStudent = await this.studentModel
            .findOne({
                user: userId,
                course: courseId
            });
        return !!student;
    }

    async createMany(userId, courseIds: string[]): Promise<void> {
        const studentItems = courseIds.map(courseId => {
            return new this.studentModel({
                course: courseId,
                user: userId
            });
        });
        await this.studentModel.insertMany(studentItems);
    }
}

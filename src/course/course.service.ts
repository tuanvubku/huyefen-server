import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dtos/create-course.dto';
import { ICourse } from './interfaces/course.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CourseService {

    constructor(@InjectModel('Course') private readonly courseModel: Model<ICourse>) { }

    async createCourse(course: CreateCourseDto): Promise<ICourse> {
        return await this.courseModel.create(course);
    }

    async findAllCourses(): Promise<ICourse[]> {
        return await this.courseModel.find();
    }

    async findCourseById(courseId: string): Promise<ICourse> {
        return await this.courseModel.findById(courseId);
    }
}

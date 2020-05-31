import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICourse } from './interfaces/course.interface';

@Injectable()
export class CourseService {
    constructor(
        @InjectModel('Course') private readonly courseModel: Model<ICourse>
    ) {}

    async create(teacherId: string, area: string, title: string): Promise<ICourse> {
        return null;
    }
}

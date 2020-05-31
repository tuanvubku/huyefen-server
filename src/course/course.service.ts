import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICourse } from './interfaces/course.interface';
import { IAuthor } from './interfaces/author.interface';

@Injectable()
export class CourseService {
    constructor(
        @InjectModel('Course') private readonly courseModel: Model<ICourse>,
        @InjectModel('Author') private readonly authorModel: Model<IAuthor>
    ) {}

    async create(teacherId: string, area: string, title: string): Promise<ICourse> {
        let course: ICourse = new this.courseModel({
            area,
            title
        });
        course = await course.save();
        const courseId: string = course._id;
        const author: IAuthor = new this.authorModel({
            teacher: teacherId,
            course: courseId,
            isOnwer: true,
            permission: {
                announcement: true,
                review: true,
                privacy: true,
                messenger: true,
                invite: true
            }
        });
        await author.save();
        return course;
    }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as _ from 'lodash';
import { IAuthor } from './interfaces/author.interface';
import { TeacherCoursesSort as Sort } from '@/config/constants';

@Injectable()
export class AuthorService {
    constructor (
        @InjectModel('Author') private readonly authorModel: Model<IAuthor>
    ) {}

    async create(teacherId: string, courseId: string): Promise<void> {
        const author: IAuthor = new this.authorModel({
            teacher: teacherId,
            course: courseId,
            isOwner: true,
            permission: {
                announcement: true,
                review: true,
                privacy: true,
                messenger: true,
                invite: true
            }
        });
        await author.save();
    }

    async fetchCoursesOfTeacher(teacherId: string): Promise<Array<string>> {
        const authorsData: IAuthor[] = await this.authorModel
            .find({ teacher: teacherId });
        return _.map(authorsData, 'course');
    }

    async validateTeacherCourse(teacherId: string, courseId: string): Promise<boolean> {
        const author: IAuthor = await this.authorModel
            .findOne({
                teacher: teacherId,
                course: courseId
            });
        return !!author;
    }

    async fetchWithTimeSortType(teacherId: string, sort: Sort.Newest | Sort.Oldest): Promise<any> {
        return await this.authorModel
            .find({ teacher: teacherId })
            .sort({
                createdAt: (sort === Sort.Newest) ? -1 : 1
            })
            .populate('course', 'title lastUpdated privacy progress')
            .lean()
            .exec();
    }

    async fetchWithoutTimeSortType(teacherId: string): Promise<any> {
        return await this.authorModel
            .find({ teacher: teacherId })
            .populate({
                path: 'course', 
                select: 'title lastUpdated privacy progress',
            })
            .lean()
            .exec();
    }
}

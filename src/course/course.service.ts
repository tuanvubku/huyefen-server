import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as _ from 'lodash';
import { ICourse } from './interfaces/course.interface';
import { IAuthor } from './interfaces/author.interface';
import { TeacherCoursesSort as Sort, ProgressBase } from '@/config/constants';

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
        return course;
    }

    async fetch(teacherId: string, sort: Sort, page: number, limit: number): Promise<Array<any>> {
        let authors: Array<any>;
        if (sort === Sort.Newest || sort === Sort.Oldest) {
            authors = await this.authorModel
                .find({ teacher: teacherId })
                .sort({
                    createdAt: (sort === Sort.Newest) ? -1 : 1
                })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('course', 'title lastUpdated privacy progress');
        }
        else {
            authors = await this.authorModel
                .find({ teacher: teacherId })
                .populate({
                    path: 'course', 
                    select: 'title lastUpdated privacy progress',
                });
            authors = _.slice(
                _.orderBy(
                    authors,
                    ['course.title', 'createdAt'],
                    [(sort === Sort.AtoZ) ? 'asc' : 'desc', 'desc']
                ),
                (page - 1) * limit,
                page * limit
            );
        }
        const courses = _.map(authors, item => {
            const course = item.course;
            const progress: number = 
                + (course.progress.goals * ProgressBase.Goals)
                + (course.progress.syllabus * ProgressBase.Syllabus)
                + (course.progress.landing * ProgressBase.Landing)
                + (course.progress.price * ProgressBase.Price)
                + (course.progress.messages * ProgressBase.Messages)
            course.progress = progress;
            return course;
        });
        return courses;
    }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as _ from 'lodash';
import { ICourse } from './interfaces/course.interface';
import { IAuthor } from './interfaces/author.interface';
import { TeacherCoursesSort as Sort, ProgressBase } from '@/config/constants';
import { IChapter } from '@/chapter/interfaces/chapter.interface';
import { UpdateWhatLearnsDto } from './dtos/whatLearns.dto';
import { IWhatLearn } from './interfaces/whatLearn.interface';

@Injectable()
export class CourseService {
    constructor(
        @InjectModel('Course') private readonly courseModel: Model<ICourse>,
        @InjectModel('Author') private readonly authorModel: Model<IAuthor>,
        @InjectModel('Chapter') private readonly chapterModel: Model<IChapter>
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

    async validateCourse(courseId: string): Promise<boolean> {
        const course: ICourse = await this.courseModel
                .findById(courseId);
        return !!course;
    }

    async validateTeacherCourse(teacherId: string, courseId: string): Promise<boolean> {
        const author: IAuthor = await this.authorModel
                .findOne({
                    teacher: teacherId,
                    course: courseId
                });
        return !!author;
    }

    async fetchInfo(courseId: string): Promise<any> {
        let info: any = await this.courseModel
                .findById(courseId)
                .select('title privacy progress')
                .lean()
                .exec();
        if (info) {
            let completeStatus = {};
            _.forEach(_.keys(info.progress), key => {
                completeStatus = {
                    ...completeStatus,
                    [key]: info.progress[key] === 100
                }
            });
            info = _.omit(info, ['progress']);
            const chapters = await this.chapterModel
                    .find({ course: courseId })
                    .select({
                        title: 1,
                        'lectures.type': 1,
                        'lectures.title': 1
                    });
            return {
                ...info,
                completeStatus,
                chapters
            };
        }
        return null;
    }

    async fetchGoals(courseId: string): Promise<any> {
        return await this.courseModel 
            .findById(courseId)
            .select({
                whatLearns: 1,
                requirements: 1,
                targetStudents: 1
            });
    }

    async updateWhatLearns(teacherId: string, courseId: string, change: UpdateWhatLearnsDto): Promise<IWhatLearn[]> {
        const { add: addArr, delete: deleteArr, update: updateObj } = change;
        let course: ICourse = await this.courseModel.findById(courseId);
        if (course) {
            const addWhatLearns = _.map(addArr, content => ({
                content: content,
                owner: teacherId
            }));
            course.whatLearns = _.concat(
                _.map(
                    _.filter(
                        course.whatLearns,
                        (item: IWhatLearn) => _.indexOf(deleteArr, item._id.toString()) === -1
                    ),
                    (item: IWhatLearn) => {
                        if (updateObj[item._id])
                            item.content = updateObj[item._id];
                        return item;
                    }
                ),
                addWhatLearns as IWhatLearn[]
            );
            course = await course.save();
            return course.whatLearns;
        }
        return null;
        
        // const course = await this.courseModel
        //         .findByIdAndUpdate(courseId, {
                    
        //             $push: {
        //                 whatLearns: {
        //                     $each: (addWhatLearns as IWhatLearn[])
        //                 }
        //             }
        //         }, {
        //             new: true,
        //             runValidators: true
        //         });
        // return course ? course.whatLearns : null;
    }
}

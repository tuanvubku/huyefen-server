import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as _ from 'lodash';
import { ICourse } from './interfaces/course.interface';
import { TeacherCoursesSort as Sort, ProgressBase, Lecture, Price } from '@/config/constants';
import { UpdateGoalsDto } from './dtos/goals.dto';
import { IWhatLearn } from './interfaces/whatLearn.interface';
import { IChapter } from '@/chapter/interfaces/chapter.interface';
import { IRequirement } from './interfaces/requirement.interface';
import { ITargetStudent } from './interfaces/targetStudent.interface';
import { ChapterService } from '@/chapter/chapter.service';
import { ILecture } from '@/chapter/interfaces/lecture.interface';
import { UpdateLandingDto } from './dtos/landing.dto';
import { IAuthor } from '@/author/interfaces/author.interface';
import { AuthorService } from '@/author/author.service';

type IGoals = IWhatLearn | IRequirement | ITargetStudent;
type GoalFields = 'whatLearns' | 'requirements' | 'targetStudents';


@Injectable()
export class CourseService {
    constructor(
        @InjectModel('Course') private readonly courseModel: Model<ICourse>,
        private readonly authorService: AuthorService,
        private readonly chapterService: ChapterService
    ) {}

    async create(teacherId: string, area: string, title: string): Promise<ICourse> {
        let course: ICourse = new this.courseModel({
            area,
            title
        });
        course = await course.save();
        const courseId: string = course._id;
        await this.authorService.create(teacherId, courseId);
        return course;
    }

    async fetch(teacherId: string, sort: Sort, page: number, limit: number): Promise<{ total: number, list: Array<any> }> {
        let authors: Array<any>;
        if (sort === Sort.Newest || sort === Sort.Oldest) {
            authors = await this.authorService.fetchWithTimeSortType(teacherId, sort);
        }
        else {
            authors = await this.authorService.fetchWithoutTimeSortType(teacherId);
            authors = _.orderBy(
                authors,
                ['course.title', 'createdAt'],
                [(sort === Sort.AtoZ) ? 'asc' : 'desc', 'desc']
            );
        }
        const total: number = _.size(authors);
        authors = _.slice(
            authors,
            (page - 1) * limit,
            page * limit
        );
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
        return {
            total,
            list: courses
        };
    }

    async validateCourse(courseId: string): Promise<boolean> {
        const course: ICourse = await this.courseModel
                .findById(courseId);
        return !!course;
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
            const chapters = await this.chapterService.fetchChapters(courseId);
            return {
                ...info,
                completeStatus,
                syllabus: chapters
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
                targetStudents: 1,
                _id: 0
            })
            .populate('whatLearns.owner requirements.owner targetStudents.owner', 'name avatar');
    }

    async finalGoals(course: ICourse, field: GoalFields): Promise<{ progress: number, data: IGoals[] }> {
        let count: number = 0;
        if (!_.isEmpty(course.whatLearns)) count++;
        if (!_.isEmpty(course.requirements)) count++;
        if (!_.isEmpty(course.targetStudents)) count++;
        course.progress.goals = (count * 100) / 3;
        await course.save();
        return {
            progress: (count * 100) / 3,
            data: course[field]
        };
    }

    async updateWhatLearns(teacherId: string, courseId: string, change: UpdateGoalsDto): Promise<{ progress: number, data: IWhatLearn[] }> {
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
            await course.save();
            course = await this.courseModel.findById(courseId).populate('whatLearns.owner', 'name avatar');
            return await this.finalGoals(course, 'whatLearns');
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

    async updateRequirements(teacherId: string, courseId: string, change: UpdateGoalsDto): Promise<{ progress: number, data: IRequirement[] }> {
        const { add: addArr, delete: deleteArr, update: updateObj } = change;
        let course: ICourse = await this.courseModel.findById(courseId);
        if (course) {
            const addRequirements = _.map(addArr, content => ({
                content: content,
                owner: teacherId
            }));
            course.requirements = _.concat(
                _.map(
                    _.filter(
                        course.requirements,
                        (item: IRequirement) => _.indexOf(deleteArr, item._id.toString()) === -1
                    ),
                    (item: IRequirement) => {
                        if (updateObj[item._id])
                            item.content = updateObj[item._id];
                        return item;
                    }
                ),
                addRequirements as IRequirement[]
            );
            await course.save();
            course = await this.courseModel.findById(courseId).populate('requirements.owner', 'name avatar');
            return await this.finalGoals(course, 'requirements');
        }
        return null;
    }

    async updateTargetStudents(teacherId: string, courseId: string, change: UpdateGoalsDto): Promise<{ progress: number, data: ITargetStudent[] }> {
        const { add: addArr, delete: deleteArr, update: updateObj } = change;
        let course: ICourse = await this.courseModel.findById(courseId);
        if (course) {
            const addTargetStudents = _.map(addArr, content => ({
                content: content,
                owner: teacherId
            }));
            course.targetStudents = _.concat(
                _.map(
                    _.filter(
                        course.targetStudents,
                        (item: ITargetStudent) => _.indexOf(deleteArr, item._id.toString()) === -1
                    ),
                    (item: ITargetStudent) => {
                        if (updateObj[item._id])
                            item.content = updateObj[item._id];
                        return item;
                    }
                ),
                addTargetStudents as ITargetStudent[]
            );
            await course.save();
            course = await this.courseModel.findById(courseId).populate('targetStudents.owner', 'name avatar');
            return await this.finalGoals(course, 'targetStudents');
        }
        return null;
    }

    async saveSyllabusProgress(courseId: string, progress: number): Promise<void> {
        await this.courseModel
            .updateOne({ _id: courseId }, {
                $set: {
                    'progress.syllabus': progress
                }
            });
    }

    async createChapter(teacherId: string, courseId: string, title: string, description: string): Promise<{ progress: number, data: IChapter}> {
        const data: { progress: number, data: IChapter } = await this.chapterService.create(teacherId, courseId, title, description);
        await this.saveSyllabusProgress(courseId, data.progress);
        return data;
    }

    async deleteChapter(courseId: string, chapterId: string): Promise<{ status: boolean, data: { progress: number, data: string } }> {
        const data: { status: boolean, progress: number } = await this.chapterService.delete(courseId, chapterId);
        if (!data.status) return { status: false, data: null };
        await this.saveSyllabusProgress(courseId, data.progress);
        return {
            status: true,
            data: {
                progress: data.progress,
                data: 'OK'
            }
        }
    }

    async createLecture (
        teacherId: string,
        courseId: string,
        chapterId: string,
        title: string,
        type: Lecture
    ): Promise<{ status: boolean, data: ILecture }> {
        const data: {
            status: boolean,
            data: ILecture
        } = await this.chapterService.createLecture(teacherId, courseId, chapterId, title, type);
        if (data.status) await this.saveSyllabusProgress(courseId, 100);
        return data;
    }

    async deleteLecture (
        courseId: string,
        chapterId: string,
        lectureId: string
    ): Promise<{ status: boolean, data: { progress: number, data: string } }> {
        const { status, progress } = await this.chapterService.deleteLecture(courseId, chapterId, lectureId);
        if (!status) return { status, data: null };
        await this.saveSyllabusProgress(courseId, progress);
        return {
            status,
            data: {
                progress,
                data: 'ok'
            }
        };
    }

    async fetchLanding(courseId: string): Promise<any> {
        const landing = await this.courseModel
            .findById(courseId)
            .select({
                title: 1,
                subTitle: 1,
                description: 1,
                language: 1,
                level: 1,
                area: 1,
                category: 1,
                primaryTopic: 1,
                topics: 1,
                avatar: 1
            })
            .populate('topics');
        if (landing) {
            //find topic for courseId
        }
        return landing;
    }

    async finalLanding(course: ICourse, fields: Array<string>): Promise<{ status: boolean, data: { progress: number, data: any } }> {
        let count: number = 0;
        if (course.title) count++;
        if (course.subTitle) count++;
        if (course.description) count++;
        if (course.language) count++;
        if (course.level) count++;
        if (course.area) count++;
        if (course.category) count++;
        if (!_.isEmpty(course.topics)) count++;
        if (course.primaryTopic) count++;
        if (course.avatar) count++;
        course.progress.landing = count * 10;
        const final = await course.save();
        return {
            status: true,
            data: {
                progress: count * 10,
                data: _.pick(final, fields)
            }
        }
    }

    async updateLanding(courseId: string, params: UpdateLandingDto): Promise<{ status: boolean, data: { progress: number, data: any } }> {
        const course: ICourse = await this.courseModel
            .findByIdAndUpdate(courseId, {
                $set: params as ICourse
            }, {
                new: true,
                runValidators: true
            })
            .populate('topics');
        if (!course) return { status: false, data: null };
        return await this.finalLanding(course, ['title', 'subTitle', 'description', 'language', 'level', 'area', 'category', 'topics', 'primaryTopic']);
    }

    async updateAvatar(courseId: string, url: string): Promise<{ status: boolean, data: { progress: number, data: any } }> {
        const course: ICourse = await this.courseModel
            .findByIdAndUpdate(courseId, {
                $set: {
                    avatar: url
                }
            }, {
                new: true,
                runValidators: true
            });
        if (!course) return { status: false, data: null };
        return await this.finalLanding(course, ['avatar']);
    }

    async fetchPrice(courseId: string): Promise<Price> {
        const course: ICourse = await this.courseModel
            .findById(courseId);
        return course ? course.price : null;
    }

    async updatePrice(courseId: string, price: Price): Promise<{ status: boolean, data: { progress: number, data: Price } }> {
        const course: ICourse = await this.courseModel
            .findByIdAndUpdate(courseId, {
                price
            }, {
                new: true,
                runValidators: true
            });
        if (!course) return { status: false, data: null };
        const progress: number = course.price ? 100 : 0;
        course.progress.price = progress;
        await course.save();
        return {
            status: true,
            data: {
                progress,
                data: course.price
            }
        }
    }

    async fetchMessages(courseId: string): Promise<any> {
        const course: ICourse = await this.courseModel
            .findById(courseId);
        return course ? course.messages : null;
    }

    async updateMessages(courseId: string, welcome: string, congratulation: string): Promise<{ status: boolean, data: { progress: number, data: any } }> {
        const course: ICourse = await this.courseModel
            .findByIdAndUpdate(courseId, {
                $set: {
                    messages: {
                        welcome,
                        congratulation
                    }
                }
            }, {
                new: true,
                runValidators: true
            });
        if (!course) return { status: false, data: null };
        let count: number = 0;
        if (course.messages.welcome) count++;
        if (course.messages.congratulation) count++;
        course.progress.messages = (count * 100) / 2;
        await course.save();
        return {
            status: true,
            data: {
                progress: (count * 100) / 2,
                data: course.messages
            }
        }
    }
}
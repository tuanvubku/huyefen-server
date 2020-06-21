import { Permission, TeacherCoursesSort as Sort } from '@/config/constants';
import { ITeacher } from '@/teacher/interfaces/teacher.interface';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { Model } from 'mongoose';
import { IAuthor } from './interfaces/author.interface';

@Injectable()
export class AuthorService {
    constructor(
        @InjectModel('Author') private readonly authorModel: Model<IAuthor>
    ) { }

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

    async checkPermission(teacherId: string, courseId: string, typePermission: Permission): Promise<Boolean> {
        const author: IAuthor = await this.authorModel
            .findOne({
                teacher: teacherId,
                course: courseId
            });
        if (!author) return null;
        const isOwner = author.isOwner;
        let permission = false;
        switch (typePermission) {
            case Permission.Announcement:
                permission = author.permission.announcement;
                break;
            case Permission.Invite:
                permission = author.permission.invite;
                break;
            case Permission.Messenger:
                permission = author.permission.messenger;
                break;
            default:
                permission = false;
                break;
        }
        return isOwner || permission;
    }

    async updatePermission(courseId: string, permissionList: Object): Promise<boolean> {
        await Promise.all(_.map(_.keys(permissionList), async memberId => {
            await this.authorModel
                .findByIdAndUpdate(memberId, {
                    $set: {
                        permission: permissionList[memberId]
                    }
                });
            })
        );
        return true;
    }

    async deleteAuthor(teacherId: string, courseId: string): Promise<{ status: Boolean }> {
        const { deletedCount } = await this.authorModel
            .deleteOne({
                teacher: teacherId,
                course: courseId
            });
        if (deletedCount == 0)
            return { status: false };
        return { status: true };
    }

    async fetchAllAuthors(courseId: string): Promise<any> {
        const allAuthors = await this.authorModel
            .find({ course: courseId })
            .populate('teacher', '-_id name avatar')
            .select('-course')
            .lean()
            .exec();
        return _.map(allAuthors, author => ({
            ..._.omit(author, ['teacher']),
            name: (author.teacher as any).name,
            avatar: (author.teacher as any).avatar
        }))
    }

    async fetchPermission(teacherId: string, courseId: string, type: string): Promise<any> {
        const author: IAuthor = await this.authorModel
            .findOne({
                teacher: teacherId,
                course: courseId
            });
        const isOwner = author.isOwner;
        if (type === 'settings') {
            return {
                privacy: isOwner ? 2 : author.permission['privacy'] ? 1 : 0,
                members: isOwner ? 2 : author.permission['members'] ? 1 : 0,
            };
        }
        return isOwner ? 2 : author.permission[type] ? 1 : 0;
    }

    async fetchAuthorsByCourseId(courseId: string) {
        const authors = await this.authorModel
            .find({
                course: courseId
            })
            .select('teacher -_id')
            .populate({
                path: 'teacher',
                select: '_id name avatar headline biography courses',
                populate: {
                    path: 'courses',
                    select: 'numOfStudents -_id'
                }
            })
            .lean()
            .exec()
        if (!authors)
            return null;
        const _authors = _.map(authors, ({ teacher }) => {
            const _teacher = teacher as Object as ITeacher;
            const numOfCourse = _.size(_teacher.courses);
            const numOfStudents = _.sum(_.map(_teacher.courses, 'numOfStudents'));
            const numOfReviews = 0;
            delete _teacher.courses;
            return {
                ..._teacher,
                numOfCourse,
                numOfStudents,
                numOfReviews
            }
        })
        return _authors;
    }

    async fetchInstructors(courseId: string): Promise<any> {
        const authors = await this.authorModel
            .find({
                course: courseId
            })
            .populate('teacher', 'name avatar biography')
            .lean()
            .exec();
        return _.map(authors, 'teacher');
    }
    
    async deleteById(memberId: string): Promise<any> {
        return await this.authorModel
            .findByIdAndDelete(memberId);
    }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IStudent } from './interfaces/student.interface';
import { MyCourseSortType } from '@/config/constants';
import * as _ from 'lodash';
import { ChapterService } from '@/chapter/chapter.service';

@Injectable()
export class StudentService {
    constructor (
        @InjectModel('Student') private readonly studentModel: Model<IStudent>,
        private readonly chapterService: ChapterService
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

    async getMyCoursesHashMap(userId: string): Promise<{ [p: string]: boolean }> {
        const studentItems = await this.studentModel.find({ user: userId });
        const courseIds = _.map(studentItems, 'course');
        let hashMap = {};
        _.forEach(courseIds, courseId => {
            hashMap[courseId] = true
        });
        return hashMap;
    }

    async fetchMyCourses(userId: string, skip: number, limit: number, sortBy: MyCourseSortType): Promise<any> {
        let students: any = await this.studentModel
          .find({ user: userId })
          .populate({
              path: 'course',
              select: 'title authors avatar',
              populate: {
                  path: 'authors',
                  select: 'name'
              }
          })
          .lean()
          .exec();
        const courseIds = students.map(student => student.course._id);
        const progressMap = await this.chapterService.getProgressMap(userId, courseIds);
        let courses = _.map(students, student => ({
            _id: student.course._id,
            progress: progressMap[student.course._id] ? (progressMap[student.course._id].finish * 100 / progressMap[student.course._id].sum) : 0,
            registerTime: student.createdAt,
            authors: _.map(student.course.authors, 'name'),
            title: student.course.title,
            avatar: student.course.avatar
        }));
        if (sortBy === MyCourseSortType.AtoZ) {
            courses = _.orderBy(courses, ['title', 'progress', 'registerTime'], ['asc', 'desc', 'desc']);
        }
        else if (sortBy === MyCourseSortType.ZtoA) {
            courses = _.orderBy(courses, ['title', 'progress', 'registerTime'], ['desc', 'desc', 'desc']);
        }
        else if (sortBy === MyCourseSortType.CompleteToNon) {
            courses = _.orderBy(courses, ['progress', 'registerTime', 'title'], ['desc', 'desc', 'asc']);
        }
        else if (sortBy === MyCourseSortType.NonToComplete) {
            courses = _.orderBy(courses, ['progress', 'registerTime', 'title'], ['asc', 'desc', 'asc']);
        }
        else if (sortBy === MyCourseSortType.RecentlyEnrolled) {
            courses = _.orderBy(courses, ['registerTime', 'title', 'progress'], ['desc', 'asc', 'desc']);
        }
        const hasMore = (limit !== -1) && skip + limit < _.size(courses);
        const list = limit === -1 ? _.slice(courses, skip) : _.slice(courses, skip, skip + limit);

        return {
            hasMore,
            list
        };
    }

    async fetchFriendCourses(friendId: string, skip: number, limit: number, hashMap: { [p: string]: boolean }) {
        let students: any = await this.studentModel
          .find({ user: friendId })
          .populate({
              path: 'course',
              select: 'title avatar starRating authors',
              populate: {
                  path: 'authors',
                  select: 'name'
              }
          })
          .sort('-createdAt')
          .lean()
          .exec();
        const hasMore = (limit !== -1) && (skip + limit < students.length);
        students = limit === -1 ? _.slice(students, skip) : _.slice(students, skip, skip + limit);
        let courses = _.map(students, student => ({
            ...student.course,
            authors: _.map(student.course.authors, 'name'),
            isRegistered: Boolean(hashMap[student.course._id.toString()])
        }));
        return {
            hasMore,
            list: courses
        }
    }

    async getMembers(courseId: string, skip: number, limit: number): Promise<any> {
        const length = await this.studentModel.find({ course: courseId }).count();
        const list = await this.studentModel
            .find({ course: courseId })
            .populate('user', '_id name avatar')
            .skip(skip)
            .limit(limit)
            .select('-progress -createdAt')
            .lean()
            .exec();
        return {
            hasMore: skip + limit < length,
            list
        }
    }
}

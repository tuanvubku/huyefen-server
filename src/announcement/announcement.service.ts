import { Injectable } from '@nestjs/common';
import { IAnnouncement } from './interfaces/announcement.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as _ from 'lodash';

@Injectable()
export class AnnouncementService {
    constructor(
        @InjectModel('Announcement') private readonly announcementModel: Model<IAnnouncement>
    ) { }

    async createAnnouncement(teacherId: string, courseId: string, content: string): Promise<IAnnouncement> {
        const announcement: IAnnouncement = new this.announcementModel({
            content: content,
            course: courseId,
            teacher: teacherId
        })
        await announcement.save();
        let res = await this.announcementModel
            .findById(announcement._id)
            .populate({
                path: 'teacher',
                select: {
                    _id: 1,
                    name: 1,
                    avatar: 1
                }
            })
            .select({
                _id: 0,
                __v: 0,
                course: 0
            })
            .lean().exec() as any;
        _.set(res, 'user', res.teacher);
        _.unset(res, 'teacher');
        res = {
            _id: _.uniqueId('announce_'),
            moreComments: false,
            commentsLoading: false,
            ...res,
        }
        return res;
    }

    async createComment(announcement: IAnnouncement) {
        await announcement.save();
    }

    async findAnnouncementById(announceId: string): Promise<IAnnouncement> {
        const announce = await this.announcementModel
            .findById(announceId);
        return announce;
    }
    async populateAnnouncementById(announceId: string): Promise<any> {
        const announce = await this.announcementModel
            .findById(announceId)
            .populate({
                path: "comments.owner",
                select: {
                    _id: 1,
                    name: 1,
                    avatar: 1
                }
            })
            .lean()
            .exec();
        return announce;
    }
    async fetchAnnouncements(courseId: string, page: number, limit: number) {
        const length = await this.announcementModel.count({});
        console.log(length)
        const hasMore = (page * limit) < length ? true : false;
        let announcements = await this.announcementModel
            .find({ course: courseId })
            .sort({
                createdAt: 'desc'
            })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate({
                path: "teacher",
                select: {
                    _id: 1,
                    name: 1,
                    avatar: 1
                }
            })
            .populate({
                path: "comments.owner",
                select: {
                    _id: 1,
                    name: 1,
                    avatar: 1
                }
            })
            .lean()
            .exec();
        announcements = announcements.map(a => {
            const comments = a.comments.slice(0, 5);
            return {
                ...a,
                comments,
                commentsLoading: false,
                moreComments: _.size(a.comments) > 5 ? true : false
            }
        })
        const res = {
            hasMore,
            list: _.keyBy(announcements, "_id")
        }
        return res;
    }
}

import { Injectable } from '@nestjs/common';
import { IAnnouncement } from './interfaces/announcement.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as _ from 'lodash';
import { Role } from '@/config/constants';
import { IComment } from './interfaces/comment.interface';

@Injectable()
export class AnnouncementService {
    constructor(
        @InjectModel('Announcement') private readonly announcementModel: Model<IAnnouncement>,
        @InjectModel('Comment') private readonly commentModel: Model<IComment>
    ) { }

    async createAnnouncement(teacherId: string, courseId: string, content: string): Promise<any> {
        let announcement: IAnnouncement = new this.announcementModel({
            content: content,
            course: courseId,
            teacher: teacherId
        });
        await announcement.save();
        announcement = await this.announcementModel
            .findById(announcement._id)
            .populate('teacher', 'name avatar');
        return {
            ..._.pick(announcement, ['_id', 'teacher', 'createdAt', 'comments', 'content']),
            commentsLoading: false,
            moreComments: false
        }
    }

    async createComment(user: any, userRole: Role, announceId: string, content: string): Promise<IComment> {
        const comment: IComment = new this.commentModel({
            owner: user._id,
            ownerType: userRole,
            content
        });
        await this.announcementModel
            .findByIdAndUpdate(announceId, {
                $push: {
                    comments: {
                        $each: [comment],
                        $position: 0
                    }
                }
            }, {
                runValidators: true
            });
        return {
            ..._.pick(comment, ['_id', 'createdAt', 'ownerType', 'content']),
            owner: user
        } as IComment;
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
        const length = await this.announcementModel.find({ course: courseId }).count();
        const hasMore = (page * limit) < length;
        let announcements = await this.announcementModel
            .find({ course: courseId })
            .sort({
                createdAt: 'desc'
            })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('teacher', 'name avatar')
            .populate('comments.owner', 'name avatar')
            .lean()
            .exec();
        announcements = announcements.map(announce => {
            const comments = announce.comments.slice(0, 5);
            return {
                ...announce,
                comments,
                commentsLoading: false,
                moreComments: _.size(announce.comments) > 5
            };
        });
        return {
            hasMore,
            list: _.keyBy(announcements, "_id")
        };
    }
}

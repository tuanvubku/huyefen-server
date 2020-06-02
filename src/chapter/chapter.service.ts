import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IChapter } from './interfaces/chapter.interface';
import * as _ from 'lodash';

@Injectable()
export class ChapterService {
    constructor (
        @InjectModel('Chapter') private readonly chapterModel: Model<IChapter>
    ) {}

    async fetchSyllabus(courseId: string): Promise<IChapter[]> {
        const syllabus: IChapter[] = await this.chapterModel
            .find({ course: courseId })
            .populate('owner', 'name avatar')
            .populate('lectures.owner', 'name avatar')
            .select({
                course: 0,
                'lecture.content': 0,
                'lecture.isPreviewed': 0
            });
        return syllabus;
    }

    async fetchChapters(courseId: string): Promise<any[]> {
        return await this.chapterModel
            .find({ course: courseId })
            .select({
                title: 1,
                'lectures.type': 1,
                'lectures.title': 1
            });
    }

    async create(teacherId: string, courseId: string, title: string, description: string): Promise<{ progress: number, data: IChapter}> {
        let chapter: IChapter = new this.chapterModel({
            title,
            description,
            course: courseId,
            owner: teacherId
        });
        chapter = await chapter.save();
        chapter = await this.chapterModel.findOne(chapter).populate('owner', 'name avatar');
        let progress: number = 50;
        const anotherChapters: IChapter[] = await this.chapterModel
                .find({
                    course: courseId,
                    _id: {
                        $ne: chapter._id
                    }
                });
        if (_.some(_.map(anotherChapters, chapter => _.size(chapter.lectures) > 0)))
            progress = 100;
        return {
            progress,
            data: chapter
        };
    }

    async validateChapter(courseId: string, chapterId: string): Promise<0 | -1 | 1> {
        const chapter = await this.chapterModel
            .findById(chapterId);
        if (!chapter) return 0;
        return chapter.course.toString() === courseId ? 1 : -1;
    }

    async update(teacherId: string, chapterId: string, title: string, description: string): Promise<IChapter> {
        try {
            const chapter: IChapter =  await this.chapterModel
                .findByIdAndUpdate(chapterId, {
                    title,
                    description,
                    owner: teacherId,
                    updatedAt: Date.now()
                }, {
                    new: true,
                    runValidators: true
                })
                .populate('owner', 'name avatar');
            
            return chapter;
        }
        catch (e) {
            if (e.name === 'ValidationError')
                throw new BadRequestException();
            throw e;
        }
    }
}

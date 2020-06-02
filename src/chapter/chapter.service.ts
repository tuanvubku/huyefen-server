import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IChapter } from './interfaces/chapter.interface';
import { CourseService } from '@/course/course.service';
import * as _ from 'lodash';

@Injectable()
export class ChapterService {
    constructor (
        @InjectModel('Chapter') private readonly chapterModel: Model<IChapter>,
        private readonly courseService: CourseService
    ) {}

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
        await this.courseService.saveSyllabusProgress(courseId, progress);
        return {
            progress,
            data: chapter
        };
    }
}

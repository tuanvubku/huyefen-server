import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as _ from 'lodash';
import { IHistory } from './interfaces/history.interface';
import { HistorySort, HistoryType } from '@/config/constants';

@Injectable()
export class HistoryService {
    constructor(
        @InjectModel('History') private readonly historyModel: Model<IHistory>
    ) {}

    async fetch(courseId: string, sort: HistorySort, page: number, limit: number): Promise<{ hasMore: boolean, list: IHistory[] }> {
        const histories: IHistory[] =  await this.historyModel
            .find({ course: courseId })
            .sort({
                createdAt: sort === HistorySort.Newest ? -1 : 1
            });
        const size: number = histories.length;
        const hasMore: boolean = page * limit < size;
        return {
            hasMore,
            list: _.slice(histories, (page - 1) * limit, page * limit)
        };
    }

    async push(courseId: string, teacherId: string, content: string, type: HistoryType, url?: string): Promise<void> {
        const history: IHistory = new this.historyModel({
            course: courseId,
            type,
            content,
            user: teacherId,
            ...(url ? { url }: {})
        });
        await history.save();
    }
}

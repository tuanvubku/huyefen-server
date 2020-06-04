import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ITopic } from './interfaces/topic.interface';

@Injectable()
export class TopicService {
    constructor (
        @InjectModel('Topic') private readonly topicModel: Model<ITopic>
    ) {}

    async fetch(): Promise<ITopic[]> {
        return await this.topicModel.find();
    }

    async create(title: string): Promise<ITopic> {
        const topic: ITopic = new this.topicModel({
            title
        });
        return await topic.save();
    }

    async delete(topicId: string): Promise<boolean> {
        const { deletedCount } = await this.topicModel
            .deleteOne({ _id: topicId });
        return !!deletedCount;
    }
}

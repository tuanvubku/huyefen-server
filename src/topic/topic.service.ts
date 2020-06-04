import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ITopic } from './interfaces/topic.interface';
import { ICourseTopic } from './interfaces/courseTopic.interface';

@Injectable()
export class TopicService {
    constructor (
        @InjectModel('Topic') private readonly topicModel: Model<ITopic>,
        @InjectModel('Course_topic') private readonly courseTopicModel: Model<ICourseTopic>
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
        if (!deletedCount) return false;
        await this.courseTopicModel.deleteMany({ topicId });
        return true;
    }
}

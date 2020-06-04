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
}

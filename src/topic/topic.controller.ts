import { Controller, Get } from '@nestjs/common';
import { IResponse } from '@/utils/interfaces/response.interface';
import { ITopic } from './interfaces/topic.interface';
import { TopicService } from './topic.service';
import { ResponseSuccess } from '@/utils/utils';

@Controller('topics')
export class TopicController {
    constructor (
        private readonly topicService: TopicService
    ) {}

    @Get()
    async fetch(): Promise<IResponse<ITopic[]>> {
        const topics: ITopic[] = await this.topicService.fetch();
        return new ResponseSuccess<ITopic[]>('FETCH_OK', topics);
    }

    
}

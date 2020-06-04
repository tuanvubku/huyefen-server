import { Module } from '@nestjs/common';
import { TopicController } from './topic.controller';
import { TopicService } from './topic.service';

@Module({
	controllers: [TopicController],
	providers: [TopicService]
})
export class TopicModule {}

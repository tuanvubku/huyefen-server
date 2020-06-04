import { Module } from '@nestjs/common';
import { TopicController } from './topic.controller';
import { TopicService } from './topic.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TopicSchema } from './schemas/topic.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Topic', schema: TopicSchema }
		])
	],
	controllers: [TopicController],
	providers: [TopicService]
})
export class TopicModule {}

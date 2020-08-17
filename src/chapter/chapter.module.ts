import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChapterService } from './chapter.service';
import { ChapterSchema } from './schemas/chapter.schema';
import { ArticleSchema } from '@/chapter/schemas/article.schema';
import { ResolutionSchema, VideoSchema } from '@/chapter/schemas/video.schema';
import { ResourceSchema } from '@/chapter/schemas/resource.schema';
import { ChapterGateway } from '@/chapter/chapter.gateway';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Chapter', schema: ChapterSchema },
			{ name: 'Article', schema: ArticleSchema },
			{ name: 'Video', schema: VideoSchema },
			{ name: 'Resource', schema: ResourceSchema },
			{ name: 'Resolution', schema: ResolutionSchema }
		])
	],
	providers: [ChapterService, ChapterGateway],
	exports: [ChapterService, ChapterGateway]
})
export class ChapterModule {}

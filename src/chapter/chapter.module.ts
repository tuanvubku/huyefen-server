import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChapterService } from './chapter.service';
import { ChapterSchema } from './schemas/chapter.schema';
import { ArticleSchema } from '@/chapter/schemas/article.schema';
import { VideoSchema } from '@/chapter/schemas/video.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Chapter', schema: ChapterSchema },
			{ name: 'Article', schema: ArticleSchema },
			{ name: 'Video', schema: VideoSchema }
		])
	],
	providers: [ChapterService],
	exports: [ChapterService]
})
export class ChapterModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChapterService } from './chapter.service';
import { ChapterSchema } from './schemas/chapter.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Chapter', schema: ChapterSchema }
		])
	],
	providers: [ChapterService],
	exports: [ChapterService]
})
export class ChapterModule {}

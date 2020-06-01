import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChapterService } from './chapter.service';
import { ChapterController } from './chapter.controller';
import { ChapterSchema } from './schemas/chapter.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Chapter', schema: ChapterSchema }
		])
	],
	providers: [ChapterService],
	controllers: [ChapterController],
	exports: [MongooseModule]
})
export class ChapterModule {}

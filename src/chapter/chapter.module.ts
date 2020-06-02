import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChapterService } from './chapter.service';
import { ChapterSchema } from './schemas/chapter.schema';
import { HistoryModule } from '@/history/history.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Chapter', schema: ChapterSchema }
		]),
		HistoryModule
	],
	providers: [ChapterService],
	exports: [ChapterService]
})
export class ChapterModule {}

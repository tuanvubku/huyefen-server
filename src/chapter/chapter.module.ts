import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChapterService } from './chapter.service';
import { ChapterController } from './chapter.controller';
import { ChapterSchema } from './schemas/chapter.schema';
import { CourseModule } from '@/course/course.module';
import { HistoryModule } from '@/history/history.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Chapter', schema: ChapterSchema }
		]),
		forwardRef(() => CourseModule),
		forwardRef(() => HistoryModule)
	],
	providers: [ChapterService],
	controllers: [ChapterController],
	exports: [MongooseModule]
})
export class ChapterModule {}

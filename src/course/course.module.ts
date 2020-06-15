import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { SearchModule } from '@/search/search.module';
import { ChapterModule } from '@/chapter/chapter.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseSchema } from './schemas/course.schema';
import { HistoryModule } from '@/history/history.module';
import { AuthorModule } from '@/author/author.module';
import { TeacherModule } from '@/teacher/teacher.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Course', schema: CourseSchema }
		]),
		SearchModule,
		HistoryModule,
		ChapterModule,
		AuthorModule,
		TeacherModule
	],
	providers: [CourseService],
	controllers: [CourseController],
	exports: [CourseService]
})
export class CourseModule {}
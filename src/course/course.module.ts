import { Module, forwardRef } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { SearchModule } from '@/search/search.module';
import { ChapterModule } from '@/chapter/chapter.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseSchema } from './schemas/course.schema';
import { AuthorSchema } from './schemas/author.schema';
import { HistoryModule } from '@/history/history.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Course', schema: CourseSchema },
			{ name: 'Author', schema: AuthorSchema }
		]),
		SearchModule,
		forwardRef(() => HistoryModule),
		ChapterModule
	],
	providers: [CourseService],
	controllers: [CourseController],
	exports: [CourseService]
})
export class CourseModule {}
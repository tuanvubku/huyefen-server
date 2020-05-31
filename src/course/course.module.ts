import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { SearchModule } from '@/search/search.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseSchema } from './schemas/course.schema';
import { AuthorSchema } from './schemas/author.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Course', schema: CourseSchema },
			{ name: 'Author', schema: AuthorSchema }
		]),
		SearchModule
	],
	providers: [CourseService],
	controllers: [CourseController]
})
export class CourseModule {}

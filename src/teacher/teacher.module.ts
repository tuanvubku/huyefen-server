import { Module } from '@nestjs/common';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TeacherSchema } from './schemas/teacher.schema';
import { CourseModule } from '@/course/course.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Teacher', schema: TeacherSchema }
		]),
		CourseModule
	],
	controllers: [TeacherController],
	providers: [TeacherService],
	exports: [TeacherService]
})
export class TeacherModule {}

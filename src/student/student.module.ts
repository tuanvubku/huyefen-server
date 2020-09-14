import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentSchema } from './schemas/student.schema';
import { ChapterModule } from '@/chapter/chapter.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Student', schema: StudentSchema }
		]),
		ChapterModule
	],
	controllers: [StudentController],
	providers: [StudentService],
	exports: [StudentService]
})
export class StudentModule {}

import { Module, forwardRef } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
//import { SearchModule } from '@/search/search.module';
import { ChapterModule } from '@/chapter/chapter.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseSchema } from './schemas/course.schema';
import { HistoryModule } from '@/history/history.module';
import { AuthorModule } from '@/author/author.module';
import { TeacherModule } from '@/teacher/teacher.module';
import { StudentModule } from '@/student/student.module';
import { ReviewTeacherModule } from '@/review-teacher/review-teacher.module';
import { ReviewCourseModule } from '@/review-course/review-course.module';
import { UserModule } from '@/user/user.module';
import { FirebaseModule } from '@/firebase/firebase.module';
import { PurchaseHistoryModule } from '@/purchase-history/purchase-history.module';
import { TopicModule } from '@/topic/topic.module';
import { AreaModule } from '@/area/area.module';
import { CourseMessengerModule } from '@/course-messenger/course-messenger.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Course', schema: CourseSchema,
			}
		]),
		//SearchModule,
		HistoryModule,
		ChapterModule,
		forwardRef(() => TeacherModule),
		AuthorModule,
		StudentModule,
		ReviewTeacherModule,
		ReviewCourseModule,
		UserModule,
		PurchaseHistoryModule,
		TopicModule,
		forwardRef(() => AreaModule),
		CourseMessengerModule
	],
	providers: [CourseService],
	controllers: [CourseController],
	exports: [CourseService]
})
export class CourseModule { }
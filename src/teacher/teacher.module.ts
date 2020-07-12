import { Module, forwardRef } from '@nestjs/common';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TeacherSchema } from './schemas/teacher.schema';
import { AuthorModule } from '@/author/author.module';
import { UserModule } from '@/user/user.module';
import { CourseModule } from '@/course/course.module';
import { TeacherNotificationSchema } from './schemas/notification.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Teacher', schema: TeacherSchema },
			{ name: 'TeacherNotification', schema: TeacherNotificationSchema }
		]),
		AuthorModule,
		forwardRef(() => CourseModule),
		UserModule
	],
	controllers: [TeacherController],
	providers: [TeacherService],
	exports: [TeacherService]
})
export class TeacherModule {}

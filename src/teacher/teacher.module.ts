import { Module } from '@nestjs/common';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TeacherSchema } from './schemas/teacher.schema';
import { AuthorModule } from '@/author/author.module';
import { UserModule } from '@/user/user.module';
import { NotificationSchema } from '@/user/schemas/notification.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Teacher', schema: TeacherSchema },
			{ name: 'Notification', schema: NotificationSchema }
		]),
		AuthorModule,
		UserModule
	],
	controllers: [TeacherController],
	providers: [TeacherService],
	exports: [TeacherService]
})
export class TeacherModule {}

import { Module } from '@nestjs/common';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AreaModule } from './area/area.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JobModule } from './job/job.module';
import { SharedModule } from './shared/shared.module';
import { TeacherModule } from './teacher/teacher.module';
import { CourseModule } from './course/course.module';
import { NotificationModule } from './notification/notification.module';
import { DeviceModule } from './device/device.module';
import { SearchModule } from './search/search.module';

@Module({
	imports: [
		ConfigModule.forRoot(),
		MongooseModule.forRoot(
			process.env.MONGO_URI,
			{
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useCreateIndex: true,
				useFindAndModify: false
			}
		), 
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'public'),
		}),
		AreaModule,
		UserModule,
		AuthModule,
		JobModule,
		SharedModule, 
		TeacherModule,
		CourseModule,
		NotificationModule,
		DeviceModule,
		SearchModule
	]
})
export class AppModule {}

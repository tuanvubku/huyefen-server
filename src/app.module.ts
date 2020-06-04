import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
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
import { CONFIG_ENV_PATH } from '@/config/constants';
import { MongooseConfig } from '@/config/mongoose.config';
import { validationPipeConfig } from '@/config/validationPipe.config';
import { HistoryModule } from './history/history.module';
import { ChapterModule } from './chapter/chapter.module';
import { TopicModule } from './topic/topic.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: `${CONFIG_ENV_PATH}/${process.env.APP_TYPE}.local.env`,
			isGlobal: true
		}),
		MongooseModule.forRootAsync({
			useClass: MongooseConfig,
		}), 
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
		SearchModule,
		HistoryModule,
		ChapterModule,
		TopicModule
	],
	providers: [
		{
			provide: APP_PIPE,
			useValue: new ValidationPipe(validationPipeConfig)
		}
	]
})
export class AppModule {}

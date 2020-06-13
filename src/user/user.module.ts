import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JobModule } from '@/job/job.module';
import { NotificationSchema } from './schemas/notification.schema';
import { MessengerModule } from '@/messenger/messenger.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'User', schema: UserSchema },
			{ name: 'Notification', schema: NotificationSchema }
		]),
		JobModule,
		forwardRef(() => MessengerModule)
	],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService]
})
export class UserModule {}

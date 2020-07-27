import { Module } from '@nestjs/common';
import { FriendController } from './friend.controller';
import { UserModule } from '@/user/user.module';
import { StudentModule } from '@/student/student.module';

@Module({
	imports: [UserModule, StudentModule],
	controllers: [FriendController]
})
export class FriendModule {}

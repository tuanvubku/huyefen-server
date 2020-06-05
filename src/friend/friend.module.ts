import { Module } from '@nestjs/common';
import { FriendController } from './friend.controller';
import { UserModule } from '@/user/user.module';

@Module({
	imports: [UserModule],
	controllers: [FriendController]
})
export class FriendModule {}

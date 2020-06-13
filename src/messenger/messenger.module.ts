import { Module, forwardRef } from '@nestjs/common';
import { MessengerController } from './messenger.controller';
import { MessengerService } from './messenger.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationSchema } from './schemas/conversation.schema';
import { MessageSchema } from './schemas/message.schema';
import { UserModule } from '@/user/user.module';

@Module({
    imports: [
		MongooseModule.forFeature([
			{ name: 'Conversation', schema: ConversationSchema },
			{ name: 'Message', schema: MessageSchema }
		]),
		//UserModule
		forwardRef(() => UserModule)
    ],
    controllers: [MessengerController],
	providers: [MessengerService],
	exports: [MessengerService]
})
export class MessengerModule {}

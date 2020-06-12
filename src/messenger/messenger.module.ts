import { Module } from '@nestjs/common';
import { MessengerController } from './messenger.controller';
import { MessengerService } from './messenger.service';

@Module({
  controllers: [MessengerController],
  providers: [MessengerService]
})
export class MessengerModule {}

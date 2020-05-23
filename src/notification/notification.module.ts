import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { Firebase } from './core/firebase';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, Firebase],
  exports: [NotificationService]
})
export class NotificationModule {}

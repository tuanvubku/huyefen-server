import { Module } from '@nestjs/common';
import { CourseMessengerService } from './course-messenger.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseMessengerSchema } from '@/course-messenger/schema/course-messenger.schema';
import { CourseMessengerController } from './course-messenger.controller';
import { StudentModule } from '@/student/student.module';
import { UserModule } from '@/user/user.module';
import { CourseMessengerGateway } from '@/course-messenger/course-messenger.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: 'CourseMessenger', schema: CourseMessengerSchema}
    ]),
      StudentModule,
      UserModule
  ],
  providers: [CourseMessengerService, CourseMessengerGateway],
  exports: [CourseMessengerService],
  controllers: [CourseMessengerController]
})
export class CourseMessengerModule {}

import { Module, UseGuards } from '@nestjs/common';
import { AnnouncementController } from './announcement.controller';
import { AnnouncementService } from './announcement.service';
import { AuthorModule } from '@/author/author.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AnnouncementSchema } from './schemas/announcement.schema';
import { TeacherModule } from '@/teacher/teacher.module';
import { UserModule } from '@/user/user.module';
import { CommentSchema } from './schemas/comment.schema';
import { StudentModule } from '@/student/student.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Announcement', schema: AnnouncementSchema },
      { name: 'Comment', schema: CommentSchema }
		]),
    AuthorModule,
    TeacherModule,
    UserModule,
    StudentModule
  ],
  controllers: [AnnouncementController],
  providers: [AnnouncementService]
})
export class AnnouncementModule {}

import { Module, UseGuards } from '@nestjs/common';
import { AnnouncementController } from './announcement.controller';
import { AnnouncementService } from './announcement.service';
import { AuthorModule } from '@/author/author.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AnnouncementSchema } from './schemas/announcement.schema';
import { TeacherModule } from '@/teacher/teacher.module';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
			{ name: 'Announcement', schema: AnnouncementSchema }
		]),
    AuthorModule,
    TeacherModule,
    UserModule
  ],
  controllers: [AnnouncementController],
  providers: [AnnouncementService]
})
export class AnnouncementModule {}

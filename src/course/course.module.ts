import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { SearchModule } from '@/search/search.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseSchema } from './schema/course.schema';

@Module({
  imports: [ MongooseModule.forFeature([
    {name: 'Course', schema: CourseSchema}
  ]),
    SearchModule],
  providers: [CourseService],
  controllers: [CourseController]
})
export class CourseModule {}

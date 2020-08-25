import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AreaSchema } from './schemas/area.schema';
import { AreaController } from './area.controller';
import { AreaService } from './area.service';
import { CourseModule } from '@/course/course.module';
import { CategorySchema } from '@/area/schemas/category.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Area', schema: AreaSchema },
            { name: 'Category', schema: CategorySchema }
        ]),
        forwardRef(() =>CourseModule )
    ],
    controllers: [AreaController],
    providers: [AreaService]
})
export class AreaModule {}

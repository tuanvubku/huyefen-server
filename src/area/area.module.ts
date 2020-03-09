import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AreaSchema } from './schemas/area.schema';
import { CategorySchema } from './schemas/category.schema';
import { AreaController } from './area.controller';
import { AreaService } from './area.service';

@Module({
    imports: [MongooseModule.forFeature([{name: 'Area', schema: AreaSchema}, {name: 'Category', schema: CategorySchema}])],
    controllers: [AreaController],
    providers: [AreaService]
})
export class AreaModule {}

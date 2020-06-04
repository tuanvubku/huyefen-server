import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AreaSchema } from './schemas/area.schema';
import { AreaController } from './area.controller';
import { AreaService } from './area.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Area', schema: AreaSchema }
        ])
    ],
    controllers: [AreaController],
    providers: [AreaService]
})
export class AreaModule {}

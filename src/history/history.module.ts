import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HistoryService } from './history.service';
import { HistorySchema } from './schemas/history.schema';
import { HistoryController } from './history.controller';
import { CourseModule } from '@/course/course.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'History', schema: HistorySchema }
		])
	],
	providers: [HistoryService],
	exports: [HistoryService],
	controllers: [HistoryController]
})
export class HistoryModule {}

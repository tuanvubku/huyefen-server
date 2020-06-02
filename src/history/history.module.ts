import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HistoryService } from './history.service';
import { HistorySchema } from './schemas/history.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'History', schema: HistorySchema }
		])
	],
	providers: [HistoryService],
	exports: [HistoryService]
})
export class HistoryModule {}
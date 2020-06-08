import { Module } from '@nestjs/common';
import { CloudService } from './cloud.service';
import { CloudController } from './cloud.controller';
import { BullModule } from '@nestjs/bull'

@Module({
  imports: [
    BullModule.registerQueue({
			name: 'video',
			processors: [],
			redis: {
			  host: 'localhost',
			  port: 6379
			}
		}),
  ],
  providers: [CloudService],
  controllers: [CloudController]
})
export class CloudModule {}

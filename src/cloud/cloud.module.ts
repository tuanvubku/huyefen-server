import { Module } from '@nestjs/common';
import { CloudService } from './cloud.service';
import { CloudController } from './cloud.controller';
import { BullModule } from '@nestjs/bull'
import { AuthorModule } from '@/author/author.module';
import { ChapterModule } from '@/chapter/chapter.module';

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
		ChapterModule,
	AuthorModule
  ],
  providers: [CloudService],
  controllers: [CloudController]
})
export class CloudModule {}

import { Module, OnModuleInit} from '@nestjs/common';
import {BullModule} from '@nestjs/bull'
import { VideoConsumer } from './video.consumer';
import { Job, DoneCallback } from 'bull';
@Module({
    imports: [
        BullModule.registerQueue({
            name: 'video',
            processors: [ (job: Job, done: DoneCallback) => { done(null, job.data); } ],
            redis: {
              host: 'localhost',
              port: 6379
            }
          })
    ],
    providers: [VideoConsumer]
})
export class VideoModule implements OnModuleInit {
    onModuleInit() {
      console.log('WORKER: ', process.pid);
    }
  }
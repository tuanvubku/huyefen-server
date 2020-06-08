import { NestFactory } from '@nestjs/core';
import { VideoModule } from './worker/worker.module';

async function bootstrap() {
  console.log("Start worker process!")
  const app = await NestFactory.create(VideoModule);
  app.init();
}

bootstrap();
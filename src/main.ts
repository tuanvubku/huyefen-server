import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

declare const module: any;

async function bootstrap() {
  const httpsOptions = {
    key: readFileSync(`${join(__dirname, '../', 'ssl')}/key.pem`),
    cert: readFileSync(`${join(__dirname, '../', 'ssl')}/cert.pem`)
  };
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
    cors: {
      origin: ['http://localhost:2112', 'http://localhost:8000'],
      methods: ['GET', 'PUT', 'POST', 'DELETE'],
      preflightContinue: false,
      optionsSuccessStatus: 204,
      credentials: true
    }
  });
  const configService = app.get(ConfigService);
  await app.listen(configService.get<string>('HTTPS_PORT'));
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();

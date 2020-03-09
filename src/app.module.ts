import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AreaModule } from './area/area.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JobModule } from './job/job.module';
import {ConfigModule} from '@nestjs/config';

@Module({
  imports: [ ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI,{useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true}), 
    AreaModule, UserModule, AuthModule, JobModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

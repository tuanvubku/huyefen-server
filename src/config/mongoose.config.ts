import { Injectable } from '@nestjs/common';
import { MongooseOptionsFactory, MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MongooseConfig implements MongooseOptionsFactory {
	constructor(private configService: ConfigService) {}

    createMongooseOptions(): MongooseModuleOptions {
        return {
			uri: this.configService.get<string>('MONGO_URI'),
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false
		}
    }
}
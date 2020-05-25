import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TeacherModule } from '@/teacher/teacher.module';
import { UserSchema } from './schema/user.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'User', schema: UserSchema }
		]),
		TeacherModule
	],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService]
})
export class UserModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '@/user/schema/user.schema';
import { UserModule } from '@/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JWTService } from './jwt.service';
import { JwtStrategy } from './jwt.strategy';
import { TeacherModule } from '@/teacher/teacher.module';
import { TeacherSchema } from '@/teacher/schema/teacher.schema';

@Module({
  imports: [MongooseModule.forFeature([
    {name: 'User', schema: UserSchema},
    {name: 'Teacher', schema: TeacherSchema}]), UserModule, TeacherModule],
    controllers: [AuthController],
    providers: [AuthService, JWTService, JwtStrategy]
})
export class AuthModule {}

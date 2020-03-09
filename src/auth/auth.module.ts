import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/user/schema/user.schema';
import {JWTService} from './jwt.service'
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from 'src/user/user.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [MongooseModule.forFeature([
    {name: 'User', schema: UserSchema}]), UserModule],
    controllers: [AuthController],
    providers: [ AuthService, JWTService, JwtStrategy]
})
export class AuthModule {}

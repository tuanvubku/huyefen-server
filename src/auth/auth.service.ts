import { Injectable, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { IUser } from 'src/user/interface/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { JWTService } from './jwt.service';
import * as _ from 'lodash'
import { UserService } from 'src/user/user.service';


@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService,private readonly jwtService: JWTService) {}

  async validateLogin(phone: string, password: string) {
    var userLogined = await this.userService.findUserFromDB(phone);
    if(!userLogined) throw new HttpException('LOGIN.USER_NOT_CREATED', HttpStatus.FORBIDDEN);
    const isValidPass = await bcrypt.compare(password, userLogined.password);
    if(isValidPass && phone === userLogined.phone)
    {
        const token = await this.jwtService.createToken(phone, userLogined.roles);
        userLogined.password = undefined;
        return {
            token: token,
            user: userLogined
        };
    }
     else {
        throw new HttpException("LOGIN_ERROR",HttpStatus.UNAUTHORIZED);
    }
  }
}
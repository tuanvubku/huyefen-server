import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserService } from 'src/user/user.service';
import { JWTService } from './jwt.service';
import {SALT} from '../utils/constant' 
import {validatePassword} from '../utils/validate/validate'
@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService, private readonly jwtService: JWTService) { }

  async validateLogin(phone: string, password: string) {
    var userLogined = await this.userService.findUserFromDB(phone);
    if (!userLogined) throw new HttpException('LOGIN.USER_NOT_CREATED', HttpStatus.UNAUTHORIZED);
    const isValidPass = await bcrypt.compare(password, userLogined.password);
    if (isValidPass && phone === userLogined.phone) {
      const token = await this.jwtService.createToken(phone, userLogined.roles);
      userLogined.password = undefined;
      const res = { ...userLogined, ...token };
      return res;
    }
    else {
      throw new HttpException("LOGIN.ERROR", HttpStatus.UNAUTHORIZED);
    }
  }


  async checkCurrentPassword(password: string, phone: string) {
    const user = await this.userService.findUserFromDB(phone);
    if(!user) 
      throw new HttpException("LOGIN.USER_NOT_FOUND", HttpStatus.NOT_FOUND);
    return await bcrypt.compare(password,  user.password);
  }

  async setPassword(phone: string, newPassword: string): Promise<boolean> { 
    const isValid = validatePassword(newPassword);
    if(!isValid)
      return false;
    var userFromDb = await this.userService.findUserFromDB(phone);
    if(!userFromDb) throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);
    
    userFromDb.password = await bcrypt.hash(newPassword, SALT);

    await this.userService.updateUserByPhone(phone, userFromDb);
    return true;
  }
}
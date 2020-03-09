import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserService } from 'src/user/user.service';
import { JWTService } from './jwt.service';


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
}
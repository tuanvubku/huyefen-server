import * as jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '../../node_modules/@nestjs/mongoose';
import { IUser } from 'src/user/interface/user.interface';
import {TOKEN_EXPIRED} from '../utils/constant'
@Injectable()
export class JWTService {
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) { }


  async createToken(phone, roles) {
    const expiresIn = TOKEN_EXPIRED;
    const secretOrKey = process.env.SECRET_KEY;
    const userInfo = { phone: phone, roles: roles };
    const token = jwt.sign(userInfo, secretOrKey, { expiresIn });
    return {
      expires_in: expiresIn,
      access_token: token,
    };
  }

  async validateUser(signedUser: IUser): Promise<IUser> {
    var userFromDb = await this.userModel.findOne({ phone: signedUser.phone });
    if (userFromDb) {
      return userFromDb;
    }
    return null;
  }


}

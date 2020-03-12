import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserService } from 'src/user/user.service';
import { JWTService } from './jwt.service';
import { SALT } from '../utils/constant'
import { validatePassword } from '../utils/validate/validate'
import { TeacherService } from 'src/teacher/teacher.service';
@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService,
    private readonly jwtService: JWTService,
    private readonly teacherService: TeacherService) { }

  async validateLoginUser(phone: string, password: string) {
    var userFromDB = await this.userService.findUserByPhone(phone);
    return await this.valdiateLogin(phone, password, userFromDB);
  }

  async validateLoginTeacher(phone: string, password: string) {
    var teacherFromDB = await this.teacherService.findTeacherByPhone(phone);
    return await this.valdiateLogin(phone, password, teacherFromDB);
  }

  async valdiateLogin(phone: string, password: string, identity: any): Promise<any> {
    if (!identity) throw new HttpException('LOGIN.NOT_CREATED', HttpStatus.UNAUTHORIZED);
    const isValidPass = await bcrypt.compare(password, identity.password);
    if (isValidPass && phone === identity.phone) {
      const token = await this.jwtService.createToken(identity._id, identity.roles);
      identity.password = undefined;
      const res = { ...identity, ...token };
      return res;
    }
    else {
      throw new HttpException("LOGIN.ERROR", HttpStatus.UNAUTHORIZED);
    }
  }
  async checkCurrentPassword(password: string, phone: string) {
    const user = await this.userService.findUserByPhone(phone);
    if (!user)
      throw new HttpException("LOGIN.NOT_FOUND", HttpStatus.NOT_FOUND);
    return await bcrypt.compare(password, user.password);
  }

  async setPassword(phone: string, newPassword: string): Promise<boolean> {
    const isValid = validatePassword(newPassword);
    if (!isValid)
      return false;
    var userFromDb = await this.userService.findUserByPhone(phone);
    if (!userFromDb) throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    userFromDb.password = await bcrypt.hash(newPassword, SALT);

    await this.userService.updateUserByPhone(phone, userFromDb);
    return true;
  }

  async saveURL(base64: string, user: any): Promise<any> {
    let base64Data = base64.replace(/^data:image\/png;base64,/, "");
    let url = null;
    let fileName = "avatar.png"
    let dir = "./public/teachers/" + user.email;
    let success = await this.writeFile(dir, fileName, base64Data);

    if (!success == true)
      throw new HttpException("USER.SAVE_IMAGE_FAILD", HttpStatus.INTERNAL_SERVER_ERROR);

    url = user.email + '/' + fileName;
    return url;

  }

  async writeFile(dir: string, filename: string, base64Data: string): Promise<any> {
    return new Promise(function (resolve, reject) {
      let fs = require('fs');
      if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }); }
      fs.writeFile(dir + '/' + filename, base64Data, 'base64', function (err) {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }
}
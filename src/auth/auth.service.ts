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
    var userFromDB = await this.userService.findUserFromDB(phone);
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
      const token = await this.jwtService.createToken(phone, identity.roles);
      identity.password = undefined;
      const res = { ...identity, ...token };
      return res;
    }
    else {
      throw new HttpException("LOGIN.ERROR", HttpStatus.UNAUTHORIZED);
    }
  }
  async checkCurrentPassword(password: string, phone: string) {
    const user = await this.userService.findUserFromDB(phone);
    if (!user)
      throw new HttpException("LOGIN.NOT_FOUND", HttpStatus.NOT_FOUND);
    return await bcrypt.compare(password, user.password);
  }

  async setPassword(phone: string, newPassword: string): Promise<boolean> {
    const isValid = validatePassword(newPassword);
    if (!isValid)
      return false;
    var userFromDb = await this.userService.findUserFromDB(phone);
    if (!userFromDb) throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    userFromDb.password = await bcrypt.hash(newPassword, SALT);

    await this.userService.updateUserByPhone(phone, userFromDb);
    return true;
  }
}
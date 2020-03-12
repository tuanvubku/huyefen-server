import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ITeacher } from 'src/teacher/interface/teacher.interface';
import { TeacherService } from 'src/teacher/teacher.service';
import { IUser } from 'src/user/interface/user.interface';
import { UserService } from 'src/user/user.service';
import { TOKEN_EXPIRED } from '../utils/constant';
@Injectable()
export class JWTService {
  constructor(private readonly userService: UserService,
    private readonly teacherService: TeacherService) { }


  async createToken(id, roles) {
    const expiresIn = TOKEN_EXPIRED;
    const secretOrKey = process.env.SECRET_KEY;
     const userInfo = { id: id, roles: roles };
    const token = jwt.sign(userInfo, secretOrKey, { expiresIn });
    return { token };
  }

  async validateUser(signedUser: IUser): Promise<IUser> {
    var userFromDb = await this.userService.findUserById(signedUser.id);
    if (userFromDb) {
      return userFromDb;
    }
    return null;
  }

  async validateTeacher(signedUser: ITeacher): Promise<ITeacher> {
    var userFromDb = await this.teacherService.findTeacherById(signedUser.id);
    if (userFromDb) {
      return userFromDb;
    }
    return null;
  }


}

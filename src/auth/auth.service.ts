import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as _ from 'lodash';
import * as bcrypt from 'bcryptjs';
import { Role } from '@/config/constants';
import { UserService } from '@/user/user.service';
import { TeacherService } from '@/teacher/teacher.service';
import { ConfigService } from '@nestjs/config';
import { IUser } from '@/user/interfaces/user.interface';
@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
		private readonly teacherService: TeacherService,
		private readonly configService: ConfigService
	) {}

	async validateLoginUser(phone: string, password: string): Promise<any> {
		let user: any = await this.userService.findUserByPhone(phone);
		if (user) {
			const checkPassword = await bcrypt.compare(password, user.password);
			if (checkPassword) {
				user = _.omit(user, ['password']);
				user.token = this.jwtService.sign({
					_id: user._id,
					role: Role.User
				});
				return user;
			}
		}
		return null;
	}

	async validateLoginTeacher(phone: string, password: string) {
		let teacher: any = await this.teacherService.findTeacherByPhone(phone);
		if (teacher) {
			const checkPassword = await bcrypt.compare(password, teacher.password);
			if (checkPassword) {
				teacher = _.omit(teacher, ['password']);
				teacher.token = this.jwtService.sign({
					_id: teacher._id,
					role: Role.Teacher
				});
				return teacher;
			}
		}
		return null;
	}
}
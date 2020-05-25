import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JWTService } from './jwt.service';
import { PassportStrategy } from '@nestjs/passport';
import { Role } from '@/config/constants';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly jwtService: JWTService) {
    super(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: process.env.SECRET_KEY,
      }
    );
  }

  public async validate(payload: any, done: Function) {
    let user = null;
    if(payload.roles[0] == Role.Teacher) {
      user = await this.jwtService.validateTeacher(payload);
    } else if (payload.roles[0] == Role.User) {
      user = await this.jwtService.validateUser(payload);
    }

    if (!user) {
      return done(new UnauthorizedException(), false);
    }
    done(null, user);
  }
}

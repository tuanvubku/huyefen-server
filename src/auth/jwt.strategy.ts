import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor () {
		const configService = new ConfigService();
		console.log(configService.get<string>('SECRET_KEY'));
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: true,
			secretOrKey: configService.get<string>('SECRET_KEY')
		});
	}

	public async validate(payload: any) {
		return {
			_id: payload._id,
			role: payload.role
		};
	}
}

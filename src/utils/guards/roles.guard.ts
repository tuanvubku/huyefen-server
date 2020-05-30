import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import * as _ from 'lodash';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor (
		private readonly reflector: Reflector
	) {}

	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		let roles = this.reflector.get<string[]>('roles', context.getHandler());
		if (!roles)
			roles = this.reflector.get<string[]>('roles', context.getClass());
		if (!roles) return true;
		const req = context.switchToHttp().getRequest();
		const user = req.user;
		return _.indexOf(roles, user.role) > -1;
	}
}

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
		const roles = this.reflector.get<string[]>('roles', context.getHandler());
		if (!roles) {
			return true;
		}

		const req = context.switchToHttp().getRequest();
		const user = req.user;
		const hasRole = () => user.roles.some((role) => roles.indexOf(role)> -1);
		var hasPermission = false;

		if(hasRole()){
			hasPermission = true;
		}
		return user && user.roles && hasPermission;
	}
}

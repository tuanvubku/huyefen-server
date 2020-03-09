import { Controller, Post, Body, Get, Param, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { IResponse } from 'src/utils/response.interface';
import { IUser } from './interface/user.interface';
import { success } from 'src/utils/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/utils/guard/roles.guard';
import { Roles } from 'src/utils/roles.decorator';
import {Role}  from '../utils/constant'
import { User } from 'src/utils/decorator/user.decorator';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async findUser_(@User() userFromDB: IUser): Promise<IResponse<IUser>> {
        const user = await this.userService.getUser(userFromDB.phone);
        return success(user);
    }

    @Get(':phone')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async findUser(@Param('phone') phone: string): Promise<IResponse<IUser>> {
        const user = await this.userService.getUser(phone);
        return success(user);
    }
}

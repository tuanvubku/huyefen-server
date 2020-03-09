import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { IResponse } from 'src/utils/response.interface';
import { IUser } from './interface/user.interface';
import { success } from 'src/utils/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/utils/guard/roles.guard';
import { Roles } from 'src/utils/roles.decorator';
import {Role}  from '../utils/constant'

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get(':phone')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async findUser(@Param('phone') phone: string): Promise<IResponse<IUser>> {
        const user = await this.userService.getUser(phone);
        return success(user);
    }
}

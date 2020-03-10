import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/utils/decorator/roles.decorator';
import { User } from 'src/utils/decorator/user.decorator';
import { ResponseSuccess } from 'src/utils/dto/response.dto';
import { RolesGuard } from 'src/utils/guard/roles.guard';
import { IResponse } from 'src/utils/interface/response.interface';
import { Role } from '../utils/constant';
import { IUser } from './interface/user.interface';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async findUser(@User() userFromDB: IUser): Promise<IResponse<IUser>> {
        const user = await this.userService.getUser(userFromDB.phone);
        return new ResponseSuccess("USER.GET_SUCCESS", user);
    }

    @Get(':phone')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async findUserByPhone(@Param('phone') phone: string): Promise<IResponse<IUser>> {
        const user = await this.userService.getUser(phone);
        return new ResponseSuccess("USER.GET_BY_ID_SUCCESS", user);
    }
}

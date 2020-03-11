import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/utils/decorator/roles.decorator';
import { User } from 'src/utils/decorator/user.decorator';
import { ResponseSuccess } from 'src/utils/dto/response.dto';
import { RolesGuard } from 'src/utils/guard/roles.guard';
import { IResponse } from 'src/utils/interface/response.interface';
import { Role } from '../utils/constant';
import { IUser } from './interface/user.interface';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/create-user.dto';

@Controller('users')
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

    @Put('concerns')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async updateConcern(@Body('catesOfConcern') catesOfConcern: string[], @User() user): Promise<IResponse<any>> {
        const userFromDB = await this.userService.findUserFromDB(user.phone);
        userFromDB.catesOfConcern = catesOfConcern;
        const updateUser = await this.userService.updateUserById(user.id, userFromDB);
        return new ResponseSuccess("USER.UPDATE_CONCERN_SUCCESS", updateUser);
    }
    
    @Put('info')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async updateInfo(@Body() updateUserDto: UpdateUserDto, @User() user): Promise<IResponse<IUser>> {
        const updateUser = this.userService.updateUserInfo(user.phone, updateUserDto);
        return new ResponseSuccess("USER.UPDATE_INFO_SUCCESS", updateUser);
    }
}

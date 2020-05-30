import { Controller, Put, UseGuards, Body, Post, Get, Req, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/utils/guards/roles.guard';
import { Roles } from '@/utils/decorators/roles.decorator';
import { Role } from '@/config/constants';
import { UpdateDto } from './dtos/update.dto';
import { UpdateSocialsDto } from './dtos/socials.dto';
import { UpdateAvatarDto } from './dtos/avatar.dto';
import { IResponse } from '@/utils/interfaces/response.interface';
import { ITeacher } from './interfaces/teacher.interface';
import { TeacherService } from './teacher.service';
import { ResponseSuccess } from '@/utils/utils';

@Controller('teachers')
@Roles(Role.Teacher)
export class TeacherController {
    constructor (
        private readonly teacherService: TeacherService
    ) {}

    @Post('/test/create')
    async create(@Body() body): Promise<IResponse<ITeacher>> {
        const teacher: ITeacher = await this.teacherService.create(body);
        return new ResponseSuccess<ITeacher>('TEST_OK', teacher);
    }

    @Get('/me')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async fetch(@Req() req): Promise<IResponse<any>> {
        const teacher = await this.teacherService.findTeacherById(req.user._id);
        if (!teacher)
            throw new NotFoundException('Teacher doesn\'t existed!');
        return new ResponseSuccess('TEACHER.FETCH_SUCCESSFULLY', teacher);
    }

    @Put('update')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async update(@Req() req, @Body() body: UpdateDto): Promise<IResponse<any>> {
        const teacherId = req.user._id;
        const teacher: any = await this.teacherService.update(teacherId, body);
        if (!teacher)
            throw new NotFoundException('Teacher doesn\'t existed!');
        return new ResponseSuccess('TEACHER.UPDATE_OK', teacher);
    }

    @Put('update/socials')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async updateSocials(@Req() req, @Body() body: UpdateSocialsDto): Promise<IResponse<any>> {
        const teacherId = req.user._id;
        const teacher: any = await this.teacherService.updateSocials(teacherId, body);
        if (!teacher)
            throw new NotFoundException('Teacher doesn\'t existed!');
        return new ResponseSuccess('TEACHER.UPDATE_SOCIALS_OK', teacher);
    }

    @Put('update/avatar')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async updateAvatar(@Req() req, @Body() body: UpdateAvatarDto): Promise<IResponse<any>> {
        const teacherId: string = req.user._id;
        const { avatar } = body;
        const teacher: any = await this.teacherService.updateAvatar(teacherId, avatar);
        if (!teacher)
            throw new NotFoundException('Teacher doesn\'t existed!');
        return new ResponseSuccess('TEACHER.UPDATE_AVATAR_OK', teacher);
    }
}

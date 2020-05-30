import { Controller, Put, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/utils/guards/roles.guard';
import { Roles } from '@/utils/decorator/roles.decorator';
import { Role } from '@/config/constants';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { User } from '@/utils/decorator/user.decorator';
import { IResponse } from '@/utils/interfaces/response.interface';
import { ITeacher } from './interface/teacher.interface';
import { TeacherService } from './teacher.service';
import { ResponseSuccess } from '@/utils/utils';

@Controller('teachers')
export class TeacherController {

    constructor(private readonly teacherService: TeacherService) { }


    @Put('setting')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async updateInfo(@Body() updateTeacherDto: UpdateTeacherDto, @User() user): Promise<IResponse<ITeacher>> {
        //console.log(user)
        const updateTeacher = await this.teacherService.updateTeacher(user.phone, updateTeacherDto);
        updateTeacher.password = undefined;
        return new ResponseSuccess("TEACHER.UPDATE_INFO_SUCCESS", updateTeacher);
    }

    // @Put('social')
    // @UseGuards(AuthGuard('jwt'), RolesGuard)
    // @Roles(Role.Teacher)
    // async updateSocial(@Body() updateTeacherDto: UpdateTeacherDto, @User() user): Promise<IResponse<ITeacher>> {
    //     const updateTeacher = await this.teacherService.updateTeacher(user.phone, updateTeacherDto);
    //     updateTeacher.password = undefined;
    //     return new ResponseSuccess("TEACHER.UPDATE_INFO_SUCCESS", updateTeacher);
    // }

    // @Put('setting')
    // @UseGuards(AuthGuard('jwt'), RolesGuard)
    // @Roles(Role.Teacher)
    // async updateSetting(@Body() updateTeacherDto: UpdateTeacherDto, @User() user): Promise<IResponse<ITeacher>> {
    //     const updateTeacher = await this.teacherService.updateTeacher(user.phone, updateTeacherDto);
    //     updateTeacher.password = undefined;
    //     return new ResponseSuccess("TEACHER.UPDATE_INFO_SUCCESS", updateTeacher);
    // }

}

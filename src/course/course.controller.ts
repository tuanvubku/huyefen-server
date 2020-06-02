import { Body, Controller, Query, Get, Put, Post, UseGuards, Req, ValidationPipe, Param, ParseUUIDPipe, ForbiddenException, NotFoundException, UsePipes, Res } from '@nestjs/common';
import { CourseService } from './course.service';
import { SearchService } from '@/search/search.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/utils/guards/roles.guard';
import { Roles } from '@/utils/decorators/roles.decorator';
import { Role } from '@/config/constants';
import { ICourse } from './interfaces/course.interface';
import { IResponse } from '@/utils/interfaces/response.interface';
import { ResponseSuccess } from '@/utils/utils';
import { CreateDto } from './dtos/create.dto';
import { TeacherCoursesSort } from '@/config/constants';
import { FetchDto } from './dtos/fetch.dto';
import { FetchInfoDto } from './dtos/fetchInfo.dto';
import { FetchGoalsDto } from './dtos/fetchGoals.dto';
import { UpdateGoalsDto, UpdateGoalsParamDto } from './dtos/goals.dto';
import { IWhatLearn } from './interfaces/whatLearn.interface';
import { IRequirement } from './interfaces/requirement.interface';
import { ITargetStudent } from './interfaces/targetStudent.interface';

@Controller('courses')
export class CourseController {
    constructor (
        private readonly courseService: CourseService,
        private readonly searchService: SearchService
    ) {}

    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async create(@Req() req, @Body() body: CreateDto): Promise<IResponse<ICourse>> {
        const teacherId = req.user._id;
        const { area, title } = body;
        //areaService -> check area;
        const course: ICourse = await this.courseService.create(teacherId, area, title);
        return new ResponseSuccess<ICourse>('CREATE_COURSE_OK', course);
    }

    @Get('/my/teacher')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async fetch(
        @Req() req,
        @Query() query: FetchDto
    ): Promise<IResponse<any[]>> {
        const teacherId: string = req.user._id;
        const courses: Array<any> = await this.courseService.fetch(teacherId, query.sort, Number(query.page), Number(query.limit));
        return new ResponseSuccess('FETCH_OK', courses);
    }

    @Get('/:id/info')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async fetchInfo(@Req() req, @Param() params: FetchInfoDto): Promise<IResponse<any>> {
        const { id: courseId } = params;
        const teacherId: string = req.user._id;
        const check = await this.courseService.validateTeacherCourse(teacherId, courseId);
        if (!check)
            throw new ForbiddenException('Forbidden. You can not access this course');
        const courseInfo = await this.courseService.fetchInfo(courseId);
        if (!courseInfo)
            throw new NotFoundException('The course do not existed!');
        return new ResponseSuccess('FETCH_INFO_OK', courseInfo);
    }

    @Get('/:id/goals')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async fetchGoals(@Req() req, @Param() params: FetchGoalsDto): Promise<IResponse<any>> {
        const teacherId: string = req.user._id;
        const { id: courseId } = params;
        const check = await this.courseService.validateTeacherCourse(teacherId, courseId);
        if (!check)
            throw new ForbiddenException('Forbidden. You can not access this course');
        const courseGoals = await this.courseService.fetchGoals(courseId);
        if (!courseGoals)
            throw new NotFoundException('The course do not existed!');
        return new ResponseSuccess('FETCH_INFO_OK', courseGoals);
    }

    @Put('update/:id/what-learns')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async updateWhatLearns(
        @Req() req,
        @Param() params: UpdateGoalsParamDto,
        @Body() body: UpdateGoalsDto
    ): Promise<IResponse<IWhatLearn[]>> {
        const teacherId: string = req.user._id;
        const courseId: string = params.id;
        const check = await this.courseService.validateTeacherCourse(teacherId, courseId);
        if (!check)
            throw new ForbiddenException('Forbidden. You can not access this course');
        const whatLearns: IWhatLearn[] = await this.courseService.updateWhatLearns(teacherId, courseId, body);
        if (!whatLearns)
            throw new NotFoundException('The course do not existed!');
        return new ResponseSuccess('CHANGE_WHAT_LEARN_OK', whatLearns);
    }
    
    @Put('update/:id/requirements')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async updateRequirements(
        @Req() req,
        @Param() params: UpdateGoalsParamDto,
        @Body() body: UpdateGoalsDto
    ): Promise<IResponse<IRequirement[]>> {
        const teacherId: string = req.user._id;
        const courseId: string = params.id;
        const check = await this.courseService.validateTeacherCourse(teacherId, courseId);
        if (!check)
            throw new ForbiddenException('Forbidden. You can not access this course');
        const requirements: IRequirement[] = await this.courseService.updateRequirements(teacherId, courseId, body);
        if (!requirements)
            throw new NotFoundException('The course do not existed!');
        return new ResponseSuccess('CHANGE_WHAT_LEARN_OK', requirements);
    }

    @Put('update/:id/target')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async updateTargetStudents(
        @Req() req,
        @Param() params: UpdateGoalsParamDto,
        @Body() body: UpdateGoalsDto
    ): Promise<IResponse<ITargetStudent[]>> {
        const teacherId: string = req.user._id;
        const courseId: string = params.id;
        const check = await this.courseService.validateTeacherCourse(teacherId, courseId);
        if (!check)
            throw new ForbiddenException('Forbidden. You can not access this course');
        const targetStudents: ITargetStudent[] = await this.courseService.updateTargetStudents(teacherId, courseId, body);
        if (!targetStudents)
            throw new NotFoundException('The course do not existed!');
        return new ResponseSuccess('CHANGE_WHAT_LEARN_OK', targetStudents);
    }
}



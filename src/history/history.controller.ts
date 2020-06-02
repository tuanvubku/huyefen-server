import { Controller, Req, Get, UseGuards, Query, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/utils/guards/roles.guard';
import { Roles } from '@/utils/decorators/roles.decorator';
import { Role } from '@/config/constants';
import { FetchDto } from '@/history/dtos/fetch.dto';
import { IResponse } from '@/utils/interfaces/response.interface';
import { IHistory } from './interfaces/history.interface';
import { ResponseSuccess } from '@/utils/utils';
import { CourseService } from '@/course/course.service';
import { HistoryService } from './history.service';

@Controller('histories')
export class HistoryController {
    // constructor(
    //     private readonly courseService: CourseService,
    //     private readonly historyService: HistoryService
    // ) {}

    // @Get()
    // @UseGuards(AuthGuard('jwt'), RolesGuard)
    // @Roles(Role.Teacher)
    // async fetch(
    //     @Req() req,
    //     @Query() query: FetchDto
    // ): Promise<IResponse<IHistory[]>> {
    //     const teacherId = req.user._id;
    //     let { courseId, sort, page, limit } = query;
    //     page = Number(page);
    //     limit = Number(limit);
    //     const checkCourse = await this.courseService.validateCourse(courseId);
    //     if (!checkCourse)
    //         throw new NotFoundException('Invalid course');
    //     const checkAuthor: boolean = await this.courseService.validateTeacherCourse(teacherId, courseId);
    //     if (!checkAuthor)
    //         throw new ForbiddenException('Forbidden to access this course');
    //     const histories: IHistory[] = await this.historyService.fetch(courseId, sort, page, limit);
    //     return new ResponseSuccess<IHistory[]>('FETCH_HISTORY_OK', histories);
    // }

}

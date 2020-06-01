import { Body, Controller, Query, Get, Post, UseGuards, Req, ValidationPipe } from '@nestjs/common';
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
        @Query(new ValidationPipe({ transform: true })) query: FetchDto
    ): Promise<IResponse<any[]>> {
        const teacherId: string = req.user._id;
        let { page, limit, sort } = query;
        page = Number(page);
        limit = Number(limit);
        const courses: Array<any> = await this.courseService.fetch(teacherId, sort, page, limit);
        return new ResponseSuccess('FETCH_OK', courses);
    }
    // @Post()
    // async createCourse(@Body() createCourseDto: CreateCourseDto){
    //     const course = await this.courseService.createCourse(createCourseDto);
    //     if(!course) 
    //         throw new HttpException("COURSE.CREATE_FAIL", HttpStatus.BAD_REQUEST)

    //     const mongoId = course['_id']
    //     const elasticCourse = {
    //         ...createCourseDto,
    //         mongoId
    //     }
    //     const res = await this.searchService.insertDocumentToElastic(elasticCourse);
    //     return new ResponseSuccess("COURSE.CRESTE_SUCCESS", res);
    // }

    
}



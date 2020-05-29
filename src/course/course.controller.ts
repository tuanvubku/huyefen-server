import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { SearchService } from 'src/search/search.service';
import { ResponseSuccess } from 'src/utils/dto/response.dto';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';

@Controller('courses')
export class CourseController {
    
    constructor(private readonly courseService: CourseService,
                private readonly searchService: SearchService) {}

    @Post()
    async createCourse(@Body() createCourseDto: CreateCourseDto){
        const course = await this.courseService.createCourse(createCourseDto);
        if(!course) 
            throw new HttpException("COURSE.CREATE_FAIL", HttpStatus.BAD_REQUEST)

        const mongoId = course['_id']
        const elasticCourse = {
            ...createCourseDto,
            mongoId
        }
        const res = await this.searchService.insertDocumentToElastic(elasticCourse);
        return new ResponseSuccess("COURSE.CRESTE_SUCCESS", res);
    }

    
}


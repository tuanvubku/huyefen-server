import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { SearchService } from '@/search/search.service';
import { ResponseSuccess } from '@/utils/utils';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';

@Controller('courses')
export class CourseController {
    
    constructor(private readonly courseService: CourseService,
                private readonly searchService: SearchService) {}

    @Post()
    async createCourse(@Body() createCourseDto: CreateCourseDto){
        const course = this.courseService.createCourse(createCourseDto);
        if(!course) 
            throw new HttpException("COURSE.CREATE_FAIL", HttpStatus.BAD_REQUEST)
        const res = await this.searchService.insertDocumentToElastic(createCourseDto);
        return new ResponseSuccess("SUCCESS", res);
    }

    
}

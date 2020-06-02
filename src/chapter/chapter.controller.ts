import { Controller, Put, Post, UseGuards, Req, Body, NotFoundException, ForbiddenException, Param } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/utils/guards/roles.guard';
import { Roles } from '@/utils/decorators/roles.decorator';
import { Role } from '@/config/constants';
import { IResponse } from '@/utils/interfaces/response.interface';
import { IChapter } from './interfaces/chapter.interface';
import { CreateDto } from './dtos/create.dto';
import { CourseService } from '@/course/course.service';
import { ResponseSuccess } from '@/utils/utils';
import { UpdateParamDto, UpdateDto } from './dtos/update.dto';

@Controller('chapters')
export class ChapterController {
    constructor (
        private readonly chapterService: ChapterService,
        private readonly courseService: CourseService
    ) {}

    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async create(@Req() req, @Body() body: CreateDto): Promise<IResponse<{ progress: number, data: IChapter }>> {
        const teacherId: string = req.user._id;
        const { courseId, title, description } = body;
        const checkCourse = await this.courseService.validateCourse(courseId);
        if (!checkCourse)
            throw new NotFoundException('Invalid course');
        const checkAuthor: boolean = await this.courseService.validateTeacherCourse(teacherId, courseId);
        if (!checkAuthor)
            throw new ForbiddenException('Forbidden to access this course');
        const chapter: { progress: number, data: IChapter } = await this.chapterService.create(teacherId, courseId, title, description);
        return new ResponseSuccess('CREATE_CHAPTER_OK', chapter);
    }

    @Put('/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async update(
        @Req() req,
        @Param() params: UpdateParamDto,
        @Body() body: UpdateDto
    ): Promise<IResponse<IChapter>> {
        const teacherId: string = req.user._id;
        const chapterId: string = params.id;
        const { title, description } = body;
        const checkChapter: { status: boolean, courseId: string } = await this.chapterService.validateChapter(chapterId);
        if (!checkChapter.status)
            throw new NotFoundException('Invalid chapter');
        const courseId: string = checkChapter.courseId;
        const checkAuthor: boolean = await this.courseService.validateTeacherCourse(teacherId, courseId);
        if (!checkAuthor)
            throw new ForbiddenException('Forbidden to access this course');
        const chapter: IChapter = await this.chapterService.update(teacherId, chapterId, title, description);
        return new ResponseSuccess<IChapter>('UPDATE_CHAPTER_OK', chapter);
    }
}

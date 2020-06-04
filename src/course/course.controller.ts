import { Body, Controller, Query, Get, Put, Post, UseGuards, Req, ValidationPipe, Param, ParseUUIDPipe, ForbiddenException, NotFoundException, UsePipes, Res, BadRequestException, Delete, MethodNotAllowedException } from '@nestjs/common';
import { CourseService } from './course.service';
import { SearchService } from '@/search/search.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/utils/guards/roles.guard';
import { Roles } from '@/utils/decorators/roles.decorator';
import { Role, HistoryType } from '@/config/constants';
import { ICourse } from './interfaces/course.interface';
import { IResponse } from '@/utils/interfaces/response.interface';
import { ResponseSuccess } from '@/utils/utils';
import { CreateDto } from './dtos/create.dto';
import { FetchDto } from './dtos/fetch.dto';
import { FetchInfoDto } from './dtos/fetchInfo.dto';
import { FetchGoalsDto } from './dtos/fetchGoals.dto';
import { SyllabusDto, CreateChapterDto, CreateChapterParamDto, UpdateChapterDto, UpdateChapterParamDto, DeleteChapterParamDto, CreateLectureDto, CreateLectureParamDto, UpdateLectureDto, UpdateLectureParamDto, DeleteLectureParamDto } from './dtos/syllabus.dto';
import { FetchHistoriesDto, FetchHistoriesParamDto } from './dtos/histories.dto';
import { UpdateGoalsDto, UpdateGoalsParamDto } from './dtos/goals.dto';
import { FetchLandingDto, UpdateLandingDto, UpdateLandingParamDto } from './dtos/landing.dto';
import { IWhatLearn } from './interfaces/whatLearn.interface';
import { IRequirement } from './interfaces/requirement.interface';
import { ITargetStudent } from './interfaces/targetStudent.interface';
import { IChapter } from '@/chapter/interfaces/chapter.interface';
import { ILecture } from '@/chapter/interfaces/lecture.interface';
import { IHistory } from '@/history/interfaces/history.interface';
import { ChapterService } from '@/chapter/chapter.service';
import { HistoryService } from '@/history/history.service';

@Controller('courses')
export class CourseController {
    constructor (
        private readonly courseService: CourseService,
        private readonly chapterService: ChapterService,
        private readonly historyService: HistoryService,
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
    ): Promise<IResponse<{ progress: number, data: IWhatLearn[] }>> {
        const teacherId: string = req.user._id;
        const courseId: string = params.id;
        const check = await this.courseService.validateTeacherCourse(teacherId, courseId);
        if (!check)
            throw new ForbiddenException('Forbidden. You can not access this course');
        const whatLearns: { progress: number, data: IWhatLearn[] } = await this.courseService.updateWhatLearns(teacherId, courseId, body);
        if (!whatLearns)
            throw new NotFoundException('The course do not existed!');
        await this.historyService.push(
            courseId,
            teacherId,
            `Update course's item what will learns`,
            HistoryType.Syllabus
        );
        return new ResponseSuccess('CHANGE_WHAT_LEARN_OK', whatLearns);
    }
    
    @Put('update/:id/requirements')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async updateRequirements(
        @Req() req,
        @Param() params: UpdateGoalsParamDto,
        @Body() body: UpdateGoalsDto
    ): Promise<IResponse<{ progress: number, data: IRequirement[] }>> {
        const teacherId: string = req.user._id;
        const courseId: string = params.id;
        const check = await this.courseService.validateTeacherCourse(teacherId, courseId);
        if (!check)
            throw new ForbiddenException('Forbidden. You can not access this course');
        const requirements: { progress: number, data: IRequirement[] } = await this.courseService.updateRequirements(teacherId, courseId, body);
        if (!requirements)
            throw new NotFoundException('The course do not existed!');
        await this.historyService.push(
            courseId,
            teacherId,
            `Update course's requirements`,
            HistoryType.Syllabus
        );
        return new ResponseSuccess('CHANGE_REQUIREMENTS_OK', requirements);
    }

    @Put('update/:id/target-students')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async updateTargetStudents(
        @Req() req,
        @Param() params: UpdateGoalsParamDto,
        @Body() body: UpdateGoalsDto
    ): Promise<IResponse<{ progress: number, data: ITargetStudent[] }>> {
        const teacherId: string = req.user._id;
        const courseId: string = params.id;
        const check = await this.courseService.validateTeacherCourse(teacherId, courseId);
        if (!check)
            throw new ForbiddenException('Forbidden. You can not access this course');
        const targetStudents: { progress: number, data: ITargetStudent[] } = await this.courseService.updateTargetStudents(teacherId, courseId, body);
        if (!targetStudents)
            throw new NotFoundException('The course do not existed!');
        await this.historyService.push(
            courseId,
            teacherId,
            `Update course's target students`,
            HistoryType.Goals
        );
        return new ResponseSuccess('CHANGE_TARGET_STUDENTS_OK', targetStudents);
    }

    @Get('/:id/histories')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async fetchHistories(
        @Req() req,
        @Param() params: FetchHistoriesParamDto,
        @Query() query: FetchHistoriesDto
    ): Promise<IResponse<IHistory[]>> {
        const teacherId = req.user._id;
        const courseId = params.id;
        let { sort, page, limit } = query;
        page = Number(page);
        limit = Number(limit);
        const checkCourse = await this.courseService.validateCourse(courseId);
        if (!checkCourse)
            throw new NotFoundException('Invalid course');
        const checkAuthor: boolean = await this.courseService.validateTeacherCourse(teacherId, courseId);
        if (!checkAuthor)
            throw new ForbiddenException('Forbidden to access this course');
        const histories: IHistory[] = await this.historyService.fetch(courseId, sort, page, limit);
        return new ResponseSuccess<IHistory[]>('FETCH_HISTORY_OK', histories);
    }

    @Get('/:id/syllabus')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async fetchSyllabus(@Req() req, @Param() params: SyllabusDto): Promise<IResponse<IChapter[]>> {
        const teacherId: string = req.user._id;
        const courseId: string = params.id;
        const checkCourse = await this.courseService.validateCourse(courseId);
        if (!checkCourse)
            throw new NotFoundException('Invalid course');
        const checkAuthor: boolean = await this.courseService.validateTeacherCourse(teacherId, courseId);
        if (!checkAuthor)
            throw new ForbiddenException('Forbidden to access this course');
        const syllabus: IChapter[] = await this.chapterService.fetchSyllabus(courseId);
        return new ResponseSuccess<IChapter[]>('FETCH_SYLLABUS_OK', syllabus);
    }

    @Post('/:id/chapters')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async createChapter(
        @Req() req,
        @Param() params: CreateChapterParamDto,
        @Body() body: CreateChapterDto
    ): Promise<IResponse<{ progress: number, data: IChapter }>> {
        const teacherId: string = req.user._id;
        const courseId: string = params.id;
        const { title, description } = body;
        const checkCourse = await this.courseService.validateCourse(courseId);
        if (!checkCourse)
            throw new NotFoundException('Invalid course');
        const checkAuthor: boolean = await this.courseService.validateTeacherCourse(teacherId, courseId);
        if (!checkAuthor)
            throw new ForbiddenException('Forbidden to access this course');
        const chapter: { progress: number, data: IChapter } = await this.courseService.createChapter(teacherId, courseId, title, description);
        await this.historyService.push(
            courseId,
            teacherId,
            `Create new chapter: ${title}`,
            HistoryType.Syllabus
        );
        return new ResponseSuccess('CREATE_CHAPTER_OK', chapter);
    }

    @Put('/:courseId/chapters/:chapterId')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async updateChapter(
        @Req() req,
        @Param() params: UpdateChapterParamDto,
        @Body() body: UpdateChapterDto
    ): Promise<IResponse<IChapter>> {
        const teacherId: string = req.user._id;
        const { courseId, chapterId } = params;
        const { title, description } = body;
        const checkChapter = await this.chapterService.validateChapter(courseId, chapterId);
        if (checkChapter === 0)
            throw new NotFoundException('Invalid chapter');
        else if (checkChapter === -1)
            throw new BadRequestException('Chapter doesn\'t belong to course');
        const checkAuthor: boolean = await this.courseService.validateTeacherCourse(teacherId, courseId);
        if (!checkAuthor)
            throw new ForbiddenException('Forbidden to access this course');
        const chapter: IChapter = await this.chapterService.update(teacherId, chapterId, title, description);
        await this.historyService.push(
            courseId,
            teacherId,
            `Update chapter ${title}, description: ${description}`,
            HistoryType.Syllabus
        );
        return new ResponseSuccess<IChapter>('UPDATE_CHAPTER_OK', chapter);
    }

    @Delete('/:courseId/chapters/:chapterId')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async deleteChapter(
        @Req() req,
        @Param() params: DeleteChapterParamDto
    ): Promise<IResponse<{ progress: number, data: string }>> {
        const teacherId: string = req.user._id;
        const { courseId, chapterId } = params;
        const checkAuthor: boolean = await this.courseService.validateTeacherCourse(teacherId, courseId);
        if (!checkAuthor)
            throw new ForbiddenException('Forbidden to access this course');
        const deleteResult = await this.courseService.deleteChapter(courseId, chapterId);
        if (!deleteResult.status)
            throw new NotFoundException('Not founded chapter!');
        await this.historyService.push(
            courseId,
            teacherId,
            `Delete one chapter of course`,
            HistoryType.Syllabus
        );
        return new ResponseSuccess('DELETE_CHAPTER_OK', deleteResult.data);
    }

    @Post('/:courseId/chapters/:chapterId/lectures')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async createLecture(
        @Req() req,
        @Param() params: CreateLectureParamDto,
        @Body() body: CreateLectureDto
    ): Promise<IResponse<{ progress: number, data: ILecture }>> {
        const teacherId: string = req.user._id;
        const { courseId, chapterId } = params;
        const { title, type } = body;
        const checkAuthor: boolean = await this.courseService.validateTeacherCourse(teacherId, courseId);
        if (!checkAuthor)
            throw new ForbiddenException('Forbidden to access this course');
        const { status, data: lecture } = await this.courseService.createLecture(teacherId, courseId, chapterId, title, type);
        if (!status)
            throw new NotFoundException('Not founded chapter!');
        await this.historyService.push(
            courseId,
            teacherId,
            `Create new lecture: ${title}`,
            HistoryType.Syllabus
        );
        return new ResponseSuccess('CREATE_LECTURE_OK', { progress: 100, data: lecture });
    }

    @Put('/:courseId/chapters/:chapterId/lectures/:lectureId')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async updateLecture(
        @Req() req,
        @Param() params: UpdateLectureParamDto,
        @Body() body: UpdateLectureDto
    ): Promise<IResponse<ILecture>> {
        const teacherId: string = req.user._id;
        const { courseId, chapterId, lectureId } = params;
        const { title, type } = body;
        const checkAuthor: boolean = await this.courseService.validateTeacherCourse(teacherId, courseId);
        if (!checkAuthor)
            throw new ForbiddenException('Forbidden to access this course');
        const { status, data: lecture } = await this.chapterService.updateLecture(teacherId, courseId, chapterId, lectureId, title, type);
        if (status === 0)
            throw new NotFoundException('Not founded lecture!');
        else if (status === -1)
            throw new MethodNotAllowedException('You can not change type of existed lecture');
        await this.historyService.push(
            courseId,
            teacherId,
            `Update lecture with title ${title} and type ${type}`,
            HistoryType.Syllabus
        );
        return new ResponseSuccess<ILecture>('UPDATE_LECTURE_OK', lecture)
    }

    @Delete('/:courseId/chapters/:chapterId/lectures/:lectureId')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async deleteLecture (
        @Req() req,
        @Param() params: DeleteLectureParamDto
    ): Promise<IResponse<{ progress: number, data: string }>> {
        const teacherId: string = req.user._id;
        const { courseId, chapterId, lectureId } = params;
        const checkAuthor: boolean = await this.courseService.validateTeacherCourse(teacherId, courseId);
        if (!checkAuthor)
            throw new ForbiddenException('Forbidden to access this course');
        const { status, data } = await this.courseService.deleteLecture(courseId, chapterId, lectureId);
        if (!status)
            throw new NotFoundException('Not founded lecture!');
        await this.historyService.push(
            courseId,
            teacherId,
            `Delete one lecture in this course`,
            HistoryType.Syllabus
        );
        return new ResponseSuccess('DELETE_LECTURE_OK', data);
    }

    @Get('/:id/landing')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async fetchLanding(@Req() req, @Param() params: FetchLandingDto): Promise<IResponse<any>> {
        const teacherId: string = req.user._id;
        const courseId: string = params.id;
        const checkAuthor: boolean = await this.courseService.validateTeacherCourse(teacherId, courseId);
        if (!checkAuthor)
            throw new ForbiddenException('Forbidden to access this course');
        const landing = await this.courseService.fetchLanding(courseId);
        if (!landing)
            throw new NotFoundException('Invalid course!');
        return new ResponseSuccess('FETCH_LANDING_OK', landing);
    }

    @Put('/:id/landing')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async updateLanding(@Req() req, @Param() params: UpdateLandingParamDto, @Body() body: UpdateLandingDto): Promise<IResponse<any>> {
        console.log('WTF');
        const teacherId: string = req.user._id;
        const courseId: string = params.id;
        const checkAuthor: boolean = await this.courseService.validateTeacherCourse(teacherId, courseId);
        if (!checkAuthor)
            throw new ForbiddenException('Forbidden to access this course');
        const landing = await this.courseService.updateLanding(courseId, body);
        if (!landing) throw new NotFoundException('Invalid course!');
        return new ResponseSuccess('UPDATE_LANDING_OK', landing);
    }
}
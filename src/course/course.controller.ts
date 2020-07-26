import { AuthorService } from '@/author/author.service';
import { ChapterService } from '@/chapter/chapter.service';
import { IChapter } from '@/chapter/interfaces/chapter.interface';
import { ILecture } from '@/chapter/interfaces/lecture.interface';
import { HistoryType, Permission, Price, Privacy, Role, ValidateStatus } from '@/config/constants';
import { HistoryService } from '@/history/history.service';
import { IHistory } from '@/history/interfaces/history.interface';
import { SearchService } from '@/search/search.service';
import { TeacherService } from '@/teacher/teacher.service';
import { Roles } from '@/utils/decorators/roles.decorator';
import { User } from '@/utils/decorators/user.decorator';
import { RolesGuard } from '@/utils/guards/roles.guard';
import { IResponse } from '@/utils/interfaces/response.interface';
import { ResponseSuccess } from '@/utils/utils';
import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, MethodNotAllowedException, NotFoundException, Param, Post, Put, Query, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CourseService } from './course.service';
import { CreateDto } from './dtos/create.dto';
import { FetchDto } from './dtos/fetch.dto';
import { FetchGoalsDto } from './dtos/fetchGoals.dto';
import { FetchInfoDto } from './dtos/fetchInfo.dto';
import { UpdateGoalsDto, UpdateGoalsParamDto } from './dtos/goals.dto';
import { FetchHistoriesDto, FetchHistoriesParamDto } from './dtos/histories.dto';
import { FetchLandingDto, UpdateAvatarDto, UpdateAvatarParamDto, UpdateLandingDto, UpdateLandingParamDto } from './dtos/landing.dto';
import { FetchMessagesParamDto, UpdateMessagesDto, UpdateMessagesParamDto } from './dtos/messages.dto';
import { FetchPriceDto, UpdatePriceDto, UpdatePriceParamDto } from './dtos/price.dto';
import { PrivacyDto } from './dtos/privacy.dto';
import { CreateChapterDto, CreateChapterParamDto, CreateLectureDto, CreateLectureParamDto, DeleteChapterParamDto, DeleteLectureParamDto, SyllabusDto, UpdateChapterDto, UpdateChapterParamDto, UpdateLectureDto, UpdateLectureParamDto } from './dtos/syllabus.dto';
import { ValidateParamDto } from './dtos/validate.dto';
import { ICourse } from './interfaces/course.interface';
import { IRequirement } from './interfaces/requirement.interface';
import { ITargetStudent } from './interfaces/targetStudent.interface';
import { IWhatLearn } from './interfaces/whatLearn.interface';
import { IAuthor } from '@/author/interfaces/author.interface';
import { StudentService } from '@/student/student.service';
import { ReviewTeacherService } from '@/review-teacher/review-teacher.service';
import { ReviewCourseService } from '@/review-course/review-course.service';
import { ReviewCourseDto } from '../course/dtos/review.course.dto';
import { IReviewCourse } from '@/review-course/interfaces/review.course.interface';
import { AnswerReviewDto } from './dtos/answerReview.dto';
import { RelaxGuard } from '@/utils/guards/relaxAuth.guard';

@Controller('api/courses')
export class CourseController {
    constructor(
        private readonly courseService: CourseService,
        private readonly chapterService: ChapterService,
        private readonly historyService: HistoryService,
        private readonly authorService: AuthorService,
        private readonly searchService: SearchService,
        private readonly teacherService: TeacherService,
        private readonly studentService: StudentService,
        private readonly reviewTeacherService: ReviewTeacherService,
        private readonly reviewCourseService: ReviewCourseService
    ) { }

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
    ): Promise<IResponse<any>> {
        const teacherId: string = req.user._id;
        const coursesData = await this.courseService.fetch(teacherId, query.sort, Number(query.page), Number(query.limit));
        return new ResponseSuccess('FETCH_OK', coursesData);
    }

    @Get('/:id/info')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async fetchInfo(@Req() req, @Param() params: FetchInfoDto): Promise<IResponse<any>> {
        const { id: courseId } = params;
        const teacherId: string = req.user._id;
        const check = await this.authorService.validateTeacherCourse(teacherId, courseId);
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
        const check = await this.authorService.validateTeacherCourse(teacherId, courseId);
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
        const check = await this.authorService.validateTeacherCourse(teacherId, courseId);
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
        const check = await this.authorService.validateTeacherCourse(teacherId, courseId);
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
        const check = await this.authorService.validateTeacherCourse(teacherId, courseId);
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
    ): Promise<IResponse<{ hasMore: boolean, list: IHistory[] }>> {
        const teacherId = req.user._id;
        const courseId = params.id;
        let { sort, page, limit } = query;
        page = Number(page);
        limit = Number(limit);
        const checkCourse = await this.courseService.validateCourse(courseId);
        if (!checkCourse)
            throw new NotFoundException('Invalid course');
        const checkAuthor: boolean = await this.authorService.validateTeacherCourse(teacherId, courseId);
        if (!checkAuthor)
            throw new ForbiddenException('Forbidden to access this course');
        const historyDatas = await this.historyService.fetch(courseId, sort, page, limit);
        return new ResponseSuccess('FETCH_HISTORY_OK', historyDatas);
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
        const checkAuthor: boolean = await this.authorService.validateTeacherCourse(teacherId, courseId);
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
        const checkAuthor: boolean = await this.authorService.validateTeacherCourse(teacherId, courseId);
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
        const checkAuthor: boolean = await this.authorService.validateTeacherCourse(teacherId, courseId);
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
        const checkAuthor: boolean = await this.authorService.validateTeacherCourse(teacherId, courseId);
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
        const checkAuthor: boolean = await this.authorService.validateTeacherCourse(teacherId, courseId);
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
        const checkAuthor: boolean = await this.authorService.validateTeacherCourse(teacherId, courseId);
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
    async deleteLecture(
        @Req() req,
        @Param() params: DeleteLectureParamDto
    ): Promise<IResponse<{ progress: number, data: string }>> {
        const teacherId: string = req.user._id;
        const { courseId, chapterId, lectureId } = params;
        const checkAuthor: boolean = await this.authorService.validateTeacherCourse(teacherId, courseId);
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

    @Get('/:id/chapters/detail')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher, Role.User)
    async fetchChaptersDetail(
        @Req() req,
        @Param('id') courseId: string
    ): Promise<IResponse<any>> {
        const { 
            _id: userId,
            role: userRole
        } = req.user;
        if (userRole === Role.User) {
            const checkStatus: boolean = await this.studentService.validateUserCourse(userId, courseId);
            if (!checkStatus)
                throw new ForbiddenException('You do not have permission!');
        }
        else {
            const checkStatus: boolean = await this.authorService.validateTeacherCourse(userId, courseId);
            if (!checkStatus)
                throw new ForbiddenException('You do not have permission!');
        }
        const chaptersDetail = await this.chapterService.fetchChapters(courseId);
        return new ResponseSuccess<any>('FETCH_OK', chaptersDetail);
    }

    @Get('/:id/landing')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async fetchLanding(@Req() req, @Param() params: FetchLandingDto): Promise<IResponse<any>> {
        const teacherId: string = req.user._id;
        const courseId: string = params.id;
        const checkAuthor: boolean = await this.authorService.validateTeacherCourse(teacherId, courseId);
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
        const teacherId: string = req.user._id;
        const courseId: string = params.id;
        const checkAuthor: boolean = await this.authorService.validateTeacherCourse(teacherId, courseId);
        if (!checkAuthor)
            throw new ForbiddenException('Forbidden to access this course');
        const { status, data } = await this.courseService.updateLanding(courseId, body);
        if (!status) throw new NotFoundException('Invalid course!');
        await this.historyService.push(
            courseId,
            teacherId,
            `Update basic information of course`,
            HistoryType.Landing
        );
        return new ResponseSuccess('UPDATE_LANDING_OK', data);
    }

    @Put('/:id/avatar')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async updateAvatar(@Req() req, @Param() params: UpdateAvatarParamDto, @Body() body: UpdateAvatarDto): Promise<IResponse<any>> {
        const teacherId: string = req.user._id;
        const courseId: string = params.id;
        const checkAuthor: boolean = await this.authorService.validateTeacherCourse(teacherId, courseId);
        if (!checkAuthor)
            throw new ForbiddenException('Forbidden to access this course');
        const url: string = body.url;
        const { status, data } = await this.courseService.updateAvatar(courseId, url);
        if (!status) throw new NotFoundException('Invalid course!');
        await this.historyService.push(
            courseId,
            teacherId,
            `Change avatar of course`,
            HistoryType.Landing
        );
        return new ResponseSuccess('UPDATE_AVATAR_OK', data);
    }

    @Get('/:id/price')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async fetchPrice(@Req() req, @Param() params: FetchPriceDto): Promise<IResponse<Price>> {
        const teacherId: string = req.user._id;
        const courseId: string = params.id;
        const checkAuthor: boolean = await this.authorService.validateTeacherCourse(teacherId, courseId);
        if (!checkAuthor)
            throw new ForbiddenException('Forbidden to access this course');
        const price: Price | false = await this.courseService.fetchPrice(courseId);
        if (price === false) throw new NotFoundException('Invalid course!!');
        return new ResponseSuccess<Price>('FETCH_PRICE_OK', price);
    }

    @Put('/:id/price')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async updatePrice(
        @Req() req,
        @Param() params: UpdatePriceParamDto,
        @Body() body: UpdatePriceDto
    ): Promise<IResponse<{ progress: number, data: Price }>> {
        const teacherId: string = req.user._id;
        const courseId: string = params.id;
        const checkAuthor: boolean = await this.authorService.validateTeacherCourse(teacherId, courseId);
        if (!checkAuthor)
            throw new ForbiddenException('Forbidden to access this course');
        const price: Price = body.price;
        const { status, data } = await this.courseService.updatePrice(courseId, price);
        if (!status) throw new NotFoundException('Invalid course!!');
        await this.historyService.push(
            courseId,
            teacherId,
            `Change price of course`,
            HistoryType.Price
        )
        return new ResponseSuccess('UPDATE_PRICE_OK', data);
    }

    @Get('/:id/messages')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async fetchMessages(@Req() req, @Param() params: FetchMessagesParamDto): Promise<IResponse<any>> {
        const teacherId: string = req.user._id;
        const courseId: string = params.id;
        const checkAuthor: boolean = await this.authorService.validateTeacherCourse(teacherId, courseId);
        if (!checkAuthor)
            throw new ForbiddenException('Forbidden to access this course');
        const messages = await this.courseService.fetchMessages(courseId);
        if (!messages) throw new NotFoundException('Invalid course!!!!');
        return new ResponseSuccess('FETCH_MESS_OK', messages);
    }

    @Put('/:id/messages')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async updateMessages(
        @Req() req,
        @Param() params: UpdateMessagesParamDto,
        @Body() body: UpdateMessagesDto
    ): Promise<IResponse<{ progress: number, data: any }>> {
        const teacherId: string = req.user._id;
        const courseId: string = params.id;
        const checkAuthor: boolean = await this.authorService.validateTeacherCourse(teacherId, courseId);
        if (!checkAuthor)
            throw new ForbiddenException('Forbidden to access this course');
        const { welcome, congratulation } = body;
        const { status, data } = await this.courseService.updateMessages(courseId, welcome, congratulation);
        if (!status) throw new NotFoundException('Invalid course!!');
        await this.historyService.push(
            courseId,
            teacherId,
            `Change messages of course`,
            HistoryType.Price
        )
        return new ResponseSuccess('UPDATE_PRICE_OK', data);
    }

    @Get('/:id/validate')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async validate(
        @Req() req,
        @Param() params: ValidateParamDto
    ): Promise<IResponse<ValidateStatus>> {
        const teacherId: string = req.user._id;
        const courseId: string = params.id;
        let status: ValidateStatus = ValidateStatus.OK;
        const checkCourse = await this.courseService.validateCourse(courseId);
        if (!checkCourse)
            status = ValidateStatus.InvalidCourse;
        else {
            const checkAuthor: boolean = await this.authorService.validateTeacherCourse(teacherId, courseId);
            if (!checkAuthor) status = ValidateStatus.InvalidTeacher;
        }
        return new ResponseSuccess<ValidateStatus>('VALIDATE_OK', status);
    }

    @Put('/:courseId/privacy')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async updatePrivacy(
        @User() teacher,
        @Body() privacyDto: PrivacyDto,
        @Param('courseId') courseId: string
    ) {
        const { value, password } = privacyDto;
        if (value == Privacy.Password && password == null)
            throw new BadRequestException("Password is null")
        const teacherId = teacher._id;
        const check = await this.authorService.validateTeacherCourse(teacherId, courseId);
        if (!check)
            throw new ForbiddenException('Forbidden. You can not access this course');
        const hasPermission = this.authorService.checkPermission(teacherId, courseId, Permission.Privacy);
        if (!hasPermission)
            throw new ForbiddenException("You are not authorized to edit this course!");
        const { status } = await this.courseService.updatePrivacy(courseId, value, password);
        if (!status)
            throw new NotFoundException('Invalid course!!');
        return new ResponseSuccess('UPDATE_PRIVACY_OK', status);
    }

    @Post('/:courseId/invite')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async createInvite(
        @User() teacher,
        @Body('email') email: string,
        @Param('courseId') courseId: string
    ) {
        const teacherId = teacher._id;
        const hasPermission = await this.authorService.checkPermission(teacherId, courseId, Permission.Invite);
        if (!hasPermission)
            throw new ForbiddenException("You are do not have permission!");
        const courseTitle: string = await this.courseService.fetchCourseTitleById(courseId)
        const status = await this.teacherService.invite(teacherId, courseId, courseTitle, email);
        if (!status)
            throw new NotFoundException('Invalid teacher');
        return new ResponseSuccess('UPDATE_NOTIFICATION_OK', null);
    }

    @Delete('/:courseId/members/:memberId')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async removeCoTeacher(
        @User() teacher,
        @Param('courseId') courseId: string,
        @Param('memberId') memberId: string
    ) {
        const teacherId = teacher._id;
        const hasPermission = await this.authorService.checkPermission(teacherId, courseId, Permission.Default);
        if (!hasPermission)
            throw new ForbiddenException("You do not have permission to access this course!");
        const status = await this.courseService.deleteAuthor(memberId, courseId);
        if (!status)
            throw new NotFoundException('Invalid author and course!!');
        return new ResponseSuccess("DELETE_OK", true);

    }

    @Get('/:courseId/members')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async fetchAllAuthors(
        @User() teacher,
        @Param('courseId') courseId: string
    ): Promise<IResponse<IAuthor[]>> {
        const teacherId = teacher._id;
        const check = await this.authorService.validateTeacherCourse(teacherId, courseId);
        if (!check)
            throw new ForbiddenException('Forbidden. You can not access this course');
        const allAuthors = await this.authorService.fetchAllAuthors(courseId);
        return new ResponseSuccess<IAuthor[]>("FETCH_OK", allAuthors);
    }

    @Put('/:courseId/members')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async updatePermission(
        @User() teacher,
        @Body() body,
        @Param('courseId') courseId: string
    ): Promise<IResponse<Boolean>> {
        const teacherId = teacher._id;
        const hasPermission = await this.authorService.checkPermission(teacherId, courseId, Permission.Default);
        if (!hasPermission)
            throw new ForbiddenException("You are not authorized to edit this course!");
        const status = await this.authorService.updatePermission(courseId, body);
        return new ResponseSuccess<Boolean>("UPDATE_OK", status);
    }

    @Get('/:courseId/permission')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async fetchPermission(
        @User() teacher,
        @Query("type") type: string,
        @Param('courseId') courseId: string
    ): Promise<IResponse<any>> {
        const teacherId = teacher._id;
        const check = await this.authorService.validateTeacherCourse(teacherId, courseId);
        if (!check)
            throw new ForbiddenException('Forbidden. You can not access this course');
        const result = await this.authorService.fetchPermission(teacherId, courseId, type);
        return new ResponseSuccess<any>("FETCH_OK", result);
    }

    @Get('/:courseId/overview/public')
    async fetchCourseOverview(
        @Param('courseId') courseId
    ): Promise<IResponse<Object>> {
        const overview = await this.courseService.fetchCourseOverview(courseId);
        if (!overview)
            throw new NotFoundException("Invalid course");
        return new ResponseSuccess<Object>("FETCH_OVERVIEW_OK", overview);
    }

    @Get('/:courseId/instructors/public')
    async fetchInstructorsPublic(
        @Param('courseId') courseId
    ): Promise<IResponse<Object>> {
        const instructors = await this.courseService.fetchInstructors(courseId);
        if (!instructors)
            throw new NotFoundException("Invalid course");
        return new ResponseSuccess<Object>("FETCH_INSTRUCTORS_OK", instructors);
    }

    @Get('/:id/info/user')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async fetchInfoForUser(@Req() req, @Param('id') courseId: string): Promise<IResponse<any>> {
        const userId: string = req.user._id;
        const checkStatus: boolean = await this.studentService.validateUserCourse(userId, courseId);
        if (!checkStatus)
            throw new ForbiddenException('You don\'t have permission to access this course!');
        const courseInfo = await this.courseService.fetchInfoForUser(courseId);
        if (!courseInfo)
            throw new NotFoundException('Invalid course');
        return new ResponseSuccess('FETCHOK', courseInfo);
    }

    @Get('/:id/overview')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async fetchOverview(
        @Req() req,
        @Param('id') courseId: string
    ): Promise<IResponse<any>> {
        const userId: string = req.user._id;
        const checkStatus: boolean = await this.studentService.validateUserCourse(userId, courseId);
        if (!checkStatus)
            throw new ForbiddenException('You don\'t have permission to access this course!');
        const courseOverview = await this.courseService.fetchOverview(courseId);
        if (!courseOverview)
            throw new NotFoundException('Invalid course');
        return new ResponseSuccess('FETCH_OVERVIEW_OK', courseOverview);
    }

    @Get('/:id/instructors')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async fetchInstructors(
        @Req() req,
        @Param('id') courseId: string
    ): Promise<IResponse<any>> {
        const userId: string = req.user._id;
        const checkStatus: boolean = await this.studentService.validateUserCourse(userId, courseId);
        if (!checkStatus)
            throw new ForbiddenException('You don\'t have permission to access this course!');
        const instructors = await this.authorService.fetchInstructors(courseId);
        if (!instructors)
            throw new NotFoundException('Invalid course');
        return new ResponseSuccess('FETCH_INSTRUCTOR_OK', instructors);
    }

    @Get('/:id/reviews')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async fetchMyReviewCourse(
        @User() user,
        @Param('id') courseId: string
    ): Promise<IResponse<IReviewCourse[]>> {
        const userId = user._id;
        const checkStatus: boolean = await this.studentService.validateUserCourse(userId, courseId);
        if (!checkStatus)
            throw new ForbiddenException('You don\'t have permission to access this course!');
        const reviews = await this.reviewCourseService.fetchReviews(userId, courseId);
        return new ResponseSuccess<IReviewCourse[]>("FETCH_REVIEWS_COURSE_OK", reviews);
    }

    @Post('/:id/reviews')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async createReviewCourse(
        @User() user,
        @Body() body: ReviewCourseDto,
        @Param('id') courseId: string
    ): Promise<IResponse<any>> {
        const userId = user._id;
        const {starRating, comment} = body
        const isValidUser = await this.studentService.validateUserCourse(userId, courseId);
        if (!isValidUser)
            throw new ForbiddenException("You don\'t have permission to access this course!");
        const review: any = await this.reviewCourseService.createReview(userId, courseId, starRating, comment);
        return new ResponseSuccess<any>("CREATE_REVIEW_COURSE_OK", review);
    }

    @Get('/:id/reviews/public')
    @UseGuards(RelaxGuard)
    async fetchReviews(
        @Req() req,
        @Param('id') courseId: string,
        @Query('page', ParseIntPipe) page: number,
        @Query('limit', ParseIntPipe) limit: number
    ): Promise<IResponse<{ hasMore: boolean, list: any }>> {
        const result = await this.reviewCourseService.fetchPublicReviews(req.user, courseId, page, limit);
        return new ResponseSuccess<{ hasMore: boolean, list: any }>("FETCH_REVIEWS_COURSE_OK", result);
    }

    @Get('/:id/reviews/:reviewId')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async fetchOneReview(
        @User() user,
        @Param('id') courseId: string,
        @Param('reviewId') reviewId: string
    ): Promise<IResponse<IReviewCourse>> {
        const teacherId: string = user._id;
        const check = await this.authorService.validateTeacherCourse(teacherId, courseId);
        if (!check)
            throw new ForbiddenException('Forbidden. You can not access this course');
        const review: IReviewCourse = await this.reviewCourseService.fetchOne(courseId, reviewId);
        if (!review)
            throw new NotFoundException('Invalid review');
        return new ResponseSuccess<IReviewCourse>('FETCH_REVIEW_OK', review);
    }

    @Put('/:id/reviews/:reviewId/vote')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher, Role.User)
    async voteReview(
        @Req() req,
        @Param('id') courseId: string,
        @Param('reviewId') reviewId: string,
        @Body('value', ParseIntPipe) voteValue: number
    ): Promise<IResponse<string>> {
        const { _id: ownerId, role: ownerType } = req.user;
        const status: boolean = await this.reviewCourseService.voteReview(ownerId, ownerType, courseId, reviewId, voteValue);
        return new ResponseSuccess<string>('VOTE_OK', 'OK', status ? 0 : 1);
    }

    @Post('/:id/reviews/:reviewId/answers')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async answerReview(
        @User() user,
        @Param('id') courseId: string,
        @Param('reviewId') reviewId: string,
        @Body() body: AnswerReviewDto
    ): Promise<IResponse<any>> {
        const teacherId: string = user._id;
        const hasPermission = this.authorService.checkPermission(teacherId, courseId, Permission.Review);
        if (!hasPermission)
            throw new ForbiddenException('Forbidden. You can not answer review');
        const { answer } = body;
        const newAnswer = await this.reviewCourseService.answer(teacherId, courseId, reviewId, answer);
        if (!newAnswer)
            throw new NotFoundException('Not found review');
        return new ResponseSuccess<any>('ANSWER_OK', newAnswer);
    }

    @Put('/:id/reviews/instructor')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async updateReviewInstructor(
        @User() user,
        @Body('instructorId') instructorId: string,
        @Body('starRating') starRating: string,
        @Body('comment') comment: string,
        @Param('id') courseId: string
    ): Promise<IResponse<Boolean>> {
        const userId = user._id;
        const isValidTeacher = await this.authorService.validateTeacherCourse(instructorId, courseId);
        if (!isValidTeacher)
            throw new ForbiddenException("Teachere don\'t have permission to access this course!");
        const isValidUser = await this.studentService.validateUserCourse(userId, courseId);
        if (!isValidUser)
            throw new ForbiddenException("You don\'t have permission to access this course!");
        const status = await this.reviewTeacherService.updateReviewInstructor(userId, instructorId, parseFloat(starRating), comment);
        return new ResponseSuccess<Boolean>("UPDATE_REVIEW_OK", status);
    }

    @Get('/:id/reviews/instructor')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async fetchReviewInstructor(
        @User() user,
        @Param('id') courseId: string
    ) {
        const userId = user._id;
        const isValid = await this.studentService.validateUserCourse(userId, courseId);
        if (!isValid)
            throw new ForbiddenException(`You don\'t have permission to access this course!`);
        const reviews = await this.courseService.fetchReviewInstructor(courseId, userId);
        return new ResponseSuccess("FETCH_REVIEW_OK", reviews);
    }

    @Get('/:id/validate/user')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async validateForUser(
        @User() user,
        @Param() params: ValidateParamDto
    ): Promise<IResponse<ValidateStatus>> {
        const userId: string = user._id;
        const courseId: string = params.id;
        let status: ValidateStatus = ValidateStatus.OK;
        const checkCourse = await this.courseService.validateCourse(courseId);
        if (!checkCourse)
            status = ValidateStatus.InvalidCourse;
        else {
            const checkStudent: boolean = await this.studentService.validateUserCourse(userId, courseId);
            if (!checkStudent) status = ValidateStatus.InvalidUser;
        }
        return new ResponseSuccess<ValidateStatus>('VALIDATE_OK', status);
    }
}
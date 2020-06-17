import { Controller, Get, Post, UseGuards, Req, Body, ForbiddenException, Param, NotFoundException, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { QuestionService } from './question.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/utils/guards/roles.guard';
import { Roles } from '@/utils/decorators/roles.decorator';
import { Role } from '@/config/constants';
import { IResponse } from '@/utils/interfaces/response.interface';
import { IQuestion } from './interfaces/question.interface';
import { CreateDto } from './dtos/create.dto';
import { StudentService } from '@/student/student.service';
import { ResponseSuccess } from '@/utils/utils';
import { AuthorService } from '@/author/author.service';
import { AnswerDto, VoteAnswerDto } from './dtos/answer.dto';
import { FetchDto } from './dtos/fetch.dto';
import { IAnswer } from './interfaces/answer.interface';

@Controller('api/questions')
export class QuestionController {
    constructor (
        private readonly questionService: QuestionService,
        private readonly studentService: StudentService,
        private readonly authorService: AuthorService
    ) {}

    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async createQuestion(
        @Req() req,
        @Body() body: CreateDto
    ): Promise<IResponse<IQuestion>> {
        const userId: string = req.user._id;
        const courseId: string = body.courseId;
        const checkStatus: boolean = await this.studentService.validateUserCourse(userId, courseId);
        if (!checkStatus)
            throw new ForbiddenException('You do not have permission!');
        const question: IQuestion = await this.questionService.create(userId, body);
        return new ResponseSuccess<IQuestion>('CREATE_OK', question);
    }

    @Get('/courses/:courseId/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User, Role.Teacher)
    async fetchQuestion(
        @Req() req,
        @Param('courseId') courseId: string,
        @Param('id') questionId: string
    ): Promise<IResponse<any>> {
        const userId: string = req.user._id;
        const userRole: Role = req.user.role;
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
        const question: any = await this.questionService.fetchOne(userId, userRole, courseId, questionId);
        if (!question)
            throw new NotFoundException('Invalid question!');
        return new ResponseSuccess<any>('FETCH_ONE_OK', question);
    }

    @Post('/courses/:courseId/:id/vote')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User, Role.Teacher)
    async voteQuestion(
        @Req() req,
        @Param('courseId') courseId: string,
        @Param('id') questionId: string
    ): Promise<IResponse<boolean>> {
        const userId: string = req.user._id;
        const userRole: Role = req.user.role;
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
        const status: boolean = await this.questionService.voteQuestion(userId, userRole, courseId, questionId);
        return new ResponseSuccess<any>('FETCH_ONE_OK', status);
    }

    @Delete('/courses/:courseId/:id/unvote')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User, Role.Teacher)
    async unvoteQuestion(
        @Req() req,
        @Param('courseId') courseId: string,
        @Param('id') questionId: string
    ): Promise<IResponse<boolean>> {
        const userId: string = req.user._id;
        const userRole: Role = req.user.role;
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
        const status: boolean = await this.questionService.unvoteQuestion(userId, userRole, courseId, questionId);
        return new ResponseSuccess<any>('FETCH_ONE_OK', status);
    }

    @Post('/courses/:courseId/:id/follow')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User, Role.Teacher)
    async followQuestion(
        @Req() req,
        @Param('courseId') courseId: string,
        @Param('id') questionId: string
    ): Promise<IResponse<boolean>> {
        const userId: string = req.user._id;
        const userRole: Role = req.user.role;
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
        const status: boolean = await this.questionService.followQuestion(userId, userRole, questionId);
        return new ResponseSuccess<any>('FETCH_ONE_OK', status);
    }

    @Delete('/courses/:courseId/:id/unfollow')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User, Role.Teacher)
    async unfollowQuestion(
        @Req() req,
        @Param('courseId') courseId: string,
        @Param('id') questionId: string
    ): Promise<IResponse<boolean>> {
        const userId: string = req.user._id;
        const userRole: Role = req.user.role;
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
        const status: boolean = await this.questionService.unfollowQuestion(userId, userRole, questionId);
        return new ResponseSuccess<any>('FETCH_ONE_OK', status);
    }

    @Post('/courses/:courseId/:id/answers')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User, Role.Teacher)
    async answer(
        @Req() req,
        @Param('courseId') courseId: string,
        @Param('id') questionId: string,
        @Body() body: AnswerDto
    ): Promise<IResponse<any>> {
        const userId: string = req.user._id;
        const userRole: Role = req.user.role;
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
        const { content } = body;
        const answer = await this.questionService.answer(userId, userRole, questionId, content);
        return new ResponseSuccess<any>('CREATE_ANS_OK', answer);
    }

    @Post('/answers/:answerId/vote')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User, Role.Teacher)
    async voteAnswer(
        @Req() req,
        @Param('answerId') answerId: string,
        @Body() body: VoteAnswerDto
    ): Promise<IResponse<boolean>> {
        const userId: string = req.user._id;
        const { courseId, questionId } = body;
        const userRole: Role = req.user.role;
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
        const status = await this.questionService.voteAnswer(userId, userRole, questionId, answerId);
        return new ResponseSuccess<boolean>('VOTE_OK', status);
    }

    @Delete('/answers/:answerId/unvote')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User, Role.Teacher)
    async unvoteAnswer(
        @Req() req,
        @Param('answerId') answerId: string,
        @Query('courseId') courseId: string,
        @Query('questionId') questionId: string,
    ): Promise<IResponse<boolean>> {
        const userId: string = req.user._id;
        const userRole: Role = req.user.role;
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
        const status = await this.questionService.unvoteAnswer(userId, userRole, questionId, answerId);
        return new ResponseSuccess<boolean>('VOTE_OK', status);
    }

    @Get('/courses/:courseId/:id/answers')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User, Role.Teacher)
    async fetchAnswers(
        @Req() req,
        @Param('courseId') courseId: string,
        @Param('id') questionId: string,
        @Query('skip', ParseIntPipe) skip: number,
        @Query('limit', ParseIntPipe) limit: number
    ): Promise<IResponse<{ hasMore: boolean, list: IAnswer[] }>> {
        const userId: string = req.user._id;
        const userRole: Role = req.user.role;
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
        const result: { hasMore: boolean, list: IAnswer[] } = await this.questionService.fetchAnswers(userId, userRole, questionId, skip, limit);
        return new ResponseSuccess('FETCH_OK', result);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher, Role.User)
    async fetchQuestions(
        @Req() req,
        @Query() query: FetchDto 
    ): Promise<IResponse<{ hasMore: boolean, total: number, list: any[] }>> {
        const { 
            _id: userId,
            role: userRole
        } = req.user;
        const { courseId } = query;
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
        const result = await this.questionService.fetch(userId, userRole, query);
        return new ResponseSuccess('FETCH_OK', result);
    }
}
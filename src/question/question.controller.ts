import { Controller, Get, Post, UseGuards, Req, Body, ForbiddenException, Param, NotFoundException } from '@nestjs/common';
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

    @Get('/course/:courseId/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User, Role.Teacher)
    async fetchQuestion(
        @Req() req,
        @Param('courseId') courseId: string,
        @Param('id') questionId: string
    ): Promise<IResponse<any>> {
        const userId: string = req.user._id;
        const userRole: string = req.user.role;
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
}

import { Controller, Post, UseGuards, Req, Body, ForbiddenException } from '@nestjs/common';
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

@Controller('api/questions')
export class QuestionController {
    constructor (
        private readonly questionService: QuestionService,
        private readonly studentService: StudentService
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
}

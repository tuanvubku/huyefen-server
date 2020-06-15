import { Controller, Post, Body } from '@nestjs/common';
import { StudentService } from './student.service';
import { IResponse } from '@/utils/interfaces/response.interface';
import { ResponseSuccess } from '@/utils/utils';
import { IStudent } from './interfaces/student.interface';

@Controller('api/students')
export class StudentController {

    constructor(
        private readonly studentService: StudentService
    ) {}

    @Post('/create/test')
    async createTest(@Body() body: { userId: string, courseId: string }): Promise<IResponse<IStudent>> {
        const { userId, courseId } = body;
        const result: IStudent = await this.studentService.createTest(userId, courseId);
        return new ResponseSuccess<IStudent>('CREATE_OK', result);
    }

}

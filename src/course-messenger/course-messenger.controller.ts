import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/utils/guards/roles.guard';
import { Roles } from '@/utils/decorators/roles.decorator';
import { Role } from '@/config/constants';
import { User } from '@/utils/decorators/user.decorator';
import { IResponse } from '@/utils/interfaces/response.interface';
import { ResponseSuccess } from '@/utils/utils';
import { CourseMessengerService } from '@/course-messenger/course-messenger.service';
import { StudentService } from '@/student/student.service';

@Controller('api/course-messenger')
export class CourseMessengerController {
    constructor(
        private readonly courseMessengerService: CourseMessengerService,
        private readonly studentService: StudentService
    ) {}

    @Get('/:courseId/messages')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async getCourseMessages(
        @User() user,
        @Param('courseId') courseId: string,
        @Query('skip', ParseIntPipe) skip: number,
        @Query('limit', ParseIntPipe) limit: number
    ): Promise<IResponse<any>> {
        const userId = user._id;
        const check = await this.studentService.validateUserCourse(userId, courseId);
        if (!check)
            throw new ForbiddenException('Forbidden. You can not access this course');
        const data = await this.courseMessengerService.getMessagesOfCourse(courseId, skip, limit);
        return new ResponseSuccess('OK', data);
    }

    @Post('/:courseId/messages')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async sendTextMessage(
        @User() user,
        @Param('courseId') courseId: string,
        @Body() body: any
    ): Promise<IResponse<any>> {
        const userId: string = user._id;
        const { content } = body;
        const check = await this.studentService.validateUserCourse(userId, courseId);
        if (!check)
            throw new ForbiddenException('Forbidden. You can not access this course');
        const newMessage = await this.courseMessengerService.sendTextMessage(userId, courseId, content);
        return new ResponseSuccess('OK', newMessage);
    }

    @Get('/:courseId/members')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.User)
    async getCourseMembers(
        @User() user,
        @Param('courseId') courseId: string,
        @Query('skip', ParseIntPipe) skip: number,
        @Query('limit', ParseIntPipe) limit: number
    ): Promise<IResponse<any>> {
        const userId = user._id;
        const check = await this.studentService.validateUserCourse(userId, courseId);
        if (!check)
            throw new ForbiddenException('Forbidden. You can not access this course');
        const data = await this.courseMessengerService.getMembersOfCourse(courseId, skip, limit);
        return new ResponseSuccess('OK', data);
    }
}

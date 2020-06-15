import { CreateDto } from '@/announcement/dtos/create.dto';
import { AuthorService } from '@/author/author.service';
import { Comment, Permission, Role } from '@/config/constants';
import { TeacherService } from '@/teacher/teacher.service';
import { Roles } from '@/utils/decorators/roles.decorator';
import { User } from '@/utils/decorators/user.decorator';
import { RolesGuard } from '@/utils/guards/roles.guard';
import { IResponse } from '@/utils/interfaces/response.interface';
import { ResponseSuccess } from '@/utils/utils';
import { Body, Controller, ForbiddenException, Get, NotFoundException, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnnouncementService } from './announcement.service';
import { IAnnouncement } from './interfaces/announcement.interface';
import { IComment } from './interfaces/comment.interface';
import { UserService } from '@/user/user.service';
import * as _ from 'lodash';

@Controller('api/announcements')
export class AnnouncementController {

    constructor(
        private readonly announcementService: AnnouncementService,
        private readonly authorService: AuthorService,
        private readonly teacherService: TeacherService,
        private readonly userService: UserService
    ) { }

    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async createAnnouncement(
        @User() user,
        @Body() body: CreateDto
    ): Promise<IResponse<IAnnouncement>> {
        const teacherId = user._id;
        const { content, courseId } = body;
        const hasPermission = this.authorService.checkPermission(teacherId, courseId, Permission.Announcement);
        if (!hasPermission)
            throw new ForbiddenException("You are not authorized to create ANNOUNCEMENT this course!");
        const announcement = await this.announcementService.createAnnouncement(teacherId, courseId, content);
        return new ResponseSuccess<IAnnouncement>("CREATE_ANNOUNCEMENT_OK", announcement);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher, Role.User)
    async fetchAnnouncements(
        @User() user,
        @Query('page', ParseIntPipe) page: number,
        @Query('limit', ParseIntPipe) limit: number,
        @Query('courseId') courseId: string
    ) {
        let isValid = false;
        if (user.role === Role.Teacher) {
            isValid = await this.authorService.validateTeacherCourse(user._id, courseId);
        }
        else {
            console.log("Validate User Course");
        }
        if (!isValid)
            throw new ForbiddenException("Forbidden to access this course");
        const announcements = await this.announcementService.fetchAnnouncements(courseId, page, limit);
        return new ResponseSuccess("FETCH_OK", announcements);
    }

    @Post('/:announceId/comments')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher, Role.User)
    async createComment(
        @User() user,
        @Body('content') content: string,
        @Param('announceId') announceId: string
    ): Promise<IResponse<any>> {
        const announcement = await this.announcementService
            .findAnnouncementById(announceId);
        if (!announcement)
            throw new NotFoundException("Not Found Announcement");
        let isValid = false;
        let ownerType = "";
        let owner = null;
        const { _id, role } = user;
        const courseId = announcement.course;
        if (role === Role.Teacher) {
            isValid = await this.authorService.validateTeacherCourse(_id, courseId);
            ownerType = Comment.Teacher;
            owner = await this.teacherService.fetchIdAvatarNameById(_id);
        } else {
            //check isValid user
            ownerType = Comment.User;
            owner = await this.userService.fetchIdAvatarNameById(_id);
        }
        if (!isValid)
            throw new ForbiddenException("Forbidden to access this course");
        const comment = {
            content: content,
            owner: _id,
            ownerType: ownerType,
            createdAt: Date.now().toString()
        } as IComment;
        announcement.comments.unshift(comment);
        await this.announcementService.createComment(announcement);
        const res = {
            _id: 'new',
            ...comment,
            owner
        }
        return new ResponseSuccess("CREATE_COMMENT_OK", res);
    }

    @Get(':announceId/comments')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher, Role.User)
    async fetchComments(
        @User() user,
        @Query('page', ParseIntPipe) page: number,
        @Query('limit', ParseIntPipe) limit: number,
        @Param('announceId') announceId: string
    ) {
        const announcement = await this.announcementService
            .populateAnnouncementById(announceId);
        if (!announcement)
            throw new NotFoundException("Not Found Announcement");
        let isValid = false;
        const { _id, role } = user;
        const courseId = announcement.course;
        if (role === Role.Teacher) {
            isValid = await this.authorService.validateTeacherCourse(_id, courseId);
        } else {
            //check isValid user
        }
        if (!isValid)
            throw new ForbiddenException("Forbidden to access this course");
        const comments = announcement.comments;
        const hasMore = page * limit < _.size(comments) ? true : false;
        const list = _.slice(comments, (page - 1) * limit, page * limit);
        const res = {
            hasMore,
            list
        };
        return new ResponseSuccess("FETCH_COMMENT_OK", res);
    }
}

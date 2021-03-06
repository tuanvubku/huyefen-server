import { User } from '@/utils/decorators/user.decorator';
import { RolesGuard } from '@/utils/guards/roles.guard';
import { generateFileName, ResponseSuccess } from '@/utils/utils';
import { InjectQueue } from '@nestjs/bull';
import {
    Body,
    Controller,
    Param,
    Post,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
    ForbiddenException,
    NotAcceptableException,
    NotFoundException, ParseIntPipe, Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Queue } from 'bull';
import { diskStorage } from 'multer';
import { CloudService } from './cloud.service';
import { Roles } from '@/utils/decorators/roles.decorator';
import { Role, SIZE_LIMIT, Lecture } from '@/config/constants';
import { AuthorService } from '@/author/author.service';
import * as path from 'path'
import { lowerCase, join } from 'lodash';
import { ChapterGateway } from '@/chapter/chapter.gateway';
import * as _ from 'lodash';
import { ChapterService } from '@/chapter/chapter.service';
import {mkdirRecursive} from '@/utils/utils'

@Controller('api/cloud')
export class CloudController {

    constructor(
        private readonly cloudService: CloudService,
        private readonly configService: ConfigService,
        private readonly authorService: AuthorService,
        @InjectQueue('video') private videoQueue: Queue,
        private readonly chapterGateway: ChapterGateway,
        private readonly chapterService: ChapterService
    ) { }

    @Post('/upload/avatar')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher, Role.User)
    @UseInterceptors(FileInterceptor('avatar',
        {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const role = `${req.user["role"]}s`;
                    const filePath = `./public/${lowerCase(role)}/${req.user["_id"]}`;
                    mkdirRecursive(filePath)
                    cb(null, filePath);
                },
                filename: (req, file, cb) => {
                    generateFileName(req, file, cb);
                }
            })
        }))
    async uploadAvatar(@UploadedFile() file, @User() user) {
        const url = `${this.configService.get<string>('HOST')}/${lowerCase(user["role"])}s/${user['_id']}/${file.filename}`;
        const res = { url };
        return new ResponseSuccess<any>("UPLOAD.SUCCESS", res);
    }

    @Post('upload/course/:id/avatar')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    @UseInterceptors(FileInterceptor('avatar',
        {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const { id: courseId } = req.params;
                    const filePath = `./public/courses/avatars/${courseId}`;
                    mkdirRecursive(filePath)
                    cb(null, filePath);
                },
                filename: (req, file, cb) => {
                    generateFileName(req, file, cb);
                }
            })
        }))
    async uploadCourseAvatar(
        @UploadedFile() file,
        @User() user,
        @Param('id') courseId: string
    ) {
        const isCourseOfTeacher = await this.authorService.validateTeacherCourse(user['_id'], courseId);
        if (!isCourseOfTeacher)
            throw new ForbiddenException("COURSE_NOT_MATCH_TEACHER");
        const url = `${this.configService.get<string>('HOST')}/courses/avatars/${courseId}/${file.filename}`;
        const res = { url };
        return new ResponseSuccess<any>("UPLOAD.SUCCESS", res);
    }

    @Post('upload/course/:id/:lectureId/resources')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    @UseInterceptors(FileInterceptor('resource',
        {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const { lectureId } = req.params;
                    const courseId = req.params.id;
                    const filePath = `./public/courses/videos/${courseId}/${lectureId}/resources`;
                    mkdirRecursive(filePath);

                    cb(null, filePath);
                },
                filename: (req, file, cb) => {
                    generateFileName(req, file, cb);
                }
            }),
            limits: {
                fileSize: SIZE_LIMIT
            }
        }))
    async uploadResources(
        @UploadedFile() file,
        @User() user,
        @Param('id') courseId: string,
        @Param('lectureId') lectureId: string
    ) {
        const isCourseOfTeacher = await this.authorService.validateTeacherCourse(user['_id'], courseId);
        if (!isCourseOfTeacher)
            throw new ForbiddenException("COURSE_NOT_MATCH_TEACHER");
        const url = `${this.configService.get<string>('HOST')}/courses/videos/${courseId}/${lectureId}/resources/${file.filename}`;
        const res = { url };
        return new ResponseSuccess<any>("UPLOAD.SUCCESS", res);
    }

    @Post('upload/course/:id/:lectureId/captions')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    @UseInterceptors(FileInterceptor('caption',
        {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const { lectureId } = req.params;
                    const courseId = req.params.id;
                    const filePath = `./public/courses/videos/${courseId}/${lectureId}/captions`
                    mkdirRecursive(filePath)
                    cb(null, filePath);
                },
                filename: (req, file, cb) => {
                    generateFileName(req, file, cb);
                }
            }),
            fileFilter: (req, file, cb) => {
                const ext = path.extname(file.originalname);
                if (ext !== '.vtt')
                    return cb(null, false);
                cb(null, true);
            },
            limits: {
                fileSize: SIZE_LIMIT
            }
        }))
    async uploadCaptionVideo(
        @UploadedFile() file,
        @User() user,
        @Param('id') courseId: string,
        @Param('lectureId') lectureId: string
    ) {
        if (!file)
            throw new NotAcceptableException("Only .vtt extension is allowed");
        const isCourseOfTeacher = await this.authorService.validateTeacherCourse(user['_id'], courseId);
        if (!isCourseOfTeacher)
            throw new ForbiddenException("COURSE_NOT_MATCH_TEACHER");
        const url = `${this.configService.get<string>('HOST')}/courses/videos/${courseId}/${lectureId}/captions/${file.filename}`;
        const res = { url };
        return new ResponseSuccess<any>("UPLOAD.SUCCESS", res)
    }

    @Post('upload/course/:id/:chapterId/:lectureId/video')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    @UseInterceptors(FileInterceptor('video',
        {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const courseId = req.params.id;
                    const { lectureId } = req.params;
                    const filePath = `./public/courses/videos/${courseId}/${lectureId}`;
                    mkdirRecursive(filePath);
                    cb(null, filePath);
                },
                filename: (req, file, cb) => {
                    generateFileName(req, file, cb);
                }
            })
        }))
    async uploadCourseVideo(
        @User() user,
        @UploadedFile() file,
        @Param('id') courseId: string,
        @Param('chapterId') chapterId: string,
        @Param('lectureId') lectureId: string,
        @Query('duration', ParseIntPipe) duration: number,
        @Res() res
    ) {
        const teacherId: string = user._id;
        const isCourseOfTeacher = await this.authorService.validateTeacherCourse(teacherId, courseId);
        if (!isCourseOfTeacher)
            throw new ForbiddenException("COURSE_NOT_MATCH_TEACHER");
        const _jobId = await this.videoQueue.add("video", {
            video: file
        })

        const cb = async (jobId, result) => {
            console.log("Call this")
            if (_jobId.id === jobId) {
                console.log(`Producer get: Job ${jobId} completed! Result: ${result}`);
                const resolutionsObj = JSON.parse(result);
                console.log("Log the status 1")

                const resKeys = _.keys(resolutionsObj);
                console.log("Log the status 2")

                resKeys.forEach(key => {
                    resolutionsObj[key].src = `${this.configService.get<string>('HOST')}/courses/videos/${courseId}/${lectureId}/${resolutionsObj[key].src}`;
                });
                console.log("Log the status 3")

                const resArr = Object.values(resolutionsObj);

                console.log("Log the status 4")

                // const status = await this.chapterService.addVideoResolutionsForLecture(courseId, chapterId, lectureId, resArr).catch(err => console.log(err));
                // console.log("Log the status", status)
                
                const status = await this.chapterService.addVideoResolutionsForLecture(courseId, chapterId, lectureId, resArr, duration);
                console.log(status);
                if (!status) {
                    throw new NotFoundException('Invalid lecture');
                }
                this.chapterGateway.notifyVideoUploadIsOk(teacherId, lectureId, resolutionsObj);
            }
        }
        this.videoQueue.on("global:completed", cb);
        res.send("Upload video success")
    }
}

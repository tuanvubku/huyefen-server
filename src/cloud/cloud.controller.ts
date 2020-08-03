import { User } from '@/utils/decorators/user.decorator';
import { RolesGuard } from '@/utils/guards/roles.guard';
import { generateFileName, ResponseSuccess } from '@/utils/utils';
import { InjectQueue } from '@nestjs/bull';
import { Body, Controller, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors, ForbiddenException, NotAcceptableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Queue } from 'bull';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { CloudService } from './cloud.service';
import { Roles } from '@/utils/decorators/roles.decorator';
import { Role, SIZE_LIMIT } from '@/config/constants';
import { AuthorService } from '@/author/author.service';
import * as path from 'path'
import { lowerCase } from 'lodash';
@Controller('api/cloud')
export class CloudController {

    constructor(
        private readonly cloudService: CloudService,
        private readonly configService: ConfigService,
        private readonly authorService: AuthorService,
        @InjectQueue('video') private videoQueue: Queue
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
                    if (!fs.existsSync(filePath)) {
                        fs.mkdirSync(filePath, { recursive: true });
                    }
                    cb(null, filePath);
                },
                filename: (req, file, cb) => {
                    generateFileName(req, file, cb);
                }
            })
        }))
    async uploadAvatar(@UploadedFile() file, @User() user) {
        const url = `${this.configService.get<string>('HOST')}/teachers/${user['_id']}/${file.filename}`;
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
                    if (!fs.existsSync(filePath)) {
                        fs.mkdirSync(filePath, { recursive: true });
                    }
                    cb(null, filePath);
                },
                filename: (req, file, cb) => {
                    generateFileName(req, file, cb);
                }
            })
        }))
    async uploadACourseAvatar(
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

    @Post('upload/course/:id/resource')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    @UseInterceptors(FileInterceptor('resource',
        {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const { lectureId } = req.body;
                    const courseId = req.params.id;
                    const filePath = `./public/Courses/videos/${courseId}/${lectureId}/resources`;
                    if (!fs.existsSync(filePath)) {
                        fs.mkdirSync(filePath, { recursive: true });
                    }
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
        @Param('id') courseId: string
    ) {
        const isCourseOfTeacher = await this.authorService.validateTeacherCourse(user['_id'], courseId);
        if (!isCourseOfTeacher)
            throw new ForbiddenException("COURSE_NOT_MATCH_TEACHER");
        const url = `${this.configService.get<string>('HOST')}\/${file.filename}`;
        const res = { url };
        return new ResponseSuccess<any>("UPLOAD.SUCCESS", res);
    }

    @Post('upload/course/:id/caption')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    @UseInterceptors(FileInterceptor('caption',
        {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const { lectureId } = req.body;
                    const courseId = req.params.id;
                    const filePath = `./public/Courses/videos/${courseId}/${lectureId}`
                    if (!fs.existsSync(filePath)) {
                        fs.mkdirSync(filePath, { recursive: true });
                    }
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
        @Param('id') courseId: string
    ) {
        if (!file)
            throw new NotAcceptableException("Only .vtt extension is allowed");
        const isCourseOfTeacher = await this.authorService.validateTeacherCourse(user['_id'], courseId);
        if (!isCourseOfTeacher)
            throw new ForbiddenException("COURSE_NOT_MATCH_TEACHER");
        const url = `${this.configService.get<string>('HOST')}\/${file.filename}`;
        const res = { url };
        return new ResponseSuccess<any>("UPLOAD.SUCCESS", res)
    }

    @Post('upload/course/:id/video')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    @UseInterceptors(FileInterceptor('video',
        {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const { courseId, lectureId } = req.body;
                    const filePath = `./public/Courses/videos/${courseId}/${lectureId}`;
                    if (!fs.existsSync(filePath)) {
                        fs.mkdirSync(filePath, { recursive: true })
                    }
                    cb(null, filePath);
                },
                filename: (req, file, cb) => {
                    generateFileName(req, file, cb);
                }
            })
        }))
    async uploadCourseVideo(
        @UploadedFile() file,
        @User() user, @Param('id') courseId: String,
        @Body('lectureId') lectureId: String,
        @Res() res
    ) {

        console.log(file)
        const _jobId = await this.videoQueue.add("video", {
            video: file,
            courseId,
            lectureId
        })

        
        const cb = (jobId, result) => {
            console.log("Hello")
            console.log(_jobId.id === jobId)
            // JobId when push to queue with jobId queue return
            if (_jobId.id === jobId) {
                console.log(`Producer get: Job ${jobId} completed! Result: ${result}`);
                res.send(`Producer get: Job ${jobId} completed! Result: ${result}`)
                this.videoQueue.removeListener("global:completed", cb);
            }
        }
        this.videoQueue.addListener("global:completed", cb);
    }
}

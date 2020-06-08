import { User } from '@/utils/decorators/user.decorator';
import { RolesGuard } from '@/utils/guards/roles.guard';
import { generateFileName, ResponseSuccess } from '@/utils/utils';
import { InjectQueue } from '@nestjs/bull';
import { Body, Controller, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Queue } from 'bull';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { CloudService } from './cloud.service';
import { Roles } from '@/utils/decorators/roles.decorator';
import { Role } from '@/config/constants';
@Controller('cloud')
export class CloudController {

    constructor(
        private readonly cloudService: CloudService,
        private readonly configService: ConfigService,
        @InjectQueue('video') private videoQueue: Queue
    ) { }

    @Post('/upload')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher, Role.User)
    @UseInterceptors(FileInterceptor('avatar',
        {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    //console.log(req)
                    const role = `${req.user["role"]}s`;
                    const filePath = `./public/${role}/${req.user["_id"]}`;
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
    async uploadAvatar(@UploadedFile() file, @User() user) {
        const url = `${this.configService.get<string>('HOST')}\/${file.filename}`;
        const res = { url };
        return new ResponseSuccess<any>("UPLOAD.SUCCESS", res)
    }


    @Post('upload/course/:id/avatar')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    @UseInterceptors(FileInterceptor('avatar',
        {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const { courseId } = req.body;
                    const filePath = `./public/Courses/avatars/${courseId}`
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
    async uploadACourseAvatar(
        @UploadedFile() file,
        @User() user,
        @Param('id') courseId: String
    ) {
        const url = `${this.configService.get<string>('HOST')}\/${file.filename}`;
        const res = { url };
        return new ResponseSuccess<any>("UPLOAD.SUCCESS", res)
    }


    @Post('upload/course/:id/video')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
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

        const _jobId = await this.videoQueue.add("video", {
            video: file,
            courseId,
            lectureId
        })

        const cb = (jobId, result) => {
            console.log("Hello")
            console.log(_jobId.id == jobId)
            // JobId when push to queue with jobId queue return
            if (_jobId.id == jobId) {
                console.log(`Producer get: Job ${jobId} completed! Result: ${result}`);
                res.send(`Producer get: Job ${jobId} completed! Result: ${result}`)
                this.videoQueue.removeListener("global:completed", cb);
            }
        }
    }
}

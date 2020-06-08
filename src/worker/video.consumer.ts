import { OnQueueActive, OnQueueCompleted, OnQueueProgress, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { join } from 'path';
import { Progressive, Resolution } from '@/utils/utils';
import * as fs from 'fs';
import { JobController } from '@/job/job.controller';
const ffmpeg = require('fluent-ffmpeg');
@Processor('video')
export class VideoConsumer {

    @Process('video')
    async changeResolution(job: Job) {

        console.dir(job.data.video);
        const filePath = job.data.video.path;
        const courseId = job.data.courseId;
        const lectureId = job.data.lectureId;
        const fileName = job.data.video.filename;
        console.log("vudt")
        
        console.log("XU ly")
        //console.log(height);
        const desPath = join(__dirname, `../../public/Courses/videos/${courseId}/${lectureId}/${fileName}`);
        const des = join(__dirname, `../../public/Courses/videos/${courseId}/${lectureId}`);
        console.log(desPath)
        const height = await this.getHeight(desPath).then(height => parseInt(height)).catch(err => console.log(err));
        console.log(height);
        if (height > Progressive.P1080) {
            await Promise.all([
                this.convertTo(Resolution.R1080p, desPath, desPath, fileName, Progressive.P1080),
                this.convertTo(Resolution.R720p, desPath, desPath, fileName, Progressive.P720),
                this.convertTo(Resolution.R480p, desPath, desPath, fileName, Progressive.P480),
                this.convertTo(Resolution.R360p, desPath, desPath, fileName, Progressive.P360)
            ])
                .then(data => {
                    console.log("Completed convert video!")
                })
        } else if (height > Progressive.P720) {
            await Promise.all([
                this.convertTo(Resolution.R720p, desPath, desPath, fileName, Progressive.P720),
                this.convertTo(Resolution.R480p, desPath, desPath, fileName, Progressive.P480),
                this.convertTo(Resolution.R360p, desPath, desPath, fileName, Progressive.P360)
            ])
                .then(data => {
                    console.log("Completed convert video!")
                    if (height == Progressive.P1080) {
                        // copy
                        
                    }
                })
        } else if (height > Progressive.P480) {
            await Promise.all([
                this.convertTo(Resolution.R480p, desPath, des, fileName, Progressive.P480),
                this.convertTo(Resolution.R360p, desPath, des, fileName, Progressive.P360)
            ])
                .then(data => {
                    console.log("Completed convert video!")
                    // if (height == Progressive.P720) {
                    //     // copy
                    //     fs.copyFile(srcFile, desFile, (err) => {
                    //         if (err) console.log(err);
                    //     });

                    // }
                })
        } else if (height > Progressive.P360) {
            await Promise.all([
                this.convertTo(Resolution.R360p, desPath, desPath, fileName, Progressive.P360)
            ])
                .then(data => {
                    console.log("Completed convert video!")
                    if (height == Progressive.P480) {
                        // copy
                        
                    }
                })
        } else if (height == Progressive.P360) {

        } else {
            console.log("Not support");
        }

        console.log("Finished !")
        return "Hello"
    }

    private getHeight(filePath): Promise<string> {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(filePath, function (err, metadata) {
                if (err) {
                    reject(err);
                } else {
                    resolve(metadata.streams[0].height)
                }
            });
        })
    }

    private convertTo(resolutionTarget: string, filePath: string, desPath: string, fileName: string, progressive: Progressive) {
        const split = fileName.split(".");
        const newFileName = `${split[0]}${progressive}p.${split[1]}`;
        return new Promise((resolve, reject) => {
            ffmpeg(filePath).size(resolutionTarget)
                .videoCodec('libx264')
                .audioCodec('libmp3lame')
                .on('error', function (err) {
                    console.log('An error occurred: ' + err.message);
                    reject(err);
                })
                .on('progress', function(progress) {
                    console.log(`Processing: ${resolutionTarget} === ` + progress.percent + '% done');
                    //this.handlerProgress()
                    
                  })
                .on('end', function () {
                    console.log(`Processing to ${resolutionTarget} finished !`);
                    resolve()
                })
                .save(join(desPath, newFileName));
        })
    }

    @OnQueueActive()
    handlerActive(job: Job) {
        console.log(`Processing job ${job.id} of type ${job.name} with data ${job.data}...`)
    }


    @OnQueueProgress()
    handlerProgress(job: Job, progress: number) {
        console.log(`Processing job ${job.id} at progress ${progress}`)
    }

    @OnQueueCompleted()
    handlerComplete(job: Job, result: any) {
        console.log(`Job completed ${job.id} has result is: ${result}`)
    }
}
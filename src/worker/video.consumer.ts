import { Progressive, Resolution } from '@/utils/utils';
import { OnQueueActive, OnQueueCompleted, OnQueueProgress, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { join } from 'path';
import * as _ from 'lodash'
const ffmpeg = require('fluent-ffmpeg');

@Processor('video')
export class VideoConsumer {

    @Process('video')
    async changeResolution(job: Job) {

        const path = job.data.video.path;
        const des = job.data.video.destination;
        const fileName = job.data.video.filename;

        const desPath = join(__dirname, `../../${path}`)
        const destination = join(__dirname, `../../${des}`)

        const height = await this.getHeight(desPath).then(height => parseInt(height)).catch(err => console.log(err));
        const result = []
        result.push({
            resolution: height,
            src: fileName
        })

        if (height > Progressive.P1080) {
            await Promise.all([
                this.convertTo(Resolution.R1080p, desPath, destination, fileName, Progressive.P1080, job, result),
                this.convertTo(Resolution.R720p, desPath, destination, fileName, Progressive.P720, job, result),
                this.convertTo(Resolution.R480p, desPath, destination, fileName, Progressive.P480, job, result),
                this.convertTo(Resolution.R360p, desPath, destination, fileName, Progressive.P360, job, result)
            ])
                .then(data => {
                    console.log("Completed convert video!")
                })
        } else if (height > Progressive.P720) {
            await Promise.all([
                this.convertTo(Resolution.R720p, desPath, destination, fileName, Progressive.P720, job, result),
                this.convertTo(Resolution.R480p, desPath, destination, fileName, Progressive.P480, job, result),
                this.convertTo(Resolution.R360p, desPath, destination, fileName, Progressive.P360, job, result)
            ])
                .then(data => {
                    console.log("Completed convert video!")
                })
        } else if (height > Progressive.P480) {
            await Promise.all([
                this.convertTo(Resolution.R480p, desPath, destination, fileName, Progressive.P480, job, result),
                this.convertTo(Resolution.R360p, desPath, destination, fileName, Progressive.P360, job, result)
            ])
                .then(data => {
                    console.log("Completed convert video!")
                })
        } else if (height > Progressive.P360) {
            await Promise.all([
                this.convertTo(Resolution.R360p, desPath, destination, fileName, Progressive.P360, job, result)
            ])
                .then(data => {
                    console.log("Completed convert video!")
                })
        } else if (height == Progressive.P360) { }
        else {
            // sleep 3s
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve()
                }, 3000)
            })
            console.log("Not support");
        }

        return _.keyBy(result, "resolution")
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

    private convertTo(resolutionTarget: string, path: string, destination: string,
        fileName: string, progressive: Progressive, job: Job, result) {
        const split = fileName.split(".");
        const newFileName = `${split[0]}${progressive}p.${split[1]}`;
        return new Promise((resolve, reject) => {
            ffmpeg(path).size(resolutionTarget)
                .on('error', function (err) {
                    console.log('An error occurred: ' + err.message);
                    reject(err);
                })
                .on('progress', function (progress) {
                        console.log(`Processing ${job.id}: ${resolutionTarget} === ` + progress.percent + '% done');

                })
                .on('end', function () {
                    result.push({
                        resolution: progressive,
                        src: newFileName
                    });
                    console.log(`Processing to ${resolutionTarget} finished !`);
                    resolve()
                })
                .save(join(destination, newFileName));
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
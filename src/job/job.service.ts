import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IJob } from './interfaces/job.interface';

@Injectable()
export class JobService {
    constructor(
        @InjectModel('Job') private readonly jobModel: Model<IJob>
    ) {}

    async fetch(page: number, limit: number): Promise<IJob[]> {
        const jobs = await this.jobModel
            .find()
            .skip((page - 1) * limit)
            .limit(limit);
        return jobs;
    }

    async create(title: string): Promise<IJob> {
        const job: IJob = new this.jobModel({
            title
        });
        return await job.save();
    }

    async delete(jobId: string): Promise<IJob> {
        const deletedJob = await this.jobModel.findByIdAndDelete(jobId);
        return deletedJob;
    }

    async findJobById(jobId: string): Promise<IJob> {
        const job: IJob = await this.jobModel.findById(jobId);
        return job;
    }
}

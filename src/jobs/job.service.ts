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
}

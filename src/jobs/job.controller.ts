import {
    Controller,
    Query,
    Param,
    Body,
    Get,
    Put,
    Post,
    Delete,
    ParseIntPipe,
    NotFoundException
} from '@nestjs/common';
import { AllDto } from './dtos/all.dto';
import { JobService } from './job.service';
import { IJob } from './interfaces/job.interface';
import { IResponse } from '@/utils/interfaces/response.interface';
import { ResponseSuccess } from '@/utils/utils';

@Controller('jobs')
export class JobController {
    constructor(
        private readonly jobService: JobService
    ) {}

    @Get()
    async allJobs(
        @Query('page', ParseIntPipe) page: number,
        @Query('limit', ParseIntPipe) limit: number
    ): Promise<IResponse<IJob[]>> {
        const jobs: IJob[] = await this.jobService.fetch(page, limit);
        return new ResponseSuccess<IJob[]>('FETCH_JOBS.SUCCESSFULLY', jobs);
    }
}

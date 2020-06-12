import {
    Controller,
    Query,
    Param,
    Body,
    Get,
    Post,
    Delete,
    ParseIntPipe,
    NotFoundException
} from '@nestjs/common';
import { JobService } from './job.service';
import { IJob } from './interfaces/job.interface';
import { IResponse } from '@/utils/interfaces/response.interface';
import { ResponseSuccess } from '@/utils/utils';
import { CreateDto } from './dtos/create.dto';

@Controller('api/jobs')
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

    @Post()
    async create(@Body() body: CreateDto): Promise<IResponse<IJob>> {
        const { title } = body;
        const job: IJob = await this.jobService.create(title);
        return new ResponseSuccess<IJob>('CREATE_JOB.SUCCESSFULLY', job);
    }

    @Delete('/:id')
    async delete(@Param('id') id: string): Promise<IResponse<IJob>> {
        const deletedJob: IJob = await this.jobService.delete(id);
        if (deletedJob)
            return new ResponseSuccess<IJob>('DELETE_JOB_OK', deletedJob);
        throw new NotFoundException('Job not exist');
    }
}

import { Controller, Get, Post, UseGuards, Body, Delete, Param, NotFoundException, Query } from '@nestjs/common';
import { IResponse } from '@/utils/interfaces/response.interface';
import { ITopic } from './interfaces/topic.interface';
import { TopicService } from './topic.service';
import { ResponseSuccess } from '@/utils/utils';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/utils/guards/roles.guard';
import { Roles } from '@/utils/decorators/roles.decorator';
import { Role } from '@/config/constants';
import { CreateDto } from './dtos/create.dto';
import { DeleteParamDto } from './dtos/delete.dto';

@Controller('api/topics')
export class TopicController {
    constructor (
        private readonly topicService: TopicService
    ) {}

    @Get()
    async fetch(): Promise<IResponse<ITopic[]>> {
        const topics: ITopic[] = await this.topicService.fetch();
        return new ResponseSuccess<ITopic[]>('FETCH_OK', topics);
    }

    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async create(@Body() body: CreateDto): Promise<IResponse<ITopic>> {
        const title: string = body.title;
        const topic: ITopic = await this.topicService.create(title);
        return new ResponseSuccess<ITopic>('CREATE_OK', topic);
    }

    @Delete('/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async delete(@Param() params: DeleteParamDto): Promise<IResponse<string>> {
        const topicId: string = params.id;
        const status: boolean = await this.topicService.delete(topicId);
        if (!status)
            throw new NotFoundException('Invalid topic');
        return new ResponseSuccess<string>('DELETE_OK', 'ok');
    }

    @Get('/suggest')
    async getTopicSuggestions(@Query() query) {
        const result = {
            topics: []
        }
        await this.topicService.getTopicSuggest(query['keyword'], result);
        return new ResponseSuccess("SUCCESS", result);
    }

    @Get('/search')
    async searchTopic(@Query() query): Promise<IResponse<any>> {
        let res = null
        await this.topicService.searchTopic(query.keyword, parseInt(query.page), parseInt(query.pageSize))
            .then(data => {
                res = data
            }).catch(err => {
                //console.log(err)
            })
        return new ResponseSuccess("SUCCESS", res);
    }

}


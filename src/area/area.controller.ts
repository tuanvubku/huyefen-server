import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, NotFoundException, Res } from '@nestjs/common';
import { ResponseSuccess } from '@/utils/utils';
import { IResponse } from '@/utils/interfaces/response.interface';
import { AreaService } from './area.service';
import { CreateDto } from './dtos/create.dto';
import { IArea } from './interfaces/area.interface';
import { ICategory } from './interfaces/category.interface';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/utils/guards/roles.guard';
import { Roles } from '@/utils/decorators/roles.decorator';
import { Role } from '@/config/constants';
import { UpdateParamDto, UpdateDto } from './dtos/update.dto';
import { CreateCategoryDto, CreateCategoryParamDto } from './dtos/createCategory.dto';
import { UpdateCategoryDto, UpdateCategoryParamDto } from './dtos/updateCategory.dto';
import { FetchCategoryParamDto } from './dtos/fetchCategory.dto';
import { FetchDto } from './dtos/fetch.dto';

@Controller('api/areas')
export class AreaController {
    constructor (
        private readonly areaService: AreaService
    ) {}

    @Get()
    async fetch(): Promise<IResponse<IArea[]>> {
        const areas: IArea[] = await this.areaService.fetch()
        return new ResponseSuccess<IArea[]>('AREA_FETCH_OK', areas);
    }

    @Post()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)            //Role.admin
    async create(@Body() body: CreateDto): Promise<IResponse<IArea>> {
        const title: string = body.title;
        const area: IArea = await this.areaService.create(title);
        return new ResponseSuccess<IArea>('CREATE_AREA_OK', area);
    }

    @Put('/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async update(@Param() params: UpdateParamDto, @Body() body: UpdateDto): Promise<IResponse<IArea>> {
        const areaId: string = params.id;
        const title: string = body.title;
        const area: IArea = await this.areaService.update(areaId, title);
        if (!area)
            throw new NotFoundException('Invalid area');
        return new ResponseSuccess<IArea>('UPDATE_AREA_OK', area);
    }

    @Get('/:id/info')
    async fetchInfo(@Param() params: FetchDto): Promise<IResponse<IArea>> {
        const areaId: string = params.id;
        const area: IArea = await this.areaService.fetchInfo(areaId);
        if (!area)
            throw new NotFoundException('Invalid area');
        return new ResponseSuccess<IArea>('FETCH_INFO_OK', area);
    }

    @Get('/categories')
    async fetchCategories(): Promise<IResponse<ICategory[]>> {
        const categories: ICategory[] = await this.areaService.fetchCategories();
        return new ResponseSuccess('CATEGORIES_FETCH_OK', categories);
    }

    @Post(':id/categories')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async createCategory(@Param() params: CreateCategoryParamDto, @Body() body: CreateCategoryDto): Promise<IResponse<ICategory>> {
        const areaId: string = params.id;
        const { title, description } = body;
        const category: ICategory = await this.areaService.createCategory(areaId, title, description);
        if (!category)
            throw new NotFoundException('Invalid area');
        return new ResponseSuccess<ICategory>('CREATE_CATE_OK', category);
    }

    @Put(':areaId/categories/:categoryId')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(Role.Teacher)
    async updateCategory(@Param() params: UpdateCategoryParamDto, @Body() body: UpdateCategoryDto): Promise<IResponse<ICategory>> {
        const { areaId, categoryId } = params;
        const { title, description } = body;
        const category: ICategory = await this.areaService.updateCategory(areaId, categoryId, title, description);
        if (!category)
            throw new NotFoundException('Invalid information about category');
        return new ResponseSuccess<ICategory>('UPDATE_CATE_OK', category);
    }

    @Get(':areaId/categories/:categoryId')
    async fetchCategoryInfo(@Param() params: FetchCategoryParamDto): Promise<IResponse<ICategory>> {
        const { areaId, categoryId } = params;
        const category: ICategory = await this.areaService.fetchCategory(areaId, categoryId);
        if (!category)
            throw new NotFoundException('Invalid information about category');
        return new ResponseSuccess<ICategory>('FETCH_CATE_INFO_OK', category);
    }
}


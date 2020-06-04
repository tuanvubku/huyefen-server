import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, NotFoundException } from '@nestjs/common';
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

@Controller('areas')
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
    
    @Get('categories')
    async fetchCategories(): Promise<IResponse<ICategory[]>> {
        const categories: ICategory[] = await this.areaService.fetchCategories();
        return new ResponseSuccess('CATEGORIES_FETCH_OK', categories);
    }

    @Get(':id')
    async findAreaById(@Param('id') id: string): Promise<IResponse<IArea>> {
        const area = await this.areaService.findOne(id);
        return new ResponseSuccess("AREA.GET_BY_ID_SUCCESSS", area);
    }


    @Post()
    async createArea(@Body() createAreaDto: CreateAreaDto): Promise<IResponse<IArea>> {
        const area = await this.areaService.create(createAreaDto);
        return new ResponseSuccess("AREA.CREATE_SUCCESSS", area);
    }

    @Put('id')
    async updateArea(@Param('id') id: string, @Body() updateAreaDto: UpdateAreaDto): Promise<IResponse<number>> {
        const updatedArea = await this.areaService.updateArea(updateAreaDto, id);
        return new ResponseSuccess<number>("AREA.UPDATE_SUCCESS", updatedArea);
    }

    @Delete('id')
    async deleteArea(@Param('id') id: string): Promise<IResponse<IArea>> {
        const deletedArea = await this.areaService.deleteArea(id);
        return new ResponseSuccess("AREA.DELET_SUCCESS", deletedArea);
    }


    @Post('categories')
    async createCategory(@Body() createCategoryDto: CreateCategoryDto): Promise<IResponse<ICategory>> {
        const newCategory = await this.areaService.createCategory(createCategoryDto);
        return new ResponseSuccess("CATEGORY.CREATE_SUCCESSS", newCategory);
    }

    @Get('categories/:id')
    async findCategoryById(@Param('id') id: string): Promise<IResponse<ICategory>> {
        const category = await this.areaService.findCategoryById(id);
        return new ResponseSuccess("CATEGORY.GET_BY_ID_SUCCESSS", category);
    }

    @Put(':id')
    async updateCategory(@Param('id') id: string, @Body() updateCategoryDto: UpdateAreaDto): Promise<IResponse<ICategory>> {
        const updateCategory = await this.areaService.updateCategory(updateCategoryDto, id);
        return new ResponseSuccess("CATEGORY.UPDATE_SUCCESS", updateCategory);
    }

    @Delete('id')
    async deleteCategory(@Param('id') id: string) {
        const deleteCategory = this.areaService.deleteCategory(id);
        return new ResponseSuccess("CATEGORY.DELETE_SUCCESS", deleteCategory);
    }
}


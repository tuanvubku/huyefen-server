import { Controller, Body, Post, HttpCode, Get, Param } from '@nestjs/common';
import { AreaService } from './area.service';
import { IArea } from './interfaces/area.interface';
import { CreateAreaDto } from './dto/create-area.dto';
import { IResponse } from '../utils/response.interface'
import { success } from '../utils/common'
import { ICategory } from './interfaces/category.interface';
import { CreateCategoryDto } from './dto/create-category.dto';
@Controller('area')
export class AreaController {
    constructor(private readonly areaService: AreaService) {}

    @Get()
    async findAll(): Promise<IResponse<IArea[]>> {
        const areas = await this.areaService.findAll()
        return success(areas);
    }

    @Get('category')
    async findAllCategory(): Promise<IResponse<ICategory[]>> {
        const categories = await this.areaService.findAllCategories();
        return success(categories);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<IResponse<IArea>> {
        const area = await this.areaService.findOne(id);
        return success(area);
    }

    @Post()
    async create(@Body() createAreaDto: CreateAreaDto): Promise<IResponse<IArea>> {
        const area =  await this.areaService.create(createAreaDto);
        return success(area);
    }


    @Post('category/:areaId')
    async createCategory(@Param('areaId') areaId: string, @Body() createCategoryDto: CreateCategoryDto): Promise<IResponse<ICategory>> {
        const newCategory =  await this.areaService.createCategory(createCategoryDto);
        const area = await this.areaService.findOne(areaId);
        area[0].category.push(newCategory.id);
        this.areaService.update(areaId, area[0]);
        return success(newCategory);
    }


}


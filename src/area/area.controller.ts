import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ResponseSuccess } from 'src/utils/dto/response.dto';
import { IResponse } from '../utils/interface/response.interface';
import { AreaService } from './area.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { IArea } from './interfaces/area.interface';
import { ICategory } from './interfaces/category.interface';
@Controller('areas')
export class AreaController {
    constructor(private readonly areaService: AreaService) {}

    @Get()
    async findAll(): Promise<IResponse<IArea[]>> {
        const areas = await this.areaService.findAll()
        return new ResponseSuccess("AREA.GET_SUCCESSS",areas);
    }

    @Get('category')
    async findAllCategory(): Promise<IResponse<ICategory[]>> {
        const categories = await this.areaService.findAllCategories();
        return new ResponseSuccess("CATEGORY.GET_SUCCESSS",categories);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<IResponse<IArea>> {
        const area = await this.areaService.findOne(id);
        return new ResponseSuccess("AREA.GET_BY_ID_SUCCESSS",area);
    }

    
    @Post()
    async create(@Body() createAreaDto: CreateAreaDto): Promise<IResponse<IArea>> {
        const area =  await this.areaService.create(createAreaDto);
        return new ResponseSuccess("AREA.CREATE_SUCCESSS",area);
    }


    @Post('category/:areaId')
    async createCategory(@Param('areaId') areaId: string, @Body() createCategoryDto: CreateCategoryDto): Promise<IResponse<ICategory>> {
        const newCategory =  await this.areaService.createCategory(createCategoryDto);
        const area = await this.areaService.findOne(areaId);
        area[0].category.push(newCategory.id);
        this.areaService.update(areaId, area[0]);
        return new ResponseSuccess("CATEGORY.CREATE_SUCCESSS",newCategory);
    }


}


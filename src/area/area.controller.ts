import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ResponseSuccess } from '@/utils/utils';
import { IResponse } from '@/utils/interfaces/response.interface';
import { AreaService } from './area.service';
import { CreateAreaDto, UpdateAreaDto } from './dto/create-area.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { IArea } from './interfaces/area.interface';
import { ICategory } from './interfaces/category.interface';

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

    @Get('categories')
    async findAllCategory(): Promise<IResponse<ICategory[]>> {
        const categories = await this.areaService.findAllCategories();
        return new ResponseSuccess("CATEGORY.GET_SUCCESSS", categories);
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


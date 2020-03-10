import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateAreaDto } from './dto/create-area.dto';
import { UpdateCategoryDto } from './dto/create-category.dto';
import { IArea } from './interfaces/area.interface';
import { ICategory } from './interfaces/category.interface';

@Injectable()
export class AreaService {

    constructor(@InjectModel('Area') private readonly areaModel: Model<IArea>,
        @InjectModel('Category') private readonly categoryModel: Model<ICategory>) { }

    async findAll(): Promise<IArea[]> {
        return await this.areaModel.find();
    }

    async findOne(id: string): Promise<IArea> {
        return this.areaModel.findOne({ _id: id });
    }

    async update(id: string, area: IArea): Promise<IArea> {
        return await this.areaModel.findByIdAndUpdate(id, area, { new: true });
    }

    async create(area: IArea): Promise<IArea> {
        const newArea = new this.areaModel(area);
        return await newArea.save();
    }

    async findAllCategories(): Promise<ICategory[]> {
        return await this.categoryModel.find();
    }

    async findCategoryById(id: string): Promise<ICategory> {
        return await this.categoryModel
            .findOne({ _id: id })
            .populate('areaId').exec();
    }

    async createCategory(category: ICategory): Promise<ICategory> {
        const newCategory = new this.categoryModel(category);
        return await newCategory.save();
    }

    async updateArea(area: UpdateAreaDto, id: string): Promise<IArea> {
        const updateArea = this.areaModel.findOne({ _id: id });
        if (!updateArea)
            throw new HttpException('AREA.NOT_FOUND', HttpStatus.BAD_REQUEST);
        return await updateArea.update(area);
    }

    async deleteArea(id: string): Promise<IArea> {
        const deleteArea = await this.areaModel.findByIdAndRemove(id);
        if (!deleteArea)
            throw new HttpException("AREA.NOT_FOUND", HttpStatus.BAD_REQUEST);
        else
            return deleteArea;
    }

    async updateCategory(category: UpdateCategoryDto, id: string): Promise<ICategory> {
        const updateCategory = await this.categoryModel.findByIdAndUpdate(id, category, { new: true });
        if (!updateCategory)
            throw new HttpException("CATEGORT.NOT_FOUND", HttpStatus.BAD_REQUEST);
        else
            return updateCategory;
    }

    async deleteCategory(id: string): Promise<ICategory> {
        const deleteCategory = await this.categoryModel.findByIdAndRemove(id);
        if (!deleteCategory)
            throw new HttpException("CATEGORY.NOT_FOUND", HttpStatus.BAD_REQUEST);
        else
            return deleteCategory;
    }
}
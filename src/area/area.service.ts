import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as _ from 'lodash';
import { IArea } from './interfaces/area.interface';
import { ICategory } from './interfaces/category.interface';

@Injectable()
export class AreaService {

    constructor (
        @InjectModel('Area') private readonly areaModel: Model<IArea>
    ) {}

    async fetch(): Promise<IArea[]> {
        return await this.areaModel.find().select('-categories.description');
    }

    // async findOne(id: string): Promise<IArea> {
    //     return this.areaModel.findOne({ _id: id });
    // }

    async update(areaId: string, title: string): Promise<IArea> {
        return await this.areaModel.findByIdAndUpdate(areaId, {
            title
        });
    }

    async create(title: string): Promise<IArea> {
        const area: IArea = new this.areaModel({
            title: title
        });
        return await area.save();
    }

    async fetchCategories(): Promise<ICategory[]> {
        const areas: IArea[] = await this.areaModel.find();
        return _.flatMap(areas, area => area.categories);
    }

    // async findCategoryById(id: string): Promise<ICategory> {
    //     return await this.categoryModel
    //         .findOne({ _id: id })
    //         .populate('areaId').exec();
    // }

    // async createCategory(category: CreateAreaDto): Promise<ICategory> {
    //     const newCategory = new this.categoryModel(category);
    //     return await newCategory.save();
    // }

    async updateArea(area: UpdateAreaDto, id: string) {
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
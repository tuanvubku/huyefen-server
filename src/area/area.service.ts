import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import  { IArea } from './interfaces/area.interface'
import { ICategory } from './interfaces/category.interface';

@Injectable()
export class AreaService {
    
    constructor(@InjectModel('Area') private readonly areaModel: Model<IArea>, 
              @InjectModel('Category') private readonly categoryModel: Model<ICategory>) {}

    async findAll(): Promise<IArea[]> {
        return await this.areaModel.find();
    }

    async findOne(id: string): Promise<IArea> {
        return this.areaModel.findOne({_id: id});
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

    async findOneCategory(id: string): Promise<ICategory> {
        return await this.categoryModel.find({_id: id});
    }

    async createCategory(category: ICategory): Promise<ICategory> {
        const newCategory = new this.categoryModel(category);
        return await newCategory.save();
    }
    

}
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

    async fetchInfo(areaId: string): Promise<IArea> {
        return await this.areaModel.findById(areaId).select('-categories');
    }

    async update(areaId: string, title: string): Promise<IArea> {
        return await this.areaModel.findByIdAndUpdate(areaId, {
            title
        }, {
            new: true,
            runValidators: true
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

    async createCategory(areaId: string, title: string, description: string): Promise<ICategory> {
        const area = await this.areaModel
            .findByIdAndUpdate(areaId, {
                $push: {
                    categories: {
                        title,
                        description
                    } as ICategory
                }
            }, {
                new: true,
                runValidators: true
            });
        return area ? _.last(area.categories) : null;
    }
}
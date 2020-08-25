import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as _ from 'lodash';
import { IArea } from './interfaces/area.interface';
import { ICategory } from './interfaces/category.interface';
import { TeacherNotificationSchema } from '@/teacher/schemas/notification.schema';

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

    async findNameById(areaId: string): Promise<IArea> {
        return await this.areaModel.findById(areaId)
                        .select('title')
                        .exec();
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

    async fetchCategoriesOfArea(areaId: string): Promise<any> {
        const area = await this.areaModel.findById(areaId);
        if (!area) {
            return null;
        }
        return area.categories;
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

    async updateCategory(areaId: string, categoryId: string, title: string, description: string) {
        const area: IArea = await this.areaModel
            .findOneAndUpdate({
                _id: areaId,
                categories: {
                    $elemMatch: {
                        _id: categoryId
                    }
                }
            }, {
                $set: {
                    'categories.$[element].title': title,
                    'categories.$[element].description': description
                }
            }, {
                new: true,
                runValidators: true,
                arrayFilters: [{
                    'element._id': categoryId
                }]
            });
        if (area) {
            const category: ICategory = _.find(area.categories, cate => cate._id.toString() === categoryId);
            return category;
        }
        return null;
    }

    async fetchCategory(areaId: string, categoryId: string): Promise<any> {
        const area: any = await this.areaModel
            .findOne({
                _id: areaId,
                categories: {
                    $elemMatch: {
                        _id: categoryId
                    }
                }
            }, {
                categories: {
                    $elemMatch: { _id: categoryId }
                }
            })
            .select('-categories.description')
          .lean()
          .exec();
        return area ? { ..._.head(area.categories), areaId } : null;
    }
}
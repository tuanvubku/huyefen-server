import { IsMongoId } from 'class-validator';

export class FetchCategoryParamDto {
    @IsMongoId()
    areaId: string;

    @IsMongoId()
    categoryId: string;
}
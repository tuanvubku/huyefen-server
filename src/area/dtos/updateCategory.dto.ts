import { IsMongoId, IsString, Length } from 'class-validator';

export class UpdateCategoryParamDto {
    @IsMongoId()
    areaId: string;

    @IsMongoId()
    categoryId: string;
}

export class UpdateCategoryDto {
    @IsString()
    @Length(4, 40)
    title: string;

    @IsString()
    description: string;
}
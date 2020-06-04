import { IsMongoId, IsString, Length } from 'class-validator';

export class CreateCategoryParamDto {
    @IsMongoId()
    id: string;
}

export class CreateCategoryDto {
    @IsString()
    @Length(4, 40)
    title: string;

    @IsString()
    description: string;
}
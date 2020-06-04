import { IsMongoId, IsString, Length } from 'class-validator';

export class UpdateParamDto {
    @IsMongoId()
    id: string;
}

export class UpdateDto {
    @IsString()
    @Length(4, 40)
    title: string;
}
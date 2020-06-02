import { IsMongoId, IsString, MaxLength } from 'class-validator';

export class UpdateDto {
    @IsString()
    @MaxLength(80)
    title: string;
    
    @IsString()
    @MaxLength(200)
    description: string;
}

export class UpdateParamDto {
    @IsMongoId()
    id: string;
}
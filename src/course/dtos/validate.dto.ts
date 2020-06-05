import { IsMongoId } from 'class-validator';

export class ValidateParamDto {
    @IsMongoId()
    id: string;
}
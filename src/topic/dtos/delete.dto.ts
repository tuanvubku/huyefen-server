import { IsMongoId } from 'class-validator';

export class DeleteParamDto {
    @IsMongoId()
    id: string;
}
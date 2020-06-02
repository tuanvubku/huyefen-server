import { IsMongoId } from 'class-validator';

export class SyllabusDto {
    @IsMongoId()
    id: string;
}


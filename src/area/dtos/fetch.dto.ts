import { IsMongoId } from 'class-validator';

export class FetchDto {
    @IsMongoId()
    id: string;
}
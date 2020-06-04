import { IsMongoId } from 'class-validator';

export class FetchPriceDto {
    @IsMongoId()
    id: string;
}
import { IsMongoId, IsEnum, IsOptional } from 'class-validator';
import { Price } from '@/config/constants';

export class FetchPriceDto {
    @IsMongoId()
    id: string;
}

export class UpdatePriceParamDto {
    @IsMongoId()
    id: string;
}

export class UpdatePriceDto {
    @IsOptional()
    @IsEnum(Price)
    price: Price;
}
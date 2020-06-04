import { IsMongoId, IsString, MaxLength, IsOptional } from 'class-validator';

export class FetchMessagesParamDto {
    @IsMongoId()
    id: string;
}

export class UpdateMessagesParamDto {
    @IsMongoId()
    id: string;
}

export class UpdateMessagesDto {
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    welcome: string;

    @IsString()
    @MaxLength(1000)
    @IsOptional()
    congratulation: string;
}
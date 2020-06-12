import { IsMongoId, IsOptional, IsDate, IsObject, IsString, IsDateString } from 'class-validator';

export class SendDto {
    @IsMongoId()
    @IsOptional()
    converId: string;

    @IsMongoId()
    @IsOptional()
    userId: string;

    @IsDateString()
    createdAt: string;

    @IsObject()
    content: {
        text: string;
        image: string;
        video: string;
    }
}
import { IsOptional, IsNumberString, IsDate } from 'class-validator';

export class FetchNotificationsDto {
    @IsOptional()
    @IsDate()
    upperTime: Date;

    @IsNumberString()
    limit: number;
}
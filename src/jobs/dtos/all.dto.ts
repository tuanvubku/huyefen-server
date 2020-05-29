import { IsNumberString } from 'class-validator';

export class AllDto {
    @IsNumberString()
    page: number;

    @IsNumberString()
    limit: number;
}
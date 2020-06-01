import { IsMongoId } from 'class-validator';

export class FetchInfoDto {
    @IsMongoId()
    id: string;
}
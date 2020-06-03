import { IsMongoId } from 'class-validator';

export class FetchLandingDto {
    @IsMongoId()
    id: string;
}
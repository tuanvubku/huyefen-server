import { IsMongoId } from 'class-validator';

export class FetchGoalsDto {
    @IsMongoId()
    id: string;
}
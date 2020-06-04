import { IsMongoId } from 'class-validator';

export class FetchMessagesParamDto {
    @IsMongoId()
    id: string;
}
import { IsMongoId } from 'class-validator';

export class FetchFriendParamDto {
    @IsMongoId()
    id: string;
}
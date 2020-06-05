import { IsNumberString } from 'class-validator';

export class FetchFriendsDto {
    @IsNumberString()
    page: number;

    @IsNumberString()
    limit: number;
}
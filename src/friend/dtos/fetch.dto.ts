import { IsNumberString } from 'class-validator';

export class FetchFriendsDto {
    @IsNumberString()
    page: number;

    @IsNumberString()
    limit: number;
}

export class FetchAllFriendsDto {
    @IsNumberString()
    existed: number;
}
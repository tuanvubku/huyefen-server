import { IsMongoId, IsArray, IsObject } from 'class-validator';

export class UpdateGoalsParamDto {
    @IsMongoId()
    id: string;
}

export class UpdateGoalsDto {
    @IsArray()          //Array of string
    add: Array<string>;

    @IsArray()          //Array of mongoId
    delete: Array<string>;

    @IsObject()         //object with key: mongoId, value: string
    update: object;
}
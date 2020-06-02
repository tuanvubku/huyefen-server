import { IsMongoId, IsArray, IsObject } from 'class-validator';

export class UpdateWhatLearnsParamDto {
    @IsMongoId()
    id: string;
}

export class UpdateWhatLearnsDto {
    @IsArray()          //Array of string
    add: Array<string>;

    @IsArray()          //Array of mongoId
    delete: Array<string>;

    @IsObject()         //object with key: mongoId, value: string
    update: object;
}
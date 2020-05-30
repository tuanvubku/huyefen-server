import { IsArray } from 'class-validator';

export class UpdateCatesDto {
    @IsArray()          //temporary;
    targetKeys: Array<string>
}
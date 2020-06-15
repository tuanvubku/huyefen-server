import { IsOptional, IsEnum, IsDefined, MinLength } from "class-validator";
import { Privacy } from "@/config/constants";

export class PrivacyDto {

    @IsEnum(Privacy)
    value: Privacy;

    @IsOptional()
    @MinLength(6, {
        message: "Password is too short"
    })
    password: string;
}
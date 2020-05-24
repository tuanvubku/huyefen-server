import { CreateURLDto } from "@/shared/dto/create-url.dto";

export class CreateUserDto {
    readonly userName: string;
    readonly password: string;
    readonly phone: string;
    readonly gender: string;
    readonly email: string;
    readonly job: string;
    readonly birthday: Date;
    readonly roles?: string[];
}

export type UpdateUserDto = Partial<CreateUserDto>
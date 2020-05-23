export class CreateTeacherDto {
    readonly name: string;
    readonly phone: string;
    readonly password: string;
    readonly roles?: string[];
}
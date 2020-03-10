export class CreateAreaDto {
    readonly name: string;
}

export type UpdateAreaDto = Partial<CreateAreaDto>;
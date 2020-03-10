
export class CreateCategoryDto {
    readonly name: string;
    readonly areaId: string;
}

export type UpdateCategoryDto = Partial<CreateCategoryDto>;
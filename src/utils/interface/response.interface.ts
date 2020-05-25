
export interface IResponse<T> {
    errorCode: number;
    message: string;
    data: T;
}
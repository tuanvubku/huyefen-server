import { IResponse } from "../interface/response.interface";

export class ResponseSuccess<T> implements IResponse<T>{
    constructor (infoMessage:string, data?: any) {
      this.errorCode = 0;
      this.message = infoMessage;
      this.data = data;
    };
    message: string;
    data: T;
    errorCode: number;
  }
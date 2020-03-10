import { IResponse } from "../interface/response.interface";

export class ResponseSuccess<T> implements IResponse<T>{
    constructor (infoMessage:string, data?: any) {
      this.success = true;
      this.message = infoMessage;
      this.data = data;
    };
    message: string;
    data: T;
    success: boolean;
  }
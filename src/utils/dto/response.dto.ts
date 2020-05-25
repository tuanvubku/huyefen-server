import { IResponse } from "../interface/response.interface";

export class ResponseSuccess<T> implements IResponse<T> {
	constructor(
		public message: string,
		public data: T = null,
		public errorCode: number = 0
	) {}
}
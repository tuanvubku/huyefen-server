import { extname } from "path";
import { IResponse } from "./interfaces/response.interface";

export class ResponseSuccess<T> implements IResponse<T> {
	constructor(
		public message: string,
		public data: T = null,
		public errorCode: number = 0
	) { }
}


export function generateFileName(req, file, cb) {
	const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
	return cb(null, `${randomName}${extname(file.originalname)}`);
}

export enum Progressive {
	P240 = 240,
	P360 = 360,
	P480 = 480,
	P720 = 720,
	P1080 = 1080
}

export enum Resolution {
	R240p = "352x240",
	R360p = "480x360",
	R480p = "858x480",
	R720p = "1280x720",
	R1080p = "1920x1080" 
}

export const mapKeyToPrice = priceKey => {
	switch (priceKey) {
		case 'tier1':
			return 19.99;
		case 'tier2':
			return 24.99;
		case 'tier3':
			return 29.99;
		default:
			return 0;
	}
}
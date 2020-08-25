import { extname } from "path";
import { IResponse } from "./interfaces/response.interface";
import * as fs from 'fs'
import * as path from 'path'
import { Level } from '@/config/constants';
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
	R480p = "852x480",
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

export const mapKeyToLanguage = langKey => {
	switch (langKey) {
		case 'english':
			return 'English';
		case 'vietnamese':
			return 'Vietnamese';
		default:
			return 'English';
	}
}

export const mapKeyToLevel = levelKey => {
	switch(levelKey) {
		case Level.Beginner:
			return 'Beginner';
		case Level.AllLevel:
			return 'All Level';
		case Level.Intermediate:
			return 'Intermediate';
		case Level.Expert:
			return 'Expert';
	}
}

export const mapStarValueToStarRangeObj = starVal => {
	if (starVal < 1) {
		return {
			rangeKey: '0-to-1',
			rangeStr: '0 to 1.0'
		};
	}
	else if (starVal < 2) {
		return {
			rangeKey: '1-to-2',
			rangeStr: '1.0 to 2.0'
		};
	}
	else if (starVal < 3) {
		return {
			rangeKey: '2-to-3',
			rangeStr: '2.0 to 3.0'
		};
	}
	else if (starVal < 4) {
		return {
			rangeKey: '3-to-4',
			rangeStr: '3.0 to 4.0'
		};
	}
	else
		return {
			rangeKey: '4-to-5',
			rangeStr: '4.0 to 5.0'
		};
}

export const mkdirRecursive = dir => {
	if (fs.existsSync(dir)) return
	const dirname = path.dirname(dir)
	mkdirRecursive(dirname);
	fs.mkdirSync(dir);
}

export const compareByScore = (a, b) => {
	const scoreA = a.numOfStudents * a.starRating
	const scoreB = b.numOfStudents * b.starRating

	let comparison = 0;
	if (scoreA > scoreB) {
		comparison = 1;
	} else if (scoreA < scoreB) {
		comparison = -1;
	}
	return comparison * -1;
}
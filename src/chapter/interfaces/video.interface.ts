import { Document } from 'mongoose';

export interface ICaption extends Document {
  _id: string;
  srcLang: string;
  label: string;
  src: string;
}

export interface IResolution extends Document {
  _id: string;
  resolution: number;
  src: string;
}

export interface IVideo extends Document {
  _id: string;
  isDownloadable: boolean;
  captions: Array<ICaption>;
  resolutions: Array<IResolution>;
}